param([Parameter(Mandatory = $true)][ValidatePattern('^[a-f0-9]{40}$')][string]$Revision)
$ErrorActionPreference = 'Stop'
# One release rehearsal, explicit public revision, entirely inside this workspace.
# No local checkout changes, paid API request, user env file, or PayPal operation.
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$directory = Join-Path $workspace ('.payprobe-test-p5-install-' + [guid]::NewGuid().ToString('N'))
$serverProcess = $null
$priorLocation = Get-Location
$names = @('DEEPSEEK_API_KEY','PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET','PAYPAL_MERCHANT_ID',
  'PAYPROBE_PROVIDER','PAYPROBE_HOST','PAYPROBE_PORT','PAYPROBE_PUBLIC_URL','PAYPROBE_DB_PATH','PAYPROBE_API_TOKEN')
$priorEnvironment = @{}
foreach ($name in $names) { $priorEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
try {
  New-Item -ItemType Directory -Path $directory | Out-Null
  $archive = Join-Path $directory 'source.zip'
  Invoke-WebRequest -Uri "https://codeload.github.com/desanv01/PayProbe/zip/$Revision" -OutFile $archive
  $zip = [IO.Compression.ZipFile]::OpenRead($archive)
  try {
    foreach ($entry in $zip.Entries) {
      $destination = [IO.Path]::GetFullPath((Join-Path $directory $entry.FullName))
      if (-not $destination.StartsWith($directory + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Archive entry escapes rehearsal directory'
      }
    }
  } finally { $zip.Dispose() }
  [IO.Compression.ZipFile]::ExtractToDirectory($archive, $directory)
  $source = Join-Path $directory "PayProbe-$Revision"
  if (-not (Test-Path -LiteralPath (Join-Path $source 'package-lock.json'))) { throw 'Expected frozen source missing' }
  foreach ($name in @('DEEPSEEK_API_KEY','PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET','PAYPAL_MERCHANT_ID')) {
    [Environment]::SetEnvironmentVariable($name, '', 'Process')
  }
  $portListener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
  $portListener.Start(); $port = $portListener.LocalEndpoint.Port; $portListener.Stop()
  $env:PAYPROBE_PROVIDER = 'simulated'; $env:PAYPROBE_HOST = '127.0.0.1'
  $env:PAYPROBE_PORT = [string]$port; $env:PAYPROBE_PUBLIC_URL = "http://127.0.0.1:$port"
  $env:PAYPROBE_DB_PATH = Join-Path $directory 'rehearsal.sqlite'
  $env:PAYPROBE_API_TOKEN = 'p5-clean-install-test-only'
  Set-Location -LiteralPath $source
  & npm.cmd ci --no-audit --no-fund
  if ($LASTEXITCODE -ne 0) { throw 'Clean npm ci failed' }
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'Clean build failed' }
  $doctorText = (& node dist/cli/index.js doctor | Out-String)
  if ($LASTEXITCODE -ne 0) { throw 'Compiled doctor failed' }
  $doctor = $doctorText | ConvertFrom-Json
  if ($doctor.provider -ne 'simulated' -or $doctor.credentials.deepseek -or $doctor.credentials.paypal) {
    throw 'Unexpected rehearsal provider or credential presence'
  }
  $serverProcess = Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList @('dist/cli/index.js','serve') `
    -WorkingDirectory $source -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $directory 'server.stdout') -RedirectStandardError (Join-Path $directory 'server.stderr')
  $ready = $false
  for ($attempt = 0; $attempt -lt 100; $attempt++) {
    if ($serverProcess.HasExited) { throw 'Compiled backend exited before readiness' }
    try { $health = Invoke-RestMethod "$env:PAYPROBE_PUBLIC_URL/health" -TimeoutSec 1; $ready = $true; break }
    catch { Start-Sleep -Milliseconds 100 }
  }
  if (-not $ready -or $health.provider -ne 'simulated') { throw 'Compiled backend not ready' }
  $page = Invoke-WebRequest "$env:PAYPROBE_PUBLIC_URL/demo"
  if ($page.StatusCode -ne 200 -or -not $page.Content.Contains('SIMULATED PAYMENTS')) { throw 'Compiled demo unavailable' }
  $session = Invoke-RestMethod "$env:PAYPROBE_PUBLIC_URL/demo/session"
  if ($session.provider -ne 'simulated' -or $session.doctor.deepseekKeyPresent) { throw 'Unexpected public readiness response' }
  [ordered]@{ revision=$Revision; install='PASS'; build='PASS'; compiledDoctor='PASS'; compiledHealth='PASS';
    compiledDemo='PASS'; paymentProvenance='simulated'; modelCalls=0; paypalCalls=0; hostedAccessVerified=$false } | ConvertTo-Json
} finally {
  if ($serverProcess -and -not $serverProcess.HasExited) { Stop-Process -Id $serverProcess.Id; $serverProcess.WaitForExit() }
  Set-Location -LiteralPath $priorLocation.Path
  foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $priorEnvironment[$name], 'Process') }
  $resolvedDirectory = [IO.Path]::GetFullPath($directory)
  if (-not $resolvedDirectory.StartsWith($workspace + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Refusing cleanup outside workspace'
  }
  if (Test-Path -LiteralPath $resolvedDirectory) { Remove-Item -LiteralPath $resolvedDirectory -Recurse -Force }
}
