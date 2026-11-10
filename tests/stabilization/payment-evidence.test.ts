import test from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../../src/api/server.js';
import { Store } from '../../src/storage/database.js';
import { HttpAdapter } from '../../src/adapters/http.js';
import { run, runnerPlanSchema } from '../../src/runner/index.js';

test('S2 refuses PASS for a completed provider observation with wrong amount or currency', async () => {
  // Existing runner tests cover missing truth/hooks; these two transport-level
  // corruptions cover matching truth and response-schema boundaries only.
  for (const corruption of ['amount', 'currency'] as const) {
    const store = new Store(':memory:');
    const { app } = buildServer({ PAYPROBE_DB_PATH: ':memory:', PAYPROBE_HOST: '127.0.0.1',
      PAYPROBE_PORT: 4310, PAYPROBE_PUBLIC_URL: 'http://sample.test',
      PAYPROBE_PROVIDER: 'simulated', DEEPSEEK_MODEL: 'deepseek-flash' }, store);
    let completedObservations = 0;
    const transport: typeof fetch = async (input, init) => {
      const url = new URL(String(input));
      const response = await app.inject({ method: init?.method === 'POST' ? 'POST' : 'GET',
        url: url.pathname, ...(init?.body ? { payload: String(init.body) } : {}),
        headers: init?.headers as Record<string, string> });
      const data = response.json();
      if (url.pathname.startsWith('/provider/orders/') && data.status === 'COMPLETED') {
        completedObservations++;
        if (corruption === 'amount') { data.amountCents = 999; data.captures[0].amountCents = 999; }
        else { data.currency = 'EUR'; data.captures[0].currency = 'EUR'; }
      }
      return new Response(JSON.stringify(data), { status: response.statusCode,
        headers: { 'content-type': 'application/json' } });
    };
    try {
      const result = await run({ store, adapter: new HttpAdapter({ baseUrl: 'http://sample.test', fetch: transport }),
        plan: runnerPlanSchema.parse({ version: '1.0', scenarios: ['S2'], amountCents: 500,
          fulfillmentTimeoutMs: 0 }), autoApproveSimulated: true });
      assert.equal(completedObservations, 1, 'corrupted completed observation must actually be exercised');
      assert.equal(result.cases[0]?.verdict, 'INCONCLUSIVE', corruption);
      assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM entitlements').get()!.n, 1,
        'target success alone must not establish a runner PASS');
      if (corruption === 'amount') assert.ok(result.evidence.some(e => e.source === 'provider' &&
        (e.data as { amountCents?: number }).amountCents === 999));
      else assert.ok(result.evidence.some(e => e.action === 'execution-boundary' &&
        (e.data as { code?: string }).code === 'invalid_adapter_observation'));
    } finally { await app.close(); store.close(); }
  }
});
