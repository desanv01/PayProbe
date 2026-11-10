import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,readFile,rm,writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Command } from 'commander';
import { capabilities } from '../core/schemas.js';
import { Store } from '../storage/database.js';
import { RunRepository } from '../runner/repository.js';
import type { RunReport } from '../runner/types.js';
import { generatePlan,loadSavedPlan,reviewPlan,toRunnerPlan,type JsonClient } from './planner.js';
import { ReviewedPlanStore } from './review-store.js';
import { explainReport } from './explainer.js';
import { formatReport } from '../reporting/report.js';
import { registerWorkflowCommands } from '../cli/commands/index.js';
import { buildServer } from '../api/server.js';
import { HttpAdapter } from '../adapters/http.js';
import { run } from '../runner/index.js';

const contract={requirements:'One download only after completed capture; token=private-value',purchase:{amountCents:500},adapter:{version:'1.0',capabilities:[...capabilities]}};
function client(data:unknown):JsonClient {return {json:async(_system,_input,schema)=>({data:schema.parse(data),metadata:{provider:'test-double',requestedModel:'none',returnedModel:'none',usage:undefined,attempts:1,thinking:'disabled'}})};}
async function draft(){return generatePlan(client({scenarios:[{id:'S1',rationale:'Approval must not fulfill.'},{id:'S2',rationale:'Capture fulfills once.'}]}),contract);}
function report():RunReport {return {id:'run-1',state:'paused',plan:toRunnerPlan({version:'1.0',provider:'simulated',provenance:'simulated',contract,selection:{scenarios:[{id:'S1',rationale:'test'},{id:'S2',rationale:'test'}]}}),planHash:'hash',adapterVersion:'1.0',provenance:'simulated',realPayPalVerified:false,cases:[{scenarioId:'S1',verdict:'INCONCLUSIVE',reason:'Capture observation absent',evidenceIds:['run-1:1']}],evidence:[{id:'run-1:1',sequence:1,scenarioId:'S1',source:'application',action:'observe',observedAt:new Date().toISOString(),provenance:'simulated',data:{entitlementCount:null,downloadToken:'never-export',apiKey:'private',downloadAccessible:false}}],approvals:[]};}

