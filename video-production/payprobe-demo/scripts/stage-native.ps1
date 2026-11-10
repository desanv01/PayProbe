param([string]$CaptureRoot='.private/payprobe-video-capture')
$ErrorActionPreference='Stop'
$project=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$takes=@(
 @{name='native-execute';source='native-execute.mp4';start=0.8;duration=20;crop='960:420:0:0';alias='EXECUTION-C'},
 @{name='native-faulty-overview';source='native-faulty.mp4';start=2;duration=6;crop='960:420:0:0';alias='FAULTY-A'},
 @{name='native-faulty-evidence';source='native-faulty.mp4';start=8;duration=22;crop='960:420:0:160';alias='FAULTY-A'},
 @{name='native-corrected-overview';source='native-corrected.mp4';start=2;duration=8;crop='960:420:0:0';alias='CORRECTED-B'},
 @{name='native-corrected-evidence';source='native-corrected.mp4';start=10;duration=14;crop='960:420:0:120';alias='CORRECTED-B'},
 @{name='native-s4-overview';source='native-s4.mp4';start=2;duration=5;crop='960:420:0:0';alias='CORRECTED-B'},
 @{name='native-s4-evidence';source='native-s4.mp4';start=7;duration=21;crop='960:420:0:120';alias='CORRECTED-B'},
 @{name='native-api';source='direct-live-api.mp4';start=13.5;duration=15;crop='960:420:0:0';alias='FAULTY-A'},
 @{name='native-export';source='native-export.mp4';start=4;duration=3;crop='960:420:0:0';alias='FAULTY-A'}
)
$provenance=@()
foreach($take in $takes){
 $inputFile=Join-Path $CaptureRoot $take.source
 $outputFile=Join-Path $project "assets/cli/$($take.name).mp4"
 ffmpeg -hide_banner -loglevel error -y -ss $take.start -i $inputFile -t $take.duration -vf "crop=$($take.crop)" -an -c:v libx264 -crf 18 -preset fast -pix_fmt yuv420p $outputFile
 if($LASTEXITCODE -ne 0){throw "Native capture crop failed: $($take.name)"}
 $provenance+=@{asset="assets/cli/$($take.name).mp4";kind='literal dedicated console-window screen recording';sourceRange=@($take.start,($take.start+$take.duration));crop=$take.crop;publicAlias=$take.alias;identifierMasking=$false;syntheticFixtureIdsVisible=$true;changes='time excerpt and actual-pixel crop only; no fabricated UI or outcome'}
}
[IO.File]::WriteAllText((Join-Path $project 'assets/cli/NATIVE-PROVENANCE.json'),($provenance|ConvertTo-Json -Depth 7),(New-Object Text.UTF8Encoding($false)))
$map=Get-Content -LiteralPath (Join-Path $project 'assets/cli/capture-map.json') -Raw | ConvertFrom-Json
$map.execute=@(@{src='assets/cli/native-execute.mp4';at=0;duration=20;sourceStart=0;native=$true})
$map.faulty=@(@{src='assets/cli/native-faulty-overview.mp4';at=0;duration=6;sourceStart=0;native=$true},@{src='assets/cli/native-faulty-evidence.mp4';at=6;duration=22;sourceStart=0;native=$true})
$map.corrected=@(@{src='assets/cli/native-corrected-overview.mp4';at=0;duration=8;sourceStart=0;native=$true},@{src='assets/cli/native-corrected-evidence.mp4';at=8;duration=14;sourceStart=0;native=$true})
$map.recovery=@(@{src='assets/cli/native-s4-overview.mp4';at=0;duration=5;sourceStart=0;native=$true},@{src='assets/cli/native-s4-evidence.mp4';at=5;duration=21;sourceStart=0;native=$true})
$map.explain=@(@{src='assets/cli/native-api.mp4';at=0;duration=15;sourceStart=0;native=$true},@{src='assets/cli/native-export.mp4';at=15;duration=3;sourceStart=0;native=$true})
[IO.File]::WriteAllText((Join-Path $project 'assets/cli/capture-map.json'),($map|ConvertTo-Json -Depth 8),(New-Object Text.UTF8Encoding($false)))
Write-Output 'Staged ten actual native-screen excerpts; main CLI slot durations unchanged.'
