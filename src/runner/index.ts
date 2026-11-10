import { createHash } from 'node:crypto';
import type { Store } from '../storage/database.js';
import { approvedUnpaid, matchingCapture, oneDelivery } from '../scenarios/assertions.js';
import { RunRepository } from './repository.js';
import { AdapterError, runnerPlanSchema, type Adapter, type ApplicationObservation, type CaseResult, type Evidence, type RunnerPlan, type ScenarioId, type Verdict } from './types.js';
export * from './types.js';

type Options={store:Store;adapter:Adapter;autoApproveSimulated?:boolean};
class ApprovalPending extends Error {}
class MissingEvidence extends Error {}
// Only one executor owns a run in this process. No concurrent-run guarantee is claimed.
const active=new Set<string>();
function identity(runId:string,value:string){const hash=createHash('sha256').update(`${runId}:${value}`).digest('hex');return `${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;}

class Context {
  constructor(readonly repo:RunRepository,readonly runId:string,readonly scenario:ScenarioId,readonly plan:RunnerPlan,readonly adapter:Adapter,readonly autoApprove:boolean){}
  get group(){return this.scenario==='S4'?'B':'A';}
  get purchaseId(){return identity(this.runId,`purchase-${this.group}`);}
  event(source:Evidence['source'],action:string,data:unknown){return this.repo.evidence(this.runId,this.scenario,source,action,data);}
  async step<T>(name:string,source:Evidence['source'],fn:()=>Promise<T>,mutation=false):Promise<T>{
    const saved=this.repo.step(this.runId,this.scenario,name);
    if(saved?.state==='done')return saved.data as T;
    // Interrupted capture requests must be observed/reconciled, never blindly resent.
    if(saved?.state==='pending' && name==='capture'){
      const current=await this.adapter.observe(this.purchaseId);
      if(!current.providerOrderId)throw new MissingEvidence('Interrupted capture has no provider order identity');
      const payment=await this.adapter.observeProvider(current.providerOrderId);this.event('provider','resume-capture-observation',payment);
      if(!matchingCapture(payment,current,this.plan))throw new MissingEvidence('Interrupted capture outcome is not established; capture was not retried');
      const data=await this.adapter.reconcile(this.purchaseId);this.event('application','resume-target-reconcile',data);
      this.repo.saveStep(this.runId,this.scenario,name,'done',data);return data as T;
    }
    if(mutation)this.repo.saveStep(this.runId,this.scenario,name,'pending');
    const data=await fn();this.event(source,name,data);this.repo.saveStep(this.runId,this.scenario,name,'done',data);return data;
  }
  async prepare(){
    await this.step('create','application',()=>this.adapter.create({purchaseId:this.purchaseId,operationId:identity(this.runId,`create-${this.group}`),amountCents:this.plan.amountCents,currency:this.plan.currency,productId:this.plan.productId,...(this.plan.fixtureMode?{fixtureMode:this.plan.fixtureMode}:{})}),true);
    const current=await this.adapter.observe(this.purchaseId);
    if(!current.providerOrderId)throw new MissingEvidence('Provider order identity unavailable');
    let payment=await this.adapter.observeProvider(current.providerOrderId);this.event('provider','approval-status',payment);
    if(payment.status==='CREATED'){
      if(!this.autoApprove){this.repo.saveStep(this.runId,this.scenario,'approval-needed','waiting',{purchaseId:this.purchaseId,approvalUrl:current.approvalUrl});throw new ApprovalPending();}
      payment=await this.step('simulated-approval','provider',()=>this.adapter.approveSimulated(current.providerOrderId!),true);
    }
    this.repo.saveStep(this.runId,this.scenario,'approval-needed','done',null);
    return {application:current,payment};
  }
  async observe(name:string){
    const application=await this.adapter.observe(this.purchaseId);this.event('application',`${name}-application`,application);
    if(!application.providerOrderId)throw new MissingEvidence('Provider order identity unavailable');
    const payment=await this.adapter.observeProvider(application.providerOrderId);this.event('provider',`${name}-provider`,payment);
    const download=await this.adapter.checkDownload(this.purchaseId);this.event('application',`${name}-download`,download);
    return {application,payment,download};
  }
  async fulfilled(name:string){
    const deadline=Date.now()+this.plan.fulfillmentTimeoutMs;
    let observed=await this.observe(name);
    while(!oneDelivery(observed.application,observed.download.accessible) && observed.application.entitlementCount<=1 && Date.now()<deadline){
      await new Promise(resolve=>setTimeout(resolve,Math.min(100,Math.max(0,deadline-Date.now()))));observed=await this.observe(name);
    }
    return observed;
  }
  result(verdict:Verdict,reason:string):CaseResult{return {scenarioId:this.scenario,verdict,reason,evidenceIds:this.repo.report(this.runId).evidence.filter(e=>e.scenarioId===this.scenario).map(e=>e.id)};}
}

async function executeCase(c:Context):Promise<CaseResult>{
  const {application,payment}=await c.prepare();
  if(c.scenario==='S1'){
    if(!approvedUnpaid(payment,application,c.plan))return c.result('INCONCLUSIVE','Approved unpaid precondition was not established before buyer return');
    await c.step('buyer-return','application',()=>c.adapter.buyerReturn(c.purchaseId),true);
    const after=await c.observe('after-return');
    if(!approvedUnpaid(after.payment,after.application,c.plan))return c.result('INCONCLUSIVE','Approved unpaid state was not preserved for the assertion');
    return after.application.entitlementCount===0 && !after.application.downloadAccessible && !after.download.accessible
      ?c.result('PASS','Simulated approval without capture did not grant delivery'):c.result('FAIL','Delivery was granted without a completed matching capture');
  }
  if(c.scenario==='S4'){
    if(!approvedUnpaid(payment,application,c.plan) && !c.repo.step(c.runId,c.scenario,'capture'))return c.result('INCONCLUSIVE','Approved unpaid precondition unavailable for response suppression');
    await c.step('arm-fault','fault',()=>c.adapter.armFault(c.purchaseId),true);
    const saved=c.repo.step(c.runId,c.scenario,'capture');
    if(!saved){
      c.repo.saveStep(c.runId,c.scenario,'capture','pending');
      try { const response=await c.adapter.capture(c.purchaseId,identity(c.runId,'capture-B'));c.event('application','capture-returned',response);c.repo.saveStep(c.runId,c.scenario,'capture','done',{suppressed:false}); }
      catch(error){
        if(!(error instanceof AdapterError) || error.code!=='capture_response_suppressed')throw error;
        c.event('fault','capture-response-suppressed',{code:error.code,status:error.status});c.repo.saveStep(c.runId,c.scenario,'capture','done',{suppressed:true});
      }
    }
    const uncertain=await c.step('uncertain-observation','application',()=>c.adapter.observe(c.purchaseId));
    if(!uncertain.providerOrderId)throw new MissingEvidence('Missing provider order');
    const truth=await c.step('suppressed-provider-observation','provider',()=>c.adapter.observeProvider(uncertain.providerOrderId!));
    if(!uncertain.fault.fired || !matchingCapture(truth,uncertain,c.plan))return c.result('INCONCLUSIVE','Fault firing and independently completed matching capture were not both established');
    if(uncertain.state!=='capture_uncertain' || uncertain.entitlementCount!==0 || uncertain.downloadAccessible)return c.result('FAIL','Target did not preserve an unpaid uncertain state after losing the capture response');
    await c.step('target-reconcile','application',()=>c.adapter.reconcile(c.purchaseId),true);
    const final=await c.fulfilled('after-reconcile');
    if(!matchingCapture(final.payment,final.application,c.plan) || final.payment.captures[0]!.id!==truth.captures[0]!.id)return c.result('INCONCLUSIVE','Existing completed capture identity could not be confirmed');
    return oneDelivery(final.application,final.download.accessible)?c.result('PASS','Target reconciled the existing simulated capture and delivered once'):c.result('FAIL','Target reconciliation failed to deliver exactly once within the declared interval');
  }
  // S2/S3 share order A. If S3 is selected alone it establishes its own paid precondition.
  await c.step('capture','application',()=>c.adapter.capture(c.purchaseId,identity(c.runId,'capture-A')),true);
  const paid=await c.fulfilled('after-capture');
  if(!matchingCapture(paid.payment,paid.application,c.plan))return c.result('INCONCLUSIVE','Independent completed matching capture is unavailable');
  if(!oneDelivery(paid.application,paid.download.accessible))return c.result('FAIL','Completed matching capture did not yield exactly one accessible entitlement within the declared interval');
  if(c.scenario==='S2')return c.result('PASS','Independent simulated completed capture matched one accessible entitlement');
  const captureId=paid.payment.captures[0]!.id;
  for(let repeat=1;repeat<=3;repeat++){
    await c.step(`process-again-${repeat}`,'application',()=>c.adapter.processAgain(c.purchaseId),true);
    const observed=await c.observe(`repeat-${repeat}`);
    if(!matchingCapture(observed.payment,observed.application,c.plan) || observed.payment.captures[0]!.id!==captureId)return c.result('INCONCLUSIVE','Provider capture identity changed or became unavailable during repeats');
    if(!oneDelivery(observed.application,observed.download.accessible))return c.result('FAIL',`Repeated processing ${repeat} violated single accessible entitlement`);
  }
  return c.result('PASS','Three sequential target processing calls preserved one entitlement and the same simulated capture');
}

const requirements:Record<ScenarioId,string[]>={S1:['handle_buyer_return'],S2:['capture'],S3:['capture','process_again'],S4:['capture','arm_fault','reconcile']};
export async function run(options:Options & {plan:RunnerPlan}){
  const plan=runnerPlanSchema.parse(options.plan),repo=new RunRepository(options.store),runId=repo.create(plan);
  return resume({...options,runId});
}
export function report(store:Store,runId:string){return new RunRepository(store).report(runId);}
export async function resume(options:Options & {runId:string}){
  if(active.has(options.runId))throw new Error('Run already executing');active.add(options.runId);
  const repo=new RunRepository(options.store),initial=repo.report(options.runId);
  try {
    if(initial.state==='finished')return initial;
    repo.state(initial.id,'running');
    const capabilities=await options.adapter.capabilities();
    repo.version(initial.id,capabilities.version);
    for(const scenario of ['S1','S2','S3','S4'] as const){
      if(!initial.plan.scenarios.includes(scenario) || initial.cases.some(c=>c.scenarioId===scenario))continue;
      const c=new Context(repo,initial.id,scenario,initial.plan,options.adapter,options.autoApproveSimulated??false);
      const missing=['create_order','observe_application','check_download',...requirements[scenario]].filter(cap=>!capabilities.capabilities.includes(cap));
      if(capabilities.version!=='1.0' || missing.length){repo.result(initial.id,c.result('UNSUPPORTED',capabilities.version!=='1.0'?'Unsupported adapter version':`Missing capabilities: ${missing.join(', ')}`));continue;}
      try {repo.result(initial.id,await executeCase(c));}
      catch(error){
        if(error instanceof ApprovalPending){repo.state(initial.id,'awaiting_approval');return repo.report(initial.id);}
        const absent=error instanceof MissingEvidence || error instanceof AdapterError && ['invalid_adapter_observation','adapter_transport_unavailable'].includes(error.code);
        const unsupported=error instanceof AdapterError && [404,405,501].includes(error.status);
        c.event('runner','execution-boundary',{code:error instanceof AdapterError?error.code:error instanceof MissingEvidence?'missing_evidence':'execution_error'});
        repo.result(initial.id,c.result(unsupported?'UNSUPPORTED':absent?'INCONCLUSIVE':'ERROR',error instanceof MissingEvidence?error.message:unsupported?'Required adapter hook unavailable':absent?'Essential observations could not be retrieved':'Scenario execution failed; inspect sanitized boundary evidence'));
      }
    }
    repo.state(initial.id,'finished');return repo.report(initial.id);
  } catch(error){repo.state(initial.id,'error');throw error;}
  finally {active.delete(options.runId);}
}
