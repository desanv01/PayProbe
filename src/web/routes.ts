import { randomBytes } from 'node:crypto';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AppError, capabilities } from '../core/schemas.js';
import { generatePlan, reviewPlan, loadSavedPlan, type SavedPlan, type JsonClient } from '../ai/planner.js';
import type { RunReport } from '../runner/types.js';
import { projectReport } from '../reporting/report.js';
import { demoPage, demoStyle, demoScript } from './page.js';

export interface DemoUiDependencies {
  client:JsonClient;
  start:(reviewed:SavedPlan)=>Promise<RunReport>;
  resume:(id:string)=>Promise<RunReport>;
  report:(id:string)=>RunReport|Promise<RunReport>;
  approve:(run:RunReport,purchaseId:string)=>Promise<void>;
  doctor:()=>{deepseekKeyPresent:boolean};
}
type Session={id:string;csrf:string;expires:number;plans:number;runs:Set<string>;draft:SavedPlan|null;busy:boolean;lastRun:string|null};

/** Fixed-target, bounded UI adapter. P1 exempts ONLY /demo and /demo/* from its admin bearer hook. */
export function registerDemoUi(app:FastifyInstance,deps:DemoUiDependencies) {
  const sessions=new Map<string,Session>();let active=0;
  const cookie='payprobe_demo';const ttl=60*60*1000;
  function get(request:FastifyRequest):Session {
    const value=request.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookie+'='))?.slice(cookie.length+1);
    const session=value?sessions.get(value):undefined;
    if(!session||session.expires<Date.now())throw new AppError('demo_session_expired',401);
    return session;
  }
  function csrf(request:FastifyRequest,session:Session) {
    const origin=request.headers.origin;
    let matches=false;try{matches=Boolean(origin&&new URL(origin).host===request.headers.host);}catch{/* Invalid Origin is rejected below. */}
    if(!matches||request.headers['x-payprobe-csrf']!==session.csrf)throw new AppError('demo_request_rejected',403);
  }
  async function mutate<T>(request:FastifyRequest,action:(session:Session)=>Promise<T>):Promise<T>{
    const session=get(request);csrf(request,session);
    if(session.busy||active>=4)throw new AppError('demo_busy',429);
    session.busy=true;active++;try{return await action(session);}finally{session.busy=false;active--;}
  }
  const owned=(s:Session,id:string)=>{if(!s.runs.has(id))throw new AppError('demo_run_not_found',404);return id;};
  // Approval URLs lead to admin-protected routes; the UI uses only its session-owned action.
  const view=(run:RunReport)=>({...projectReport(run),approvals:run.approvals.map(a=>({purchaseId:a.purchaseId,approvalUrl:null,action:'Approve this simulated purchase in the current demo session.'}))});
  const secure=(reply:FastifyReply)=>reply.header('Cache-Control','no-store').header('X-Content-Type-Options','nosniff').header('Referrer-Policy','no-referrer');
  app.get('/demo',async(_request,reply)=>secure(reply).header('Content-Security-Policy',"default-src 'none'; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'").type('text/html').send(demoPage));
  app.get('/demo/style.css',async(_request,reply)=>secure(reply).type('text/css').send(demoStyle));
  app.get('/demo/app.js',async(_request,reply)=>secure(reply).type('text/javascript').send(demoScript));
  app.get('/demo/session',async(request,reply)=>{
    secure(reply);let session:Session;
    try{session=get(request);}catch{
      for(const [id,s] of sessions)if(s.expires<Date.now())sessions.delete(id);
      if(sessions.size>=16)throw new AppError('demo_capacity_reached',429);
      session={id:randomBytes(24).toString('hex'),csrf:randomBytes(24).toString('hex'),expires:Date.now()+ttl,plans:0,runs:new Set(),draft:null,busy:false,lastRun:null};sessions.set(session.id,session);
      reply.header('Set-Cookie',`${cookie}=${session.id}; HttpOnly; SameSite=Strict; Path=/demo; Max-Age=3600${request.protocol==='https'?'; Secure':''}`);
    }
    return {provider:'simulated',csrf:session.csrf,doctor:{deepseekKeyPresent:deps.doctor().deepseekKeyPresent},run:session.lastRun?view(await deps.report(session.lastRun)):null};
  });
  app.post('/demo/plan',async(request,reply)=>{secure(reply);return mutate(request,async s=>{
    const body=z.object({requirements:z.string().trim().min(1).max(4000),fixtureMode:z.enum(['corrected','premature_fulfillment','duplicate_processing'])}).strict().parse(request.body);
    if(s.plans>=2)throw new AppError('demo_plan_limit',429);s.plans++;
    const saved=await generatePlan(deps.client,{...body,purchase:{amountCents:1000,currency:'USD',productId:'sample-guide'},fulfillmentTimeoutMs:1000,adapter:{version:'1.0',capabilities:[...capabilities]}});s.draft=saved;return saved;
  });});
  app.post('/demo/review',async(request,reply)=>{secure(reply);return mutate(request,async s=>{
    const {hash}=z.object({hash:z.string().regex(/^[a-f0-9]{64}$/)}).strict().parse(request.body);
    if(!s.draft||s.draft.hash!==hash)throw new AppError('plan_hash_mismatch',409);
    s.draft=reviewPlan(s.draft);return {reviewed:true,hash};
  });});
  app.post('/demo/runs',async(request,reply)=>{secure(reply);return mutate(request,async s=>{
    z.object({}).strict().parse(request.body);if(!s.draft)throw new AppError('plan_review_required',409);
    if(s.runs.size>=2)throw new AppError('demo_run_limit',429);
    const saved=loadSavedPlan(s.draft,true);s.draft=null;
    const run=await deps.start(saved);s.runs.add(run.id);s.lastRun=run.id;return view(run);
  });});
  app.get('/demo/runs/:id',async(request,reply)=>{secure(reply);const s=get(request),{id}=z.object({id:z.string().uuid()}).parse(request.params);return view(await deps.report(owned(s,id)));});
  app.post('/demo/runs/:id/resume',async(request,reply)=>{secure(reply);return mutate(request,async s=>{
    z.object({}).strict().parse(request.body);const {id}=z.object({id:z.string().uuid()}).parse(request.params);return view(await deps.resume(owned(s,id)));
  });});
  app.post('/demo/runs/:id/approve',async(request,reply)=>{secure(reply);return mutate(request,async s=>{
    const {id}=z.object({id:z.string().uuid()}).parse(request.params),{purchaseId}=z.object({purchaseId:z.string().uuid()}).strict().parse(request.body);
    const run=await deps.report(owned(s,id));if(run.state!=='awaiting_approval'||!run.approvals.some(a=>a.purchaseId===purchaseId))throw new AppError('demo_approval_not_pending',409);
    await deps.approve(run,purchaseId);return view(await deps.resume(id));
  });});
}
