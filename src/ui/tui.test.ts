import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough, Writable } from 'node:stream';
import type { ReadStream,WriteStream } from 'node:tty';
import type { RunReport } from '../runner/types.js';
import { initialLedgerState, ledgerKey, renderLedger, showReportTui } from './tui.js';

const report:RunReport={id:'3e8bfc10-15ed-49d8-a62d-307990b5fe6e',state:'finished',plan:{version:'1.0',scenarios:['S1','S2','S3','S4'],amountCents:1000,currency:'USD',productId:'sample-guide',fulfillmentTimeoutMs:1000},planHash:'hash',adapterVersion:'1.0',provenance:'simulated',realPayPalVerified:false,cases:[{scenarioId:'S3',verdict:'FAIL',reason:'Repeated processing gave four entitlements.\x1b[2J',evidenceIds:['long-evidence-id']}],evidence:[{id:'long-evidence-id',sequence:1,scenarioId:'S3',source:'application',action:'observe',observedAt:'2026-11-10T03:00:00Z',provenance:'simulated',data:{entitlementCount:4}}],approvals:[]};
test('terminal frames retain selection/evidence and fit 80x24/120x36; literal filters clear stale detail',()=>{
  for(const [width,height]of [[80,24],[120,36]] as const){
    const s=initialLedgerState();ledgerKey(s,{name:'down'},'',report);ledgerKey(s,{},'j',report);
    let frame=renderLedger(report,s,width,height,false);assert.ok(frame.includes('S3 Repeated processing'));assert.ok(frame.includes('FAIL'));assert.ok(!frame.includes('\x1b'));
    assert.equal(frame.split('\n').length,height);assert.ok(frame.split('\n').every(l=>l.length<=width));
    ledgerKey(s,{name:'return'},'',report);frame=renderLedger(report,s,width,height,false);assert.ok(frame.includes('EVIDENCE / S3'));assert.ok(frame.includes('entitlementCount'));
    ledgerKey(s,{name:'escape'},'',report);ledgerKey(s,{},'/',report);ledgerKey(s,{},'nomatch',report);ledgerKey(s,{name:'return'},'',report);
    frame=renderLedger(report,s,width,height,false);assert.ok(frame.includes('No case selected'));assert.ok(!frame.includes('Repeated processing'));
    ledgerKey(s,{name:'escape'},'',report);assert.equal(s.filter,'');
  }
});
test('interactive exit restores original terminal mode and cursor',async()=>{
  const input=new PassThrough() as unknown as ReadStream;let raw=false;
  Object.assign(input,{isTTY:true,isRaw:false,setRawMode:(value:boolean)=>{raw=value;return input;}});
  let outputText='';const output=new Writable({write(chunk,_encoding,callback){outputText+=chunk.toString();callback();}}) as WriteStream;
  Object.assign(output,{isTTY:true,columns:80,rows:24});
  const running=showReportTui(report,{input,output});await new Promise<void>(resolve=>setImmediate(resolve));input.emit('keypress','q',{name:'q'});await running;
  assert.equal(raw,false);assert.ok(outputText.endsWith('\x1b[0m\x1b[?25h\x1b[?1049l'));assert.equal(input.listenerCount('keypress'),0);
});
