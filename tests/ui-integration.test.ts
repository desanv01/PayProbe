import test from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../src/api/server.js';
import type { Config } from '../src/core/config.js';
import { ReviewedPlanStore } from '../src/ai/review-store.js';

test('production demo wiring preserves admin boundary and session review with two explicit simulated approvals',async()=>{
  const token='synthetic-admin-canary';
  const config:Config={DEEPSEEK_MODEL:'deepseek-flash',PAYPROBE_PROVIDER:'simulated',PAYPROBE_HOST:'127.0.0.1',PAYPROBE_PORT:4310,PAYPROBE_PUBLIC_URL:'http://127.0.0.1:4310',PAYPROBE_DB_PATH:':memory:',PAYPROBE_API_TOKEN:token};
  const {app,ai,db}=buildServer(config);
  let modelCalls=0;
  ai.json=async(_system,_input,schema)=>{
    modelCalls++;
    return {data:schema.parse({scenarios:['S1','S2','S3','S4'].map(id=>({id,rationale:'Synthetic production-wiring check.'}))}),metadata:{provider:'deepseek',requestedModel:'synthetic',returnedModel:'synthetic',usage:undefined,attempts:1,thinking:'disabled'}};
  };
  try {
    assert.equal((await app.inject('/demo')).statusCode,200);
    assert.equal((await app.inject('/demo?view=setup')).statusCode,200);
    for(const url of ['/demoevil','/demo-evil/session','/api/doctor','/adapter/capabilities']) assert.equal((await app.inject(url)).statusCode,401);
    const session=await app.inject('/demo/session');
    const cookie=String(session.headers['set-cookie']).split(';')[0]!;
    const headers={cookie,host:'demo.test',origin:'http://demo.test','x-payprobe-csrf':session.json().csrf};
    assert.equal(JSON.stringify(session.json()).includes(token),false);
    const send=(url:string,payload:unknown)=>app.inject({method:'POST',url,headers,payload});
    assert.equal((await app.inject({method:'POST',url:'/demo/plan',headers:{cookie},payload:{requirements:'synthetic',fixtureMode:'corrected'}})).statusCode,403);
    const draft=await send('/demo/plan',{requirements:'Check all four cases.',fixtureMode:'corrected'});
    assert.equal(draft.statusCode,200);
    assert.equal((await send('/demo/runs',{})).statusCode,400);
    assert.equal((await send('/demo/review',{hash:draft.json().hash})).statusCode,200);
    let response=await send('/demo/runs',{});
    assert.equal(response.statusCode,200);
    const id=response.json().id;
    assert.ok(new ReviewedPlanStore(db).forRun(id));
    for(let approval=0;approval<2;approval++) {
      const run=response.json();
      assert.equal(run.state,'awaiting_approval');
      assert.equal(run.approvals[0].approvalUrl,null);
      response=await send(`/demo/runs/${id}/approve`,{purchaseId:run.approvals[0].purchaseId});
      assert.equal(response.statusCode,200);
    }
    assert.equal(response.json().state,'finished');
    assert.deepEqual(response.json().cases.map((item:{verdict:string})=>item.verdict),['PASS','PASS','PASS','PASS']);
    assert.equal(response.json().realPayPalVerified,false);
    assert.equal(JSON.stringify(response.json()).includes(token),false);
    assert.equal(modelCalls,1);
    const other=await app.inject('/demo/session');
    assert.equal((await app.inject({url:`/demo/runs/${id}`,headers:{cookie:String(other.headers['set-cookie']).split(';')[0]!}})).statusCode,404);
    assert.equal((await app.inject({url:'/api/doctor',headers:{authorization:`Bearer ${token}`}})).statusCode,200);
  } finally {await app.close();}
});
