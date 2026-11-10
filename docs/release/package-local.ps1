[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [ValidatePattern('^[a-f0-9]{40}$')]
  [string]$Revision,
  [switch]$VerifyRemote
)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
if ($root -ne (Get-Location).Path -or -not [IO.File]::Exists((Join-Path $root 'package.json'))) {
  throw 'Run packaging from the PayProbe workspace root.'
}
if (([IO.File]::ReadAllText((Join-Path $root 'package.json')) | ConvertFrom-Json).name -ne 'payprobe') { throw 'Expected PayProbe package.' }
$outputRoot = Join-Path $root '.private/release'
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

# Public source boundaries, not a workspace archive. No dist, environment, DB,
# dependencies, private data, design previews, or captured payment artifacts.
$paths = @('package.json','package-lock.json','tsconfig.json','.env.example','.gitignore','LICENSE','README.md','examples/download-contract.json',
  'docs/release/SETUP.md','docs/release/CHECKLIST.md','docs/release/CONTRIBUTING-LIMITATIONS.md','docs/release/LOCAL-DELIVERY.md','docs/release/package-local.ps1',
  'docs/release/deploy/Dockerfile','docs/release/deploy/Dockerfile.dockerignore','docs/release/deploy/compose.yaml','docs/release/deploy/env.example')
