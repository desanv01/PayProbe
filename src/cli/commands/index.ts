import { readFile,writeFile } from 'node:fs/promises';
import type { Command } from 'commander';
import { AppError } from '../../core/schemas.js';
import { generatePlan,loadSavedPlan,reviewPlan,toRunnerPlan,type JsonClient,type SavedPlan } from '../../ai/planner.js';
import { explainReport } from '../../ai/explainer.js';
import { formatReport } from '../../reporting/report.js';
import type { RunReport,RunnerPlan } from '../../runner/types.js';

export interface WorkflowDependencies {
  client:()=>JsonClient;
  run:(plan:RunnerPlan,options:{autoApproveSimulated:boolean;reviewedPlan:SavedPlan})=>Promise<RunReport>;
  resume:(runId:string,options:{autoApproveSimulated:boolean})=>Promise<RunReport>;
  report:(runId:string)=>RunReport|Promise<RunReport>;
  output?:(text:string)=>void;
}
async function readJson(path:string) {
  const text=await readFile(path,'utf8');if(Buffer.byteLength(text)>65536)throw new AppError('input_file_too_large');return JSON.parse(text) as unknown;
}
async function saveJson(path:string,value:unknown) { await writeFile(path,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600}); }
export function registerWorkflowCommands(program:Command,deps:WorkflowDependencies) {
  const output=deps.output??console.log;
  program.command('plan [contract]').description('Generate a draft, or explicitly review an existing simulated plan')
    .option('--out <path>','New output file (never overwrite)')
    .option('--review <path>','Explicitly accept this saved plan after inspecting it')
    .action(async(contract:string|undefined,options:{out?:string;review?:string})=>{
      if(!options.out)throw new AppError('plan_output_path_required');
      if(Boolean(contract)===Boolean(options.review))throw new AppError('provide_contract_or_review_path');
      const saved=options.review?reviewPlan(await readJson(options.review)):await generatePlan(deps.client(),await readJson(contract!));
      await saveJson(options.out,saved);output(JSON.stringify(saved,null,2));
    });
  program.command('run <plan>').description('Execute a saved reviewed plan with simulated payment provenance')
    .option('--auto-approve-simulated','Explicitly approve simulated orders (never PayPal)')
    .action(async(path:string,options:{autoApproveSimulated?:boolean})=>{
      const saved=loadSavedPlan(await readJson(path),true);
      const result=await deps.run(toRunnerPlan(saved.plan),{autoApproveSimulated:options.autoApproveSimulated??false,reviewedPlan:saved});
      output(formatReport(result,'json'));
    });
  program.command('resume <runId>').option('--auto-approve-simulated','Explicitly approve simulated orders')
    .action(async(id:string,options:{autoApproveSimulated?:boolean})=>output(formatReport(await deps.resume(id,{autoApproveSimulated:options.autoApproveSimulated??false}),'json')));
  program.command('report <runId>').option('--format <format>','text or json','text').action(async(id:string,options:{format:string})=>{
    if(options.format!=='text'&&options.format!=='json')throw new AppError('unsupported_report_format');
    output(formatReport(await deps.report(id),options.format));
  });
  program.command('explain <runId>').description('Ask DeepSeek to explain recorded simulated evidence; verdicts stay deterministic')
    .option('--out <path>','Save explanation to a new file').action(async(id:string,options:{out?:string})=>{
      const explanation=await explainReport(deps.client(),await deps.report(id));
      if(options.out)await saveJson(options.out,explanation);output(JSON.stringify(explanation,null,2));
    });
  return program;
}
