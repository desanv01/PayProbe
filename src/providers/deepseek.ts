import OpenAI from 'openai';
import { z } from 'zod';
import type { Config } from '../core/config.js';
import { AppError } from '../core/schemas.js';

export class DeepSeekClient {
  constructor(private config: Config) {}
  async json<T>(system: string, input: unknown, schema: z.ZodType<T>, example: unknown, attempts = 2) {
    if (!this.config.DEEPSEEK_API_KEY) throw new AppError('deepseek_key_missing',503);
    const client = new OpenAI({ apiKey:this.config.DEEPSEEK_API_KEY, baseURL:'https://api.deepseek.com', maxRetries:0, timeout:20000 });
    const deadline = Date.now() + 40000;
    for (let attempt = 0; attempt < Math.min(2,Math.max(1,attempts)); attempt++) {
      try {
        const request = {
          model:this.config.DEEPSEEK_MODEL, response_format:{type:'json_object' as const}, max_tokens:1200,
          messages:[{role:'system' as const,content:`${system}\nReturn only JSON. Example JSON: ${JSON.stringify(example)}${attempt ? '\nPrevious response was invalid. Follow the schema exactly.' : ''}`}, {role:'user' as const,content:JSON.stringify(input)}],
          thinking:{type:'disabled'},
        };
        const response = await client.chat.completions.create(request,{ timeout:Math.max(1,deadline-Date.now()),signal:AbortSignal.timeout(Math.max(1,deadline-Date.now())) });
        const choice = response.choices[0];
        if (!choice || choice.finish_reason !== 'stop' || !choice.message.content?.trim()) throw new AppError('deepseek_blank_or_truncated',502);
        const parsed = schema.safeParse(JSON.parse(choice.message.content));
        if (!parsed.success) throw new AppError('deepseek_schema_invalid',502);
        return { data:parsed.data, metadata:{ provider:'deepseek',requestedModel:this.config.DEEPSEEK_MODEL,returnedModel:response.model,usage:response.usage,attempts:attempt+1,thinking:'disabled' } };
      } catch (error) {
        if (error instanceof OpenAI.APIError && error.status && error.status < 500 && error.status !== 429) throw new AppError(`deepseek_http_${error.status}`,502);
        if (attempt + 1 >= attempts || Date.now() >= deadline) throw new AppError('deepseek_request_failed',502);
      }
    }
    throw new AppError('deepseek_request_failed',502);
  }
  probe() { return this.json('Return the requested service health JSON; do not describe payment truth.',{ service:'payprobe',response:'ok' },z.object({ok:z.literal(true),service:z.literal('payprobe')}).strict(),{ok:true,service:'payprobe'},1); }
}
