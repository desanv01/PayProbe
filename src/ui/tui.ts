import { emitKeypressEvents } from 'node:readline';
import type { ReadStream, WriteStream } from 'node:tty';
import type { RunReport } from '../runner/types.js';
import { projectReport, formatReport } from '../reporting/report.js';
import { theme, scenarioNames, terminalText } from './theme.js';

export type LedgerState = { selected:number; filter:string; editing:string|null; evidence:boolean; offset:number };
export const initialLedgerState=():LedgerState=>({selected:0,filter:'',editing:null,evidence:false,offset:0});
const rgb=(hex:string,bg=false)=>`\x1b[${bg?48:38};2;${[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(';')}m`;
const fit=(value:unknown,width:number)=>{const s=terminalText(value);return s.length>width?s.slice(0,Math.max(0,width-1))+'…':s.padEnd(width);};

export function ledgerRows(report:RunReport,filter='') {
  const view=projectReport(report),needle=terminalText(filter).toLowerCase();
  return view.plan.scenarios.map(id=>({id,name:scenarioNames[id]??id,result:view.cases.find(c=>c.scenarioId===id)}))
    .filter(r=>`${r.id} ${r.name} ${r.result?.verdict??'PENDING'}`.toLowerCase().includes(needle));
}

export function ledgerKey(state:LedgerState,key:{name?:string;ctrl?:boolean},text:string,report:RunReport):'close'|'draw' {
  if(key.ctrl&&key.name==='c')return 'close';
  if(state.editing!==null){
    if(key.name==='escape')state.editing=null;
    else if(key.name==='return'){state.filter=state.editing;state.editing=null;state.selected=0;state.offset=0;}
    else if(key.name==='backspace')state.editing=state.editing.slice(0,-1);
    else if(!key.ctrl&&text&&[...text].every(c=>c.charCodeAt(0)>=32)&&state.editing.length<64)state.editing+=terminalText(text).slice(0,64-state.editing.length);
    return 'draw';
  }
  if(key.name==='escape'){
    if(state.evidence){state.evidence=false;state.offset=0;}
    else if(state.filter){state.filter='';state.selected=0;}
    else return 'close';
  }else if(text==='q')return 'close';
  else if(text==='/')state.editing=state.filter;
  else if(key.name==='return'){state.evidence=!state.evidence;state.offset=0;}
  else if(key.name==='down'||text==='j'){
    if(state.evidence)state.offset++;
    else state.selected=Math.min(ledgerRows(report,state.filter).length-1,state.selected+1);
  }else if(key.name==='up'||text==='k'){
    if(state.evidence)state.offset=Math.max(0,state.offset-1);
    else state.selected=Math.max(0,state.selected-1);
  }
  return 'draw';
}

