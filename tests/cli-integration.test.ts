import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtempSync,readFileSync,writeFileSync,rmSync } from 'node:fs';
import { join } from 'node:path';
import { buildServer } from '../src/api/server.js';
import { planHash,validatePlan } from '../src/ai/planner.js';
import { ReviewedPlanStore } from '../src/ai/review-store.js';
import type { Config } from '../src/core/config.js';

const execute=promisify(execFile);
test('CLI reviews synthetic source, pauses, resumes four simulated scenarios and reports without AI calls',async()=>{
  const directory=mkdtempSync(join(process.cwd(),'.payprobe-test-'));
  const config:Config={DEEPSEEK_MODEL:'deepseek-flash',PAYPROBE_PROVIDER:'simulated',PAYPROBE_HOST:'127.0.0.1',PAYPROBE_PORT:4310,PAYPROBE_PUBLIC_URL:'http://127.0.0.1:4310',PAYPROBE_DB_PATH:join(directory,'cli.sqlite'),PAYPROBE_API_TOKEN:'synthetic-cli-test'};
  const {app,db}=buildServer(config);
  try {
    const address=await app.listen({host:'127.0.0.1',port:0});
    const environment={...process.env,DEEPSEEK_API_KEY:'',PAYPROBE_PROVIDER:'simulated',PAYPROBE_DB_PATH:config.PAYPROBE_DB_PATH,PAYPROBE_PUBLIC_URL:address,PAYPROBE_API_TOKEN:config.PAYPROBE_API_TOKEN};
    const cli=async(...args:string[])=>{
      const result=await execute(process.execPath,['--import','tsx','src/cli/index.ts',...args],{cwd:process.cwd(),env:environment,timeout:30000,maxBuffer:1024*1024});
      return JSON.parse(result.stdout) as Record<string,any>;
    };
    const contract=JSON.parse(readFileSync('examples/download-contract.json','utf8'));
    const plan=validatePlan({version:'1.0',provider:'simulated',provenance:'simulated',contract,selection:{scenarios:['S1','S2','S3','S4'].map(id=>({id,rationale:'Synthetic CLI wiring check; no model request.'}))}});
    const draftPath=join(directory,'synthetic-draft.json'),reviewedPath=join(directory,'synthetic-reviewed.json');
    writeFileSync(draftPath,JSON.stringify({plan,hash:planHash(plan),review:null,ai:{provenance:'synthetic_test'}}));
    await assert.rejects(cli('run',draftPath),error=>Boolean(error && typeof error==='object' && 'stderr' in error && String(error.stderr).includes('plan_review_required')));
    const reviewed=await cli('plan','--review',draftPath,'--out',reviewedPath);
    assert.equal(reviewed.review.accepted,true);
    const waiting=await cli('run',reviewedPath);
    assert.equal(waiting.state,'awaiting_approval');
    assert.equal(new ReviewedPlanStore(db).forRun(waiting.id)?.hash,reviewed.hash);
    const finished=await cli('resume',waiting.id,'--auto-approve-simulated');
    assert.equal(finished.state,'finished');
    assert.deepEqual(finished.cases.map((result:{verdict:string})=>result.verdict),['PASS','PASS','PASS','PASS']);
    const evidenceCount=finished.evidence.length;
    const persisted=await cli('report',waiting.id,'--format','json');
    assert.equal(persisted.id,waiting.id);
    assert.equal(persisted.evidence.length,evidenceCount);
    assert.equal(persisted.realPayPalVerified,false);
    assert.equal(persisted.provenance,'simulated');
  } finally {await app.close();rmSync(directory,{recursive:true,force:true});}
});