test('planner validates capabilities/dependencies; review hash binds unchanged plan',async()=>{
  const saved=await draft();assert.equal(saved.review,null);assert.ok(!JSON.stringify(saved).includes('private-value'));
  assert.throws(()=>loadSavedPlan(saved,true),/review_required/);
  const reviewed=reviewPlan(saved);assert.equal(loadSavedPlan(reviewed,true).hash,saved.hash);
  const changed=structuredClone(reviewed);changed.plan.contract.purchase.amountCents=600;
  assert.throws(()=>loadSavedPlan(changed,true),/hash_mismatch/);
  await assert.rejects(()=>generatePlan(client({scenarios:[{id:'S3',rationale:'repeat'}]}),contract),/requires_S2/);
  await assert.rejects(()=>generatePlan(client({scenarios:[{id:'S4',rationale:'lost response'}]}),{...contract,adapter:{version:'1.0',capabilities:['create_order']}}),/missing_/);
});
test('reviewed source persists and cannot attach to a different executed plan',async()=>{
  const store=new Store(':memory:');try {
    const reviewed=reviewPlan(await draft()),reviews=new ReviewedPlanStore(store),repo=new RunRepository(store);
    reviews.save(reviewed);const runId=repo.create(toRunnerPlan(reviewed.plan));reviews.attach(runId,reviewed);
    assert.equal(reviews.forRun(runId)?.hash,reviewed.hash);
    const other=repo.create({...toRunnerPlan(reviewed.plan),amountCents:600});assert.throws(()=>reviews.attach(other,reviewed),/mismatch/);
  } finally {store.close();}
});
test('reports retain missing truth; explanation requires grounded scenario evidence',async()=>{
  const input=report(),json=formatReport(input,'json'),text=formatReport(input);
  assert.ok(!json.includes('never-export'));assert.ok(!json.includes('private'));assert.ok(json.includes('INCONCLUSIVE'));assert.ok(text.includes('S2 PENDING'));
  const good={explanations:[{scenarioId:'S1',evidenceIds:['run-1:1'],explanation:'The capture observation is missing.',hypotheses:[]}]};
  const explained=await explainReport(client(good),input);assert.equal(explained.deterministicCases[0]?.verdict,'INCONCLUSIVE');
  await assert.rejects(()=>explainReport(client({explanations:[{...good.explanations[0],evidenceIds:['made-up']}]}),input),/invalid_evidence/);
  await assert.rejects(()=>explainReport(client({explanations:[{...good.explanations[0],scenarioId:'S2'}]}),input),/invalid_scenario/);
  await assert.rejects(()=>explainReport(client(good),{...input,evidence:[]}),/requires_recorded/);
});
test('CLI requires explicit saved review and runs without requesting AI',async()=>{
  const dir=await mkdtemp(join(process.cwd(),'.payprobe-test-p3-'));try {
    const path=join(dir,'draft.json'),reviewedPath=join(dir,'reviewed.json');await writeFile(path,JSON.stringify(await draft()));
    let calls=0;const outputs:string[]=[];
    const make=()=>registerWorkflowCommands(new Command().exitOverride(),{client:()=>{throw new Error('unexpected_AI_call');},run:async(plan,options)=>{calls++;assert.equal(options.reviewedPlan.review?.accepted,true);assert.equal(plan.amountCents,500);return report();},resume:async()=>report(),report:()=>report(),output:s=>outputs.push(s)});
    await assert.rejects(()=>make().parseAsync(['node','payprobe','run',path]),/review_required/);assert.equal(calls,0);
    await make().parseAsync(['node','payprobe','plan','--review',path,'--out',reviewedPath]);
    loadSavedPlan(JSON.parse(await readFile(reviewedPath,'utf8')),true);
    await make().parseAsync(['node','payprobe','run',reviewedPath]);assert.equal(calls,1);assert.ok(outputs.at(-1)?.includes('simulated'));
  } finally {await rm(dir,{recursive:true,force:true});}
});
test('reviewed AI selection connects through HTTP execution to report and grounded explanation',async()=>{
  const store=new Store(':memory:');
  const {app}=buildServer({PAYPROBE_DB_PATH:':memory:',PAYPROBE_HOST:'127.0.0.1',PAYPROBE_PORT:4310,PAYPROBE_PUBLIC_URL:'http://sample.test',PAYPROBE_PROVIDER:'simulated',DEEPSEEK_MODEL:'deepseek-flash'},store);
  try {
    const transport:typeof fetch=async(input,init)=>{const url=new URL(String(input));const response=await app.inject({method:init?.method==='POST'?'POST':'GET',url:url.pathname+url.search,headers:init?.headers as Record<string,string>,...(init?.body?{payload:String(init.body)}:{})});return new Response(response.body,{status:response.statusCode,headers:{'content-type':'application/json'}});};
    const saved=reviewPlan(await generatePlan(client({scenarios:['S1','S2','S3','S4'].map(id=>({id,rationale:`Check ${id} requirement`}))}),{...contract,fulfillmentTimeoutMs:0}));
    const reviews=new ReviewedPlanStore(store);reviews.save(saved);
    const result=await run({store,adapter:new HttpAdapter({baseUrl:'http://sample.test',fetch:transport}),plan:toRunnerPlan(saved.plan),autoApproveSimulated:true});
    reviews.attach(result.id,saved);assert.equal(reviews.forRun(result.id)?.hash,saved.hash);
    assert.deepEqual(result.cases.map(c=>c.verdict),['PASS','PASS','PASS','PASS']);
    const explained=await explainReport(client({explanations:result.cases.map(c=>({scenarioId:c.scenarioId,evidenceIds:c.evidenceIds.slice(0,1),explanation:`Recorded simulated observations support ${c.scenarioId}.`,hypotheses:[]}))}),result);
    assert.equal(explained.explanations.length,4);assert.ok(formatReport(result,'json').includes('realPayPalVerified'));
  } finally {await app.close();store.close();}
});
test('four-scenario explanation stays concise without echoing or dropping long evidence lists',async()=>{
  const input=report(),ids=['S1','S2','S3','S4'] as const;
  input.state='finished';input.plan.scenarios=[...ids];
  let sequence=0;
  input.evidence=ids.flatMap((scenarioId,index)=>Array.from({length:[7,6,18,11][index]!},()=>({
    ...input.evidence[0]!,scenarioId,sequence:++sequence,id:`81d0fcb9-efe2-4a6b-898a-45f62f053f1d:${sequence}`,data:{entitlementCount:1,provenance:'simulated'},
  })));
  input.cases=ids.map(scenarioId=>({scenarioId,verdict:'PASS',reason:'Recorded observations establish the simulated assertion.',evidenceIds:input.evidence.filter(e=>e.scenarioId===scenarioId).map(e=>e.id)}));
  const compact={explanations:input.cases.map(c=>({scenarioId:c.scenarioId,evidenceIds:c.evidenceIds.slice(0,2),explanation:c.reason,hypotheses:[]}))};
  let observedRequest=false;
  const inspectingClient:JsonClient={json:async(system,payload,schema,example,attempts)=>{
    observedRequest=true;
    const context=payload as {cases:RunReport['cases'];evidence:RunReport['evidence'];omittedEvidence:number};
    assert.equal(context.cases.find(c=>c.scenarioId==='S3')?.evidenceIds.length,18);
    assert.equal(context.evidence.length,42);assert.equal(context.omittedEvidence,0);assert.equal(attempts,2);
    assert.match(system,/at most 240 characters/);assert.match(system,/only 1 or 2 actual relevant/);assert.match(system,/empty for PASS/);assert.match(system,/1200 output tokens/);
    const sample=example as typeof compact;
    assert.equal(sample.explanations.length,4);assert.ok(sample.explanations.every(e=>e.evidenceIds.length<=2&&e.explanation.length<=240&&e.hypotheses.length===0));
    const expensive=structuredClone(compact);expensive.explanations[2]!.evidenceIds=[...input.cases[2]!.evidenceIds];assert.equal(schema.safeParse(expensive).success,false);
    const verbose=structuredClone(compact);verbose.explanations[0]!.explanation='x'.repeat(241);assert.equal(schema.safeParse(verbose).success,false);
    const hypothesis=(text:string)=>({explanations:[{...compact.explanations[0],hypotheses:[{text,evidenceIds:compact.explanations[0]!.evidenceIds}]}]});
    assert.equal(schema.safeParse(hypothesis('x'.repeat(161))).success,false);
    const duplicateHypotheses=hypothesis('Possible cause');duplicateHypotheses.explanations[0]!.hypotheses.push({text:'Another possible cause',evidenceIds:compact.explanations[0]!.evidenceIds});assert.equal(schema.safeParse(duplicateHypotheses).success,false);
    return client(compact).json(system,payload,schema,example,attempts);
  }};
  const explained=await explainReport(inspectingClient,input);
  assert.ok(observedRequest);assert.equal(explained.explanations.length,4);assert.deepEqual(explained.deterministicCases,input.cases);
  assert.deepEqual(explained.context,{suppliedEvidenceCount:42,omittedEvidenceCount:0,omittedScenarioIds:[]});
  await assert.rejects(()=>explainReport(client({explanations:compact.explanations.slice(0,1)}),input),/missing_scenario/);
});
