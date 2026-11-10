import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { DeepSeekClient,DeepSeekRequestError,safeDeepSeekDiagnostics } from '../src/providers/deepseek.js';
import type { Config } from '../src/core/config.js';

const config:Config={DEEPSEEK_API_KEY:'synthetic-never-sent-to-network',DEEPSEEK_MODEL:'deepseek-flash',PAYPROBE_PROVIDER:'simulated',PAYPROBE_HOST:'127.0.0.1',PAYPROBE_PORT:4310,PAYPROBE_PUBLIC_URL:'http://127.0.0.1:4310',PAYPROBE_DB_PATH:':memory:'};
const canary='PRIVATE_DIAGNOSTIC_CANARY';
function completion(content:string,finish='stop') {
  return new Response(JSON.stringify({id:'synthetic',object:'chat.completion',created:0,model:'deepseek-flash',choices:[{index:0,message:{role:'assistant',content,reasoning_content:canary},finish_reason:finish}],usage:{prompt_tokens:3,completion_tokens:5,total_tokens:8}}),{headers:{'content-type':'application/json'}});
}
test('DeepSeek diagnostics preserve bounded categories, finish and usage without response content',async()=>{
  for(const [content,finish,category] of [[canary,'length','truncated'],['   ','stop','blank'],[canary,'stop','invalid_json'],[JSON.stringify({private:canary}),'stop','schema_invalid']] as const) {
    let calls=0;
    const client=new DeepSeekClient(config,{fetch:async()=>{calls++;return completion(content,finish);}});
    await assert.rejects(client.json('synthetic JSON', {private:canary},z.object({ok:z.literal(true)}).strict(),{ok:true}),error=>{
      assert.ok(error instanceof DeepSeekRequestError);
      assert.equal(error.diagnostics.lastFailure.category,category);
      assert.equal(error.diagnostics.attempts.length,2);
      assert.equal(error.diagnostics.lastFailure.finishReason,finish);
      assert.equal(error.diagnostics.lastFailure.usage?.totalTokens,8);
      assert.equal(JSON.stringify(safeDeepSeekDiagnostics(error)).includes(canary),false);
      assert.equal(JSON.stringify(error).includes(config.DEEPSEEK_API_KEY!),false);
      return true;
    });
    assert.equal(calls,2);
  }
});
test('DeepSeek HTTP auth rejection is classified once without SDK body/header leakage',async()=>{
  let calls=0;
  const client=new DeepSeekClient(config,{fetch:async()=>{calls++;return new Response(JSON.stringify({error:{message:canary}}),{status:401,headers:{'content-type':'application/json','x-private':canary}});}});
  await assert.rejects(client.probe(),error=>{
    assert.ok(error instanceof DeepSeekRequestError);
    assert.equal(error.diagnostics.lastFailure.category,'http_error');
    assert.equal(error.diagnostics.lastFailure.httpStatus,401);
    assert.equal(JSON.stringify(error).includes(canary),false);return true;
  });
  assert.equal(calls,1);
});
