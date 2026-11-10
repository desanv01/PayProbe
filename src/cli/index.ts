#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig,credentialPresence } from '../core/config.js';
import { buildServer } from '../api/server.js';
import { DeepSeekClient } from '../providers/deepseek.js';
import { AppError } from '../core/schemas.js';

const program = new Command().name('payprobe').description('Headless payment diagnostics (simulated provider)').version('0.1.0');
program.command('doctor').action(()=>{
  const config=loadConfig();
  console.log(JSON.stringify({node:process.version,provider:'simulated',credentials:credentialPresence(config),paypalRequired:false,realPayPalVerified:false,uiApproval:'pending'},null,2));
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
try { await program.parseAsync(); }
catch (error) { console.error(JSON.stringify({error:error instanceof AppError ? error.code : 'command_failed'})); process.exitCode=1; }
