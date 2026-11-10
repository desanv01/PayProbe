import Fastify from 'fastify';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { credentialPresence, type Config } from '../core/config.js';
import { adapterVersion, capabilities, purchaseSchema, operationSchema, fixtureModeSchema, AppError } from '../core/schemas.js';
import { Store } from '../storage/database.js';
import { SimulatedProvider } from '../providers/simulated.js';
import { DeepSeekClient,safeDeepSeekDiagnostics } from '../providers/deepseek.js';
import { SampleStore } from '../sample-store/service.js';

export function buildServer(config: Config, suppliedStore?: Store) {
  const db = suppliedStore ?? new Store(config.PAYPROBE_DB_PATH);
  const provider = new SimulatedProvider(db,config.PAYPROBE_PUBLIC_URL);
  const target = new SampleStore(db,provider), ai = new DeepSeekClient(config);
  const app = Fastify({ logger:false,bodyLimit:32768 });
  app.addHook('onRequest',async (request,reply) => {
    if (request.url === '/health') return;
    if (config.PAYPROBE_API_TOKEN) {
      const actual = Buffer.from(request.headers.authorization ?? ''), expected = Buffer.from(`Bearer ${config.PAYPROBE_API_TOKEN}`);
      if (actual.length !== expected.length || !timingSafeEqual(actual,expected)) return reply.code(401).send({error:'unauthorized'});
    }
  });
  app.setErrorHandler((error,_request,reply) => {
    if (error instanceof z.ZodError) return reply.code(400).send({error:'invalid_input',fields:error.issues.map(i=>i.path.join('.'))});
    if (error instanceof AppError) return reply.code(error.statusCode).send({error:error.code,provenance:'simulated',...safeDeepSeekDiagnostics(error)});
    return reply.code(500).send({error:'internal_error'});
  });
  app.get('/health',async()=>({ok:true,provider:'simulated',realPayPalVerified:false}));
  app.get('/api/doctor',async()=>({node:process.version,credentials:credentialPresence(config),provider:'simulated',provenance:'simulated',paypalRequired:false,realPayPalVerified:false,uiApproval:'pending'}));
  app.post('/api/deepseek/probe',async()=>ai.probe());
  app.get('/adapter/capabilities',async()=>({version:adapterVersion,capabilities,provider:'simulated',provenance:'simulated'}));
  app.post('/adapter/orders',async(request)=>{
    const body = purchaseSchema.extend({operationId:z.string().uuid(),fixtureMode:fixtureModeSchema.default('corrected')}).parse(request.body);
    const {operationId,fixtureMode,...input} = body; return target.create(input,operationId,fixtureMode);
  });
  const idFrom = (params: unknown) => z.object({id:z.string().uuid()}).parse(params).id;
  app.get('/adapter/orders/:id',async(request)=>target.observe(idFrom(request.params)));
  app.post('/adapter/orders/:id/buyer-return',async(request)=>target.buyerReturn(idFrom(request.params)));
  app.post('/adapter/orders/:id/capture',async(request)=>target.capture(idFrom(request.params),operationSchema.parse(request.body).operationId));
  app.post('/adapter/orders/:id/reconcile',async(request)=>target.reconcile(idFrom(request.params)));
  app.post('/adapter/orders/:id/process-again',async(request)=>target.reconcile(idFrom(request.params)));
  app.post('/adapter/orders/:id/arm-fault',async(request)=>{const id=idFrom(request.params); db.order(id); db.armFault(id); return target.observe(id);});
  app.get('/adapter/orders/:id/download',async(request,reply)=>{
    const id=idFrom(request.params); const {token}=z.object({token:z.string()}).parse(request.query);
    return reply.type('text/plain').send(target.download(id,token));
  });
  // Access check never returns the download secret or triggers processing.
  app.get('/adapter/orders/:id/check-download',async(request)=>({accessible:target.observe(idFrom(request.params)).downloadAccessible,provenance:'simulated'}));
  app.get('/adapter/orders/:id/operations',async(request)=>db.operations(idFrom(request.params)));
  app.get('/api/orders/:id/download-link',async(request)=>{
    const order=db.order(idFrom(request.params));
    return {url:`${config.PAYPROBE_PUBLIC_URL}/adapter/orders/${order.purchaseId}/download?token=${order.downloadToken}`,provenance:'simulated'};
  });
  // Explicit simulator controls. Approval requires POST; reading an approval link changes nothing.
  app.get('/simulated/orders/:id/approve',async(request)=>({action:'POST this URL to approve a SIMULATED purchase',order:await provider.get(z.object({id:z.string()}).parse(request.params).id),provenance:'simulated'}));
  app.post('/simulated/orders/:id/approve',async(request)=>provider.approve(z.object({id:z.string()}).parse(request.params).id));
  // Independent observer: reads provider ledger without target processing or fixture-mode decisions.
  app.get('/provider/orders/:id',async(request)=>provider.get(z.object({id:z.string()}).parse(request.params).id));
  app.addHook('onClose',async()=>{if (!suppliedStore) db.close();});
  return {app,db,provider,target,ai};
}
