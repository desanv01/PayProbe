import { existsSync, copyFileSync, constants } from 'node:fs';
import dotenv from 'dotenv';
import { z } from 'zod';

const optional = z.string().trim().min(1).optional();
const schema = z.object({
  DEEPSEEK_API_KEY: optional, DEEPSEEK_MODEL: z.string().default('deepseek-flash'),
  PAYPAL_CLIENT_ID: optional, PAYPAL_CLIENT_SECRET: optional, PAYPAL_MERCHANT_ID: optional,
  PAYPROBE_API_TOKEN: optional,
  PAYPROBE_HOST: z.string().default('127.0.0.1'),
  PAYPROBE_PORT: z.coerce.number().int().min(1).max(65535).default(3210),
  PAYPROBE_PUBLIC_URL: z.url().default('http://127.0.0.1:3210'),
  PAYPROBE_DB_PATH: z.string().default('.payprobe/payprobe.sqlite'),
});
export type Config = z.infer<typeof schema>;
export function loadConfig(): Config {
  if (!existsSync('.env.local') && existsSync('.env.example')) {
    try { copyFileSync('.env.example', '.env.local', constants.COPYFILE_EXCL); }
    catch (error) { if (!existsSync('.env.local')) throw error; }
  }
  dotenv.config({ path: '.env.local', quiet: true });
  const values = Object.fromEntries(Object.entries(process.env).map(([k,v]) => [k, v === '' ? undefined : v]));
  const result = schema.safeParse(values);
  if (!result.success) throw new Error(`Invalid configuration fields: ${result.error.issues.map(i => i.path.join('.')).join(', ')}`);
  const c = result.data;
  if (!['127.0.0.1', 'localhost', '::1'].includes(c.PAYPROBE_HOST) && !c.PAYPROBE_API_TOKEN) {
    throw new Error('PAYPROBE_API_TOKEN is required when binding beyond loopback');
  }
  return c;
}
export function credentialPresence(c: Config) {
  return { deepseek: Boolean(c.DEEPSEEK_API_KEY), paypal: Boolean(c.PAYPAL_CLIENT_ID && c.PAYPAL_CLIENT_SECRET), merchant: Boolean(c.PAYPAL_MERCHANT_ID), apiToken: Boolean(c.PAYPROBE_API_TOKEN) };
}

