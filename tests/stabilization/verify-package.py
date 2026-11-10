"""Check one frozen public-source ZIP without extracting it or executing its files."""
import argparse
import hashlib
import json
import posixpath
import re
import zipfile
from pathlib import Path

FIXED = {
    'package.json', 'package-lock.json', 'tsconfig.json', '.gitignore', '.env.example', 'LICENSE', 'README.md',
    'examples/download-contract.json', 'docs/release/SETUP.md', 'docs/release/CHECKLIST.md',
    'docs/release/CONTRIBUTING-LIMITATIONS.md', 'docs/release/LOCAL-DELIVERY.md',
    'docs/release/package-local.ps1', 'docs/release/deploy/Dockerfile',
    'docs/release/deploy/Dockerfile.dockerignore', 'docs/release/deploy/compose.yaml',
    'docs/release/deploy/env.example',
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def tree(path):
    data = json.loads(Path(path).read_text(encoding='utf-8-sig'))
    require(not data.get('truncated'), 'Remote tree response is truncated')
    return {item['path']: item['sha'] for item in data['tree'] if item['type'] == 'blob'}


def blob_sha(content):
    return hashlib.sha1(f'blob {len(content)}\0'.encode() + content).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', required=True)
    parser.add_argument('--revision', required=True)
    parser.add_argument('--remote-tree', required=True)
    parser.add_argument('--baseline-tree')
    args = parser.parse_args()
    require(re.fullmatch('[a-f0-9]{40}', args.revision), 'Expected a frozen 40-character revision')
    archive = Path(args.archive)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    sidecar = Path(str(archive) + '.sha256').read_text(encoding='utf-8-sig').strip().split(maxsplit=1)
    require(sidecar == [digest, archive.name], 'ZIP SHA256 sidecar does not match bytes/name')
    remote = tree(args.remote_tree)
    with zipfile.ZipFile(archive) as zipped:
        names = zipped.namelist()
        require(len(names) == len(set(names)), 'ZIP has duplicate entries')
        require(zipped.testzip() is None, 'ZIP CRC integrity failed')
        for name in names:
            require(not name.startswith('/') and '\\' not in name and ':' not in name and
                    all(part not in ('', '.', '..') for part in name.split('/')), 'Unsafe archive path')
            require(name == 'PACKAGE-MANIFEST.json' or name in FIXED or
                    (name.startswith(('src/', 'tests/')) and name.endswith('.ts')), 'Entry outside explicit public allowlist')
        require(set(FIXED).issubset(names), 'Required public package input missing')
        # All runtime/test TS inputs at the chosen remote revision must be present.
        expected_ts = {name for name in remote if name.startswith(('src/', 'tests/')) and name.endswith('.ts')}
        require(expected_ts <= set(names), 'ZIP omits remote TypeScript inputs')
        manifest = json.loads(zipped.read('PACKAGE-MANIFEST.json'))
        require(manifest['provider'] == 'simulated' and manifest['realPayPalVerified'] is False,
                'Payment provenance missing from manifest')
        require(manifest['sourceRevisionHint'] == args.revision, 'Manifest revision hint mismatch')
        require(manifest.get('revisionVerifiedAgainstRemote') is True and
                manifest.get('status') == 'remote-matched-source-package', 'Final manifest is not remote-verified')
        records = manifest['files']
        require(len(records) == len({item['path'] for item in records}), 'Manifest duplicates input paths')
        require({item['path'] for item in records} == set(names) - {'PACKAGE-MANIFEST.json'},
                'Manifest/archive file sets differ')
        for item in records:
            content = zipped.read(item['path'])
            require(len(content) == item['bytes'], 'Manifest file byte count mismatch')
            require(hashlib.sha256(content).hexdigest() == item['sha256'], 'Manifest file SHA256 mismatch')
            require(remote.get(item['path']) == blob_sha(content), 'Packaged bytes differ from frozen remote source')
        for name in ('.env.example', 'docs/release/deploy/env.example'):
            for line in zipped.read(name).decode().splitlines():
                require(not line.strip() or line.lstrip().startswith('#') or
                        re.fullmatch(r'\s*[A-Z][A-Z0-9_]*=\s*', line), 'Nonblank credential template value')
        checked_links = 0
        for name in names:
            if not name.endswith('.md'):
                continue
            for link in re.findall(r'\[[^\]]*\]\(([^)]+)\)', zipped.read(name).decode()):
                target = link.strip().strip('<>').split('#', 1)[0].split('?', 1)[0]
                if not target or re.match(r'^[A-Za-z][A-Za-z0-9+.-]*:', target):
                    continue
                destination = posixpath.normpath(posixpath.join(posixpath.dirname(name), target))
                require(destination in names, 'Packaged Markdown link target missing')
                checked_links += 1
        changes = []
        if args.baseline_tree:
            baseline = tree(args.baseline_tree)
            changes = sorted(name for name in names if name.startswith('src/') or
                             name in {'package.json', 'package-lock.json', 'tsconfig.json'})
            changes = [name for name in changes if remote.get(name) != baseline.get(name)]
        print(json.dumps({'revision': args.revision, 'archiveSha256': digest,
                          'publicSourceFiles': len(records), 'localMarkdownLinks': checked_links,
                          'allowlistIntegrity': 'PASS', 'manifestHashes': 'PASS',
                          'remoteBlobEquality': 'PASS', 'credentialTemplatesBlank': True,
                          'runtimeChangesSinceBaseline': changes,
                          'paymentProvenance': 'simulated', 'modelCalls': 0, 'paypalCalls': 0}, indent=2))


if __name__ == '__main__':
    main()
