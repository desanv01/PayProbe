import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { buildServer } from '../api/server.js';
import { Store } from '../storage/database.js';
import { HttpAdapter } from '../adapters/http.js';
import { resume,report } from '../runner/index.js';
import { RunRepository } from '../runner/repository.js';
import { ReviewedPlanStore } from '../ai/review-store.js';
import { toRunnerPlan,type JsonClient } from '../ai/planner.js';
import { AppError } from '../core/schemas.js';
import { registerDemoUi } from './routes.js';

test('browser session plan/review/explicit simulated approval connects to actual four-case engine',async()=>{
  const store=new Store(':memory:'),backend=buildServer({PAYPROBE_DB_PATH:':memory:',PAYPROBE_HOST:'127.0.0.1',PAYPROBE_PORT:4310,PAYPROBE_PUBLIC_URL:'http://target.test',PAYPROBE_PROVIDER:'simulated',DEEPSEEK_MODEL:'deepseek-flash'},store);
  const transport:typeof fetch=async(input,init)=>{const u=new URL(String(input)),r=await backend.app.inject({method:init?.method==='POST'?'POST':'GET',url:u.pathname+u.search,headers:init?.headers as Record<string,string>,...(init?.body?{payload:String(init.body)}:{})});return new Response(r.body,{status:r.statusCode,headers:{'content-type':'application/json'}});};
  const adapter=new HttpAdapter({baseUrl:'http://target.test',fetch:transport}),app=Fastify();
  app.setErrorHandler((e,_req,reply)=>reply.code(e instanceof AppError?e.statusCode:400).send({error:e instanceof AppError?e.code:'invalid_input'}));
  const client:JsonClient={json:async(_system,_input,schema)=>({data:schema.parse({scenarios:['S1','S2','S3','S4'].map(id=>({id,rationale:'Check '+id}))}),metadata:{provider:'test-double',requestedModel:'none',returnedModel:'none',attempts:1,thinking:'disabled',usage:undefined}})};
  registerDemoUi(app,{client,doctor:()=>({deepseekKeyPresent:true}),start:async saved=>{const reviews=new ReviewedPlanStore(store);reviews.save(saved);const id=new RunRepository(store).create(toRunnerPlan(saved.plan));reviews.attach(id,saved);return resume({store,adapter,runId:id});},resume:id=>resume({store,adapter,runId:id}),report:id=>report(store,id),approve:async(run,purchaseId)=>{assert.ok(run.approvals.some(a=>a.purchaseId===purchaseId));const observed=await adapter.observe(purchaseId);await adapter.approveSimulated(observed.providerOrderId!);}});
  try{
    const session=await app.inject({url:'/demo/session',headers:{host:'demo.test'}}),body=session.json();
    const cookie=String(session.headers['set-cookie']).split(';')[0]!;
    const headers={host:'demo.test',origin:'http://demo.test',cookie,'x-payprobe-csrf':body.csrf};
    const request=(url:string,payload:unknown={})=>app.inject({method:'POST',url,headers,payload:payload as Record<string,unknown>});
    assert.equal((await app.inject({method:'POST',url:'/demo/plan',headers:{host:'demo.test',cookie},payload:{}})).statusCode,403);
    const plan=await request('/demo/plan',{requirements:'Require one entitlement and recover uncertainty.',fixtureMode:'duplicate_processing'});assert.equal(plan.statusCode,200,plan.body);assert.equal(plan.json().review,null);
    assert.equal((await request('/demo/runs')).statusCode,400);
    assert.equal((await request('/demo/review',{hash:plan.json().hash})).statusCode,200);
    let run=(await request('/demo/runs')).json();assert.equal(run.state,'awaiting_approval');assert.equal(run.approvals[0].approvalUrl,null);
    let approvals=0;while(run.state==='awaiting_approval'&&approvals<3){run=(await request('/demo/runs/'+run.id+'/approve',{purchaseId:run.approvals[0].purchaseId})).json();approvals++;}
    assert.equal(approvals,2);assert.equal(run.state,'finished');assert.deepEqual(run.cases.map((c:{verdict:string})=>c.verdict),['PASS','PASS','FAIL','PASS']);assert.ok(run.evidence.every((e:{provenance:string})=>e.provenance==='simulated'));
    const other=await app.inject({url:'/demo/session',headers:{host:'demo.test'}});
    assert.equal((await app.inject({url:'/demo/runs/'+run.id,headers:{host:'demo.test',cookie:String(other.headers['set-cookie']).split(';')[0]!}})).statusCode,404);
    assert.equal((await request('/demo/plan',{requirements:'x',fixtureMode:'corrected',targetUrl:'http://external.test'})).statusCode,400);
  }finally{await app.close();await backend.app.close();store.close();}
});
