import OpenAI from 'openai';
import { z } from 'zod';
import type { Config } from '../core/config.js';
import { AppError } from '../core/schemas.js';

export type DeepSeekFailureCategory = 'timeout'|'blank'|'truncated'|'invalid_json'|'schema_invalid'|'http_error'|'transport_error'|'unknown';
export type DeepSeekFailure = {
  category: DeepSeekFailureCategory; attempt: number; httpStatus?: number;
  finishReason?: 'stop'|'length'|'content_filter'|'tool_calls'|'function_call'|'unknown';
  usage?: {promptTokens?:number;completionTokens?:number;totalTokens?:number};
};
export class DeepSeekRequestError extends AppError {
  constructor(public diagnostics: {provider:'deepseek';attempts:DeepSeekFailure[];lastFailure:DeepSeekFailure}) {
    super('deepseek_request_failed',502);
  }
}
export function safeDeepSeekDiagnostics(error:unknown) {
  return error instanceof DeepSeekRequestError ? {diagnostics:error.diagnostics} : {};
}
function safeUsage(usage:OpenAI.CompletionUsage|undefined) {
  if(!usage)return undefined;
  const number=(value:unknown)=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0?value:undefined;
  return {promptTokens:number(usage.prompt_tokens),completionTokens:number(usage.completion_tokens),totalTokens:number(usage.total_tokens)};
}
function finishReason(value:unknown):DeepSeekFailure['finishReason'] {
  return ['stop','length','content_filter','tool_calls','function_call'].includes(String(value))?value as DeepSeekFailure['finishReason']:'unknown';
}
class InvalidCompletion extends Error {
  constructor(public category:DeepSeekFailureCategory){super(category);}
}
export class DeepSeekClient {
  constructor(private config: Config,private transport?:{fetch:typeof fetch}) {}
  async json<T>(system: string, input: unknown, schema: z.ZodType<T>, example: unknown, attempts = 2) {
    if (!this.config.DEEPSEEK_API_KEY) throw new AppError('deepseek_key_missing',503);
    const client = new OpenAI({ apiKey:this.config.DEEPSEEK_API_KEY, baseURL:'https://api.deepseek.com', maxRetries:0, timeout:20000,...this.transport });
    const deadline = Date.now() + 40000,limit=Number.isFinite(attempts)?Math.min(2,Math.max(1,Math.floor(attempts))):2;
    const failures:DeepSeekFailure[]=[];
    for (let attempt = 0; attempt < limit; attempt++) {
      let completion:Pick<DeepSeekFailure,'finishReason'|'usage'>={};
      try {
        const request = {
          model:this.config.DEEPSEEK_MODEL, response_format:{type:'json_object' as const}, max_tokens:1200,
          messages:[{role:'system' as const,content:`${system}\nReturn only JSON. Example JSON: ${JSON.stringify(example)}${attempt ? '\nPrevious response was invalid. Follow the schema exactly.' : ''}`}, {role:'user' as const,content:JSON.stringify(input)}],
          thinking:{type:'disabled'},
        };
        const remaining=Math.max(1,deadline-Date.now());
        const response = await client.chat.completions.create(request,{ timeout:Math.min(20000,remaining),signal:AbortSignal.timeout(remaining) });
        const choice = response.choices[0];
        completion={finishReason:finishReason(choice?.finish_reason),usage:safeUsage(response.usage)};
        if (choice?.finish_reason === 'length') throw new InvalidCompletion('truncated');
        if (!choice || !choice.message.content?.trim()) throw new InvalidCompletion('blank');
        if (choice.finish_reason !== 'stop') throw new InvalidCompletion('truncated');
        let value:unknown;
        try {value=JSON.parse(choice.message.content);} catch {throw new InvalidCompletion('invalid_json');}
        const parsed = schema.safeParse(value);
        if (!parsed.success) throw new InvalidCompletion('schema_invalid');
        return { data:parsed.data, metadata:{ provider:'deepseek',requestedModel:this.config.DEEPSEEK_MODEL,returnedModel:response.model,usage:response.usage,attempts:attempt+1,thinking:'disabled' } };
      } catch (error) {
        const status=error instanceof OpenAI.APIError ? error.status : undefined;
        const category:DeepSeekFailureCategory = error instanceof InvalidCompletion ? error.category
          : error instanceof OpenAI.APIConnectionTimeoutError || error instanceof Error && ['AbortError','TimeoutError'].includes(error.name) ? 'timeout'
          : status ? 'http_error' : error instanceof OpenAI.APIConnectionError ? 'transport_error' : 'unknown';
        const failure:DeepSeekFailure={category,attempt:attempt+1,...completion,...(status?{httpStatus:status}:{})};
        failures.push(failure);
        if (attempt + 1 >= limit || Date.now() >= deadline || status && status<500 && status!==429) {
          // Only allowlisted scalar metadata leaves this boundary. Never retain
          // response content, SDK error bodies, headers, prompts or reasoning.
          throw new DeepSeekRequestError({provider:'deepseek',attempts:failures,lastFailure:failure});
        }
      }
    }
    throw new DeepSeekRequestError({provider:'deepseek',attempts:failures,lastFailure:failures.at(-1)??{category:'unknown',attempt:0}});
  }
  probe() { return this.json('Return the requested service health JSON; do not describe payment truth.',{ service:'payprobe',response:'ok' },z.object({ok:z.literal(true),service:z.literal('payprobe')}).strict(),{ok:true,service:'payprobe'},1); }
}