export function renderLedger(report:RunReport,state:LedgerState,columns=120,height=36,color=true):string {
  const width=Math.max(40,Math.min(columns,180)),rows=Math.max(12,Math.min(height,60)),inner=width-4;
  const view=projectReport(report),visible=ledgerRows(report,state.filter);
  state.selected=Math.max(0,Math.min(state.selected,visible.length-1));
  const selected=visible[state.selected],lines:{text:string;kind?:string}[]=[];
  const add=(text='',kind='')=>lines.push({text:fit(text,width),kind});
  const cell=(text='',kind='')=>add('│ '+fit(text,inner)+' │',kind);
  const edge=(top:boolean)=>add((top?'┌':'└')+'─'.repeat(width-2)+(top?'┐':'┘'),'accent');
  add('PAYPROBE / RUN LEDGER','accent');add(`Provider: simulated | Run: ${view.id}`);
  add(`Lifecycle: ${view.state} | ${view.cases.length}/${view.plan.scenarios.length} results recorded`);
  if(state.editing!==null)add('Filter (Enter apply / Esc cancel): '+state.editing+'_','accent');
  else if(state.filter)add('Filter: '+state.filter+` / ${visible.length} matches`,'accent');
  edge(true);
  const tableBudget=rows<28?Math.min(4,visible.length):Math.min(6,visible.length);
  if(!visible.length)cell(view.plan.scenarios.length?'No cases match filter. Esc clears it.':'No scenarios in this report.');
  else {
    cell(width>=108?'ID  SCENARIO                           VERDICT':'SCENARIO / VERDICT','heading');
    const start=Math.max(0,Math.min(state.selected-Math.floor(tableBudget/2),visible.length-tableBudget));
    for(const row of visible.slice(start,start+tableBudget))cell(`${row===selected?'>':' '} ${row.id} ${fit(row.name,width>=108?34:29)} ${row.result?.verdict??'PENDING'}`,row===selected?'selected':'');
  }
  cell('─'.repeat(inner),'accent');
  const details:string[]=[];
  if(selected){
    details.push(`${state.evidence?'EVIDENCE':'SELECTED'} / ${selected.id} ${selected.name}`);
    if(state.evidence){
      const events=view.evidence.filter(e=>e.scenarioId===selected.id);
      const eventLines=events.flatMap(e=>[`${e.sequence} ${e.observedAt} ${e.source}/simulated`,`${e.action} | ${JSON.stringify(e.data)}`,`ID ${e.id}`]);
      // Wrap sanitized text into fixed columns before slicing, so long IDs remain inspectable.
      const wrapped=eventLines.flatMap(s=>{s=terminalText(s);return Array.from({length:Math.max(1,Math.ceil(s.length/inner))},(_,i)=>s.slice(i*inner,(i+1)*inner));});
      const budget=Math.max(1,rows-lines.length-6);state.offset=Math.min(state.offset,Math.max(0,wrapped.length-budget));
      details.push(...wrapped.slice(state.offset,state.offset+budget));
      if(!events.length)details.push('No recorded evidence for this case.');
    }else{
      details.push(`Verdict: ${selected.result?.verdict??'PENDING'}`);
      const reason=terminalText(selected.result?.reason??'No deterministic result recorded.');
      for(let i=0;i<reason.length;i+=inner)details.push(reason.slice(i,i+inner));
      details.push(`Evidence references: ${selected.result?.evidenceIds.length??0}`,'Enter inspects recorded events; it performs no operations.');
    }
  }else details.push('No case selected.');
  for(const detail of details.slice(0,Math.max(1,rows-lines.length-4)))cell(detail);
  while(lines.length<rows-3)cell();edge(false);
  add(state.evidence?'j/k ↑↓ scroll evidence  Enter details  Esc back  q close':'j/k ↑↓ move  Enter evidence  / filter  Esc back/clear  q close','accent');
  add(`Payment observations: simulated / adapter ${view.adapterVersion??'unknown'}`,'muted');
  return lines.slice(0,rows).map(l=>color?rgb(theme.background,true)+rgb(l.kind==='heading'?theme.background:l.kind==='muted'?theme.muted:l.kind==='accent'?theme.accent:theme.text)+(l.kind==='heading'?rgb(theme.accent,true):l.kind==='selected'?rgb(theme.selected,true):'')+l.text+'\x1b[0m':l.text).join('\n');
}

export async function showReportTui(report:RunReport,options:{input?:ReadStream;output?:WriteStream}={}):Promise<void> {
  const input=options.input??process.stdin,output=options.output??process.stdout;
  if(!input.isTTY||!output.isTTY||typeof input.setRawMode!=='function'){output.write(formatReport(report,'text')+'\n');return;}
  if((output.columns??80)<60||(output.rows??24)<18){output.write('Terminal too small for interactive view; showing text report.\n'+formatReport(report,'text')+'\n');return;}
  const state=initialLedgerState(),wasRaw=input.isRaw,wasPaused=input.isPaused();
  await new Promise<void>((resolve)=>{
    let done=false;
    const draw=()=>{try{output.write('\x1b[H'+renderLedger(report,state,output.columns,output.rows)+'\x1b[J');}catch{finish();}};
    const finish=()=>{
      if(done)return;done=true;input.off('keypress',onKey);output.off('resize',draw);process.off('SIGTERM',finish);process.off('SIGINT',finish);
      try{input.setRawMode(wasRaw);}catch{/* Restore best effort on detached terminal. */}
      if(wasPaused)input.pause();try{output.write('\x1b[0m\x1b[?25h\x1b[?1049l');}catch{/* Detached output. */}resolve();
    };
    const onKey=(text:string,key:{name?:string;ctrl?:boolean}={})=>{if(ledgerKey(state,key,text??'',report)==='close')finish();else draw();};
    try{emitKeypressEvents(input);input.setRawMode(true);input.resume();input.on('keypress',onKey);output.on('resize',draw);process.on('SIGTERM',finish);process.on('SIGINT',finish);output.write('\x1b[?1049h\x1b[?25l\x1b[2J');draw();}
    catch{finish();output.write('Interactive terminal unavailable; showing text report.\n'+formatReport(report,'text')+'\n');}
  });
}
