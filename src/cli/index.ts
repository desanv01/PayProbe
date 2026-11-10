#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig,credentialPresence } from '../core/config.js';
import { buildServer } from '../api/server.js';
import { DeepSeekClient,safeDeepSeekDiagnostics } from '../providers/deepseek.js';
import { AppError } from '../core/schemas.js';
import { Store } from '../storage/database.js';
import { HttpAdapter } from '../adapters/http.js';
import { resume,report,runnerPlanSchema } from '../runner/index.js';
import { RunRepository } from '../runner/repository.js';
import { ReviewedPlanStore } from '../ai/review-store.js';
import { registerWorkflowCommands } from './commands/index.js';
import { showReportTui } from '../ui/tui.js';

const program = new Command().name('payprobe').description('Headless payment diagnostics (simulated provider)').version('0.1.0');
program.command('doctor').action(()=>{
  const config=loadConfig();
  console.log(JSON.stringify({node:process.version,provider:'simulated',credentials:credentialPresence(config),paypalRequired:false,realPayPalVerified:false},null,2));
});
program.command('serve').action(async()=>{
  const config=loadConfig(),{app}=buildServer(config);
  await app.listen({host:config.PAYPROBE_HOST,port:config.PAYPROBE_PORT});
  console.log(JSON.stringify({listening:config.PAYPROBE_PUBLIC_URL,provider:'simulated',provenance:'simulated'}));
  for (const signal of ['SIGINT','SIGTERM'] as const) process.once(signal,()=>{void app.close();});
});
program.command('deepseek-probe').description('Make one bounded real DeepSeek JSON request').action(async()=>{
  console.log(JSON.stringify(await new DeepSeekClient(loadConfig()).probe(),null,2));
});
async function withStore<T>(action:(store:Store,config:ReturnType<typeof loadConfig>)=>Promise<T>|T):Promise<T> {
  const config=loadConfig(),store=new Store(config.PAYPROBE_DB_PATH);
  try { return await action(store,config); } finally {store.close();}
}
const adapterFor=(config:ReturnType<typeof loadConfig>)=>new HttpAdapter({baseUrl:config.PAYPROBE_PUBLIC_URL,token:config.PAYPROBE_API_TOKEN});
program.command('ledger <runId>').description('Inspect a saved report in the approved terminal ledger; never process payments').action(async(runId:string)=>{
  const saved=await withStore(store=>report(store,runId));
  await showReportTui(saved);
});
registerWorkflowCommands(program,{
  client:()=>new DeepSeekClient(loadConfig()),
  run:(plan,options)=>withStore(async(store,config)=>{
    const reviews=new ReviewedPlanStore(store),saved=reviews.save(options.reviewedPlan);
    const runId=new RunRepository(store).create(runnerPlanSchema.parse(plan));
    // Bind the accepted source before the first adapter operation, including
    // approval pauses or process interruption. Resume never replans.
    reviews.attach(runId,saved);
    return resume({store,adapter:adapterFor(config),runId,autoApproveSimulated:options.autoApproveSimulated});
  }),
  resume:(runId,options)=>withStore((store,config)=>{
    const reviews=new ReviewedPlanStore(store),saved=reviews.forRun(runId);
    if(!saved) throw new AppError('reviewed_run_source_missing',409);
    reviews.attach(runId,saved);
    return resume({store,adapter:adapterFor(config),runId,autoApproveSimulated:options.autoApproveSimulated});
  }),
  report:(runId)=>withStore(store=>report(store,runId)),
});
try { await program.parseAsync(); }
catch (error) { console.error(JSON.stringify({error:error instanceof AppError ? error.code : 'command_failed',...safeDeepSeekDiagnostics(error)})); process.exitCode=1; }
