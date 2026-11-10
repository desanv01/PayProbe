param([string]$Only='')
$ErrorActionPreference='Stop'
$project=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
Add-Type -AssemblyName System.Speech
Add-Type -ReferencedAssemblies System.Speech -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Speech.Synthesis;
using System.Speech.AudioFormat;
public class PreviewWord { public string text; public double start; public int position; public int count; }
public class PreviewNarrator {
 public List<PreviewWord> words = new List<PreviewWord>();
 public double end=0;
 public void Say(string text,string path,int rate) {
  using(var synth=new SpeechSynthesizer()) {
   synth.SelectVoice("Microsoft Zira Desktop"); synth.Rate=rate;
   synth.SpeakProgress += (s,e)=>words.Add(new PreviewWord{text=e.Text,start=e.AudioPosition.TotalSeconds,position=e.CharacterPosition,count=e.CharacterCount});
   synth.BookmarkReached += (s,e)=>{if(e.Bookmark=="END")end=e.AudioPosition.TotalSeconds;};
   synth.SetOutputToWaveFile(path,new SpeechAudioFormatInfo(48000,AudioBitsPerSample.Sixteen,AudioChannel.Mono));
   var prompt=new PromptBuilder();prompt.AppendText(text);prompt.AppendBookmark("END");synth.Speak(prompt);
  }
 }
}
'@
$script=Get-Content -LiteralPath (Join-Path $project 'SCRIPT.json') -Raw | ConvertFrom-Json
$voices=@()
if($Only -and (Test-Path -LiteralPath (Join-Path $project 'audio_meta.json'))){$voices=@((Get-Content -LiteralPath (Join-Path $project 'audio_meta.json') -Raw|ConvertFrom-Json).voices)}
foreach($scene in $script){
 if($Only -and ($Only -split ',') -notcontains $scene.id){continue}
 $raw=Join-Path $project "assets/audio/voice/$($scene.id).sapi.wav"
 $final=Join-Path $project "assets/audio/voice/$($scene.id).wav"
 $rate=0
 do{
  $narrator=New-Object PreviewNarrator
  $narrator.Say($scene.text,$raw,$rate)
  $seconds=[double](ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $raw)
  if($seconds -le ($scene.duration-1)){break}
  $rate++
 }while($rate -le 3)
 if($seconds -gt ($scene.duration-0.6)){throw "Narration exceeds slot: $($scene.id)"}
 ffmpeg -hide_banner -loglevel error -y -i $raw -af 'loudnorm=I=-16:TP=-1.5:LRA=8' -ar 48000 $final
 if($LASTEXITCODE -ne 0){throw 'Narration normalization failed'}
 $voices=@($voices|Where-Object{$_.id -ne $scene.id})
 if($narrator.end -le 0){throw 'Missing native end bookmark for word alignment'}
 $scale=$seconds/$narrator.end
 $voices+=@{id=$scene.id;path="assets/audio/voice/$($scene.id).wav";duration=$seconds;start=($scene.start+0.4);rate=$rate;text=$scene.text;alignment=@{method='native SAPI progress and end bookmark aligned to measured WAV duration';nativeEnd=$narrator.end;scale=$scale};words=@($narrator.words|ForEach-Object{@{text=$_.text;start=($_.start*$scale);nativeStart=$_.start;position=$_.position;count=$_.count}})}
 Write-Output "$($scene.id): $([Math]::Round($seconds,2))s, rate $rate, $($narrator.words.Count) actual word marks"
}
$meta=@{provider='local Microsoft Speech API';voice='Microsoft Zira Desktop';language='en-US';synthetic=$true;cloned=$false;voices=@($voices|Sort-Object start)}
[IO.File]::WriteAllText((Join-Path $project 'audio_meta.json'),($meta|ConvertTo-Json -Depth 8),(New-Object Text.UTF8Encoding($false)))
