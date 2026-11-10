# Frozen source artifact acceptance

Date: 2026-11-10. Result: **PASS** for source-package integrity and local documentation closure. Payments are explicitly simulated. This does not establish public hosted access, real PayPal verification, eligibility or submission readiness. Video work remains on hold.

| Frozen input | Verified value |
| --- | --- |
| Source revision | `32e036d3cae80a915625319140ffdfc01b736e6d` |
| Stable publication filename | `PayProbe-v0.1.0-simulated-source.zip` |
| ZIP SHA256 | `9858c0759b8754272bda7956db96d7d6d88e51869cc5bcb9c487e11127ee84f3` |
| Public source files | 52, plus `PACKAGE-MANIFEST.json` |
| Resolved local Markdown links | 4 |
| Prior clean-install source | `68ce006942e6ee2525ca45def61ab0e99b5cbeb8` |

## Independent checks actually run

P5's standard-library verifier checked the original final ZIP against a separately fetched complete Git tree for the frozen commit:

- ZIP SHA256 matches the sidecar and its artifact filename; CRC integrity passes, no duplicate/unsafe entry paths.
- Every input is inside the explicit public allowlist: named metadata/docs/templates and TypeScript files under `src/` or `tests/`. Required `.gitignore`, blank credential templates, portable packaging script, license, sample contract and setup/release docs are present. No dependency directory, build output, database, private artifact or credential file is included.
- Manifest file set exactly equals the archive inputs. All 52 byte counts and SHA256 hashes match. Every packaged file's computed Git blob hash equals the selected remote source blob, and the complete published runtime/test TypeScript set is present. The manifest also truthfully reports `revisionVerifiedAgainstRemote: true`, `remote-matched-source-package` and simulated provenance.
- Every relative Markdown link in the selected docs resolves inside the ZIP. Essential README links to setup, release gates and limitations resolve. The packaging script's former workspace-rules-file dependency was removed by P6; the script is now included.
- The stable publication-name copy was hashed independently and has the same ZIP SHA256; its checksum sidecar names that stable file correctly.

The comparison read public Git metadata and local ZIP bytes. It did not load credentials, extract or execute archive contents, make a model/PayPal call, run a broad suite or perform video work. The private original filename and machine paths are intentionally omitted from this public record.

## Install decision

The prior clean remote-source install already passed dependency installation, TypeScript build, compiled doctor, health and demo/session startup. Against that revision, the final package has four changed runtime/test inputs:

- `package.json`: stabilization test discovery changed to the TypeScript test glob; dependencies and build command are unchanged.
- `src/cli/index.ts`: CLI description text changed.
- `src/ui/tui.ts`: waits one event-loop turn before entering the alternate screen so the SQLite startup warning cannot corrupt its first draw. P4 already verified the actual native-terminal fix.
- `src/ui/tui.test.ts`: the key event waits for that asynchronous setup.

The lockfile, dependency declarations, TypeScript build configuration and runtime file set are unchanged; all required source inputs are present and exactly match the frozen commit. Browser assets remain embedded in the TypeScript module. These changes introduce no material package-specific install gap, so another install/build/recovery suite was not repeated.

## Reproduction and limits

`tests/stabilization/verify-package.py` accepts `--archive`, `--revision`, `--remote-tree` and optional `--baseline-tree`. Tree inputs are complete GitHub Git Trees JSON responses fetched for the selected frozen commit and comparison baseline. The script prints public hashes/counts and changed input names without machine paths. It needs Python's standard library only. It is a manual artifact gate, not a recurring runtime suite or paid API probe.

Main owns release publication. This report and verifier are outside the package selection and do not change the frozen source ZIP. Previous local process, runtime UI, simulated payment and actual DeepSeek evidence remain separately attributed in the acceptance matrix. No public deployment or video was verified here.