foreach ($directory in @('src','tests')) {
  $boundary = Join-Path $root $directory
  foreach ($file in Get-ChildItem -LiteralPath $boundary -File -Recurse -Filter '*.ts') {
    $paths += $file.FullName.Substring($root.Length + 1).Replace('\','/')
  }
}
$paths = @($paths | Sort-Object -Unique)
$remoteFiles = @{}
if ($VerifyRemote) {
  $commit = gh api "repos/desanv01/PayProbe/git/commits/$Revision" | ConvertFrom-Json
  if ($LASTEXITCODE -ne 0 -or $commit.sha -ne $Revision) { throw 'Could not verify selected remote commit.' }
  $remoteTree = gh api "repos/desanv01/PayProbe/git/trees/$($commit.tree.sha)?recursive=1" | ConvertFrom-Json
  if ($LASTEXITCODE -ne 0 -or $remoteTree.truncated -or $remoteTree.sha -ne $commit.tree.sha) { throw 'Could not read complete selected remote tree.' }
  foreach ($entry in $remoteTree.tree) {
    if ($entry.type -eq 'blob') { $remoteFiles[$entry.path] = $entry.sha }
    if ($entry.type -eq 'blob' -and $entry.path -match '^(src|tests)/.*\.ts$' -and $paths -notcontains $entry.path) {
      throw "Local package is missing remote source: $($entry.path)"
    }
  }
}
foreach ($path in $paths) {
  $full = [IO.Path]::GetFullPath((Join-Path $root $path))
  if (-not $full.StartsWith($root + '\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Allowlist path escaped workspace.' }
  if (-not [IO.File]::Exists($full)) { throw "Required public input missing: $path" }
  # Refuse junctions/symlinks anywhere along the selected file's path.
  $item = Get-Item -LiteralPath $full
  while ($item.FullName -ne $root) {
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw "Linked input rejected: $path" }
    if ($item -is [IO.FileInfo]) { $item = $item.Directory } else { $item = $item.Parent }
  }
}
foreach ($line in [IO.File]::ReadAllLines((Join-Path $root '.env.example'))) {
  if ($line.Trim() -and -not $line.TrimStart().StartsWith('#') -and $line -notmatch '^\s*[A-Z][A-Z0-9_]*=\s*$') {
    throw 'Public .env.example must contain blank values only.'
  }
}
# Every relative Markdown link must resolve inside the selected public package.
foreach ($path in $paths | Where-Object { $_ -like '*.md' }) {
  $document = [IO.File]::ReadAllText((Join-Path $root $path))
  foreach ($match in [regex]::Matches($document,'\[[^\]]*\]\(([^)]+)\)')) {
    $target = $match.Groups[1].Value.Trim().Trim('<','>')
    if ($target -match '^[a-zA-Z][a-zA-Z0-9+.-]*:' -or $target.StartsWith('#')) { continue }
    $target = [Uri]::UnescapeDataString(($target -split '[#?]',2)[0])
    if (-not $target) { continue }
    $resolved = [IO.Path]::GetFullPath((Join-Path (Split-Path (Join-Path $root $path)) $target))
    if (-not $resolved.StartsWith($root + '\',[StringComparison]::OrdinalIgnoreCase)) { throw "Markdown link escaped package: $path" }
    $relative = $resolved.Substring($root.Length+1).Replace('\','/')
    if ($paths -notcontains $relative) { throw "Packaged Markdown link is missing: $path -> $relative" }
  }
}
Add-Type -AssemblyName System.IO.Compression
$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')
$name = "payprobe-simulated-$($Revision.Substring(0,12))-$stamp-$([guid]::NewGuid().ToString('N').Substring(0,8)).zip"
$archivePath = Join-Path $outputRoot $name
$stream = [IO.File]::Open($archivePath,[IO.FileMode]::CreateNew)
$zip = New-Object IO.Compression.ZipArchive($stream,[IO.Compression.ZipArchiveMode]::Create,$false)
$hashes = @()
$complete = $false
try {
  foreach ($path in $paths) {
    $bytes = [IO.File]::ReadAllBytes((Join-Path $root $path))
    $sha = [Security.Cryptography.SHA256]::Create()
    try { $digest = [BitConverter]::ToString($sha.ComputeHash($bytes)).Replace('-','').ToLowerInvariant() } finally { $sha.Dispose() }
    if ($VerifyRemote) {
      $prefix = [Text.Encoding]::UTF8.GetBytes("blob $($bytes.Length)`0")
      [byte[]]$blob = $prefix + $bytes
      $gitHash = [Security.Cryptography.SHA1]::Create()
      try { $gitBlob = [BitConverter]::ToString($gitHash.ComputeHash($blob)).Replace('-','').ToLowerInvariant() } finally { $gitHash.Dispose() }
      if (-not $remoteFiles.ContainsKey($path) -or $gitBlob -ne $remoteFiles[$path]) {
        throw "Package bytes differ from selected remote commit: $path"
      }
    }
    $hashes += @{path=$path;sha256=$digest;bytes=$bytes.Length}
    $entry = $zip.CreateEntry($path)
    $entryStream = $entry.Open()
    try { $entryStream.Write($bytes,0,$bytes.Length) } finally { $entryStream.Dispose() }
  }
  # Catch concurrent edits during collection rather than labeling mixed input final.
  foreach ($item in $hashes) {
    if ((Get-FileHash -LiteralPath (Join-Path $root $item.path) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $item.sha256) {
      throw "Input changed during packaging; rebuild candidate after integration: $($item.path)"
    }
  }
  $packageStatus = if ($VerifyRemote) { 'remote-matched-source-package' } else { 'local-source-candidate' }
  $revisionLimit = if ($VerifyRemote) { 'Every allowlisted file matches its Git blob at the selected remote commit.' } else { 'Revision is operator-supplied; file hashes identify actual packaged bytes.' }
  $manifest = @{version='1.0';provider='simulated';realPayPalVerified=$false;status=$packageStatus;
    sourceRevisionHint=$Revision;revisionVerifiedAgainstRemote=[bool]$VerifyRemote;createdAtUtc=$stamp;files=$hashes;
    limitations=@($revisionLimit,'Clean-install and runtime UI acceptance are separate release gates.','No secrets, dependencies, databases or private run artifacts included.')}
  $entry = $zip.CreateEntry('PACKAGE-MANIFEST.json')
  $writer = New-Object IO.StreamWriter($entry.Open(),(New-Object Text.UTF8Encoding($false)))
  try { $writer.Write(($manifest | ConvertTo-Json -Depth 8)) } finally { $writer.Dispose() }
  $complete = $true
} finally {
  $zip.Dispose(); $stream.Dispose()
  if (-not $complete) { Remove-Item -LiteralPath $archivePath }
}
$archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash.ToLowerInvariant()
[IO.File]::WriteAllText($archivePath + '.sha256',"$archiveHash  $name`n",(New-Object Text.UTF8Encoding($false)))
[pscustomobject]@{archive=$archivePath;sha256=$archiveHash;publicSourceFiles=$paths.Count;status=$packageStatus;provider='simulated'} | ConvertTo-Json
