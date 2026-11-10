import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../api/server.js';
import { Store } from '../storage/database.js';
import { HttpAdapter } from '../adapters/http.js';
import { run, resume, runnerPlanSchema, type RunnerPlan } from './index.js';
import { RunRepository } from './repository.js';

async function fixture(){
  const store=new Store(':memory:');
  const {app}=buildServer({PAYPROBE_DB_PATH:':memory:',PAYPROBE_HOST:'127.0.0.1',PAYPROBE_PORT:4310,PAYPROBE_PUBLIC_URL:'http://sample.test',PAYPROBE_PROVIDER:'simulated',DEEPSEEK_MODEL:'deepseek-flash'},store);
  await app.ready();
  // Real route/schema/serialization boundary, without importing target decision logic.
  const transport:typeof fetch=async(input,init)=>{
    const url=new URL(String(input));
    const response=await app.inject({method:init?.method==='POST'?'POST':'GET',url:url.pathname+url.search,headers:init?.headers as Record<string,string>,...(init?.body?{payload:String(init.body)}:{})});
    return new Response(response.body,{status:response.statusCode,headers:{'content-type':'application/json'}});
  };
  const adapter=new HttpAdapter({baseUrl:'http://sample.test',fetch:transport});
  return {store,adapter,app,close:async()=>{await app.close();store.close();}};
}
function plan(extra:Partial<RunnerPlan>={}){return runnerPlanSchema.parse({version:'1.0',scenarios:['S1','S2','S3','S4'],fulfillmentTimeoutMs:0,...extra});}

test('corrected HTTP workflow establishes all four simulated assertions using two purchases',async()=>{
  const f=await fixture();try{
    const result=await run({...f,plan:plan(),autoApproveSimulated:true});
    assert.equal(result.state,'finished');assert.deepEqual(result.cases.map(c=>c.verdict),['PASS','PASS','PASS','PASS']);
    assert.equal(result.approvals.length,0);
    assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM orders').get()!.n,2);
    assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM entitlements').get()!.n,2);
    assert.ok(result.evidence.some(e=>e.action==='capture-response-suppressed'&&e.source==='fault'));
    assert.ok(result.cases.every(c=>c.evidenceIds.length>0));
    assert.deepEqual(await resume({...f,runId:result.id}),result);
  }finally{await f.close();}
});
test('seeded premature and duplicate delivery faults are observed as failures',async()=>{
  const f=await fixture();try{
    const premature=await run({...f,plan:plan({scenarios:['S1'],fixtureMode:'premature_fulfillment'}),autoApproveSimulated:true});
    assert.equal(premature.cases[0]!.verdict,'FAIL');
    const duplicate=await run({...f,plan:plan({scenarios:['S2','S3'],fixtureMode:'duplicate_processing'}),autoApproveSimulated:true});
    assert.equal(duplicate.cases[0]!.verdict,'PASS');assert.equal(duplicate.cases[1]!.verdict,'FAIL');
  }finally{await f.close();}
});
test('manual simulated approval resumes persisted identities without creating another purchase',async()=>{
  const f=await fixture();try{
    const waiting=await run({...f,plan:plan({scenarios:['S1','S2']})});
    assert.equal(waiting.state,'awaiting_approval');assert.equal(waiting.approvals.length,1);assert.equal(waiting.cases.length,0);
    const order=await f.adapter.observe(waiting.approvals[0]!.purchaseId);await f.adapter.approveSimulated(order.providerOrderId!);
    const done=await resume({...f,runId:waiting.id});
    assert.deepEqual(done.cases.map(c=>c.verdict),['PASS','PASS']);assert.equal(done.approvals.length,0);
    assert.equal(f.store.db.prepare('SELECT COUNT(*) AS n FROM orders').get()!.n,1);
  }finally{await f.close();}
});
test('missing hooks, unavailable provider evidence and execution rejection remain distinct',async()=>{
  const f=await fixture();try{
    const original=f.adapter.capabilities.bind(f.adapter);
    f.adapter.capabilities=async()=>({...await original(),capabilities:[]});
    assert.equal((await run({...f,plan:plan({scenarios:['S1']})})).cases[0]!.verdict,'UNSUPPORTED');
    f.adapter.capabilities=original;
    const observe=f.adapter.observeProvider.bind(f.adapter);
    f.adapter.observeProvider=async()=>{throw new (await import('./types.js')).AdapterError('invalid_adapter_observation',502);};
    assert.equal((await run({...f,plan:plan({scenarios:['S1']}),autoApproveSimulated:true})).cases[0]!.verdict,'INCONCLUSIVE');
    f.adapter.observeProvider=observe;
    f.adapter.buyerReturn=async()=>{throw new (await import('./types.js')).AdapterError('rejected',409);};
    assert.equal((await run({...f,plan:plan({scenarios:['S1']}),autoApproveSimulated:true})).cases[0]!.verdict,'ERROR');
  }finally{await f.close();}
});
test('interrupted capture resumes by observing and asking target to reconcile, never recaptures',async()=>{
  const f=await fixture();try{
    const waiting=await run({...f,plan:plan({scenarios:['S2']})});
    const id=waiting.approvals[0]!.purchaseId,order=await f.adapter.observe(id);
    await f.adapter.approveSimulated(order.providerOrderId!);
    await f.adapter.armFault(id);
    // Model a process exit after mutation intent persisted and the provider accepted capture.
    const repo=new RunRepository(f.store);repo.saveStep(waiting.id,'S2','capture','pending');
    await assert.rejects(()=>f.adapter.capture(id,'a1b2c3d4-1234-4567-a123-123456789abc'));
    let captureRequests=0;
    f.adapter.capture=async()=>{captureRequests++;throw new Error('Blind recapture forbidden');};
    const done=await resume({...f,runId:waiting.id});
    assert.equal(captureRequests,0);assert.equal(done.cases[0]!.verdict,'PASS');
    assert.ok(done.evidence.some(e=>e.action==='resume-capture-observation'));
    assert.ok(done.evidence.some(e=>e.action==='resume-target-reconcile'));
    assert.equal((await f.adapter.observeProvider(order.providerOrderId!)).captures.length,1);
  }finally{await f.close();}
});
