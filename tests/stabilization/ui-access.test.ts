import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { buildServer } from '../../src/api/server.js';
import { Store } from '../../src/storage/database.js';

test('production UI wiring exposes session UI while protecting admin authority and failing safely without a model key', async () => {
  const db = new Store(':memory:');
  const config = { PAYPROBE_DB_PATH: ':memory:', PAYPROBE_HOST: '127.0.0.1', PAYPROBE_PORT: 4310,
    PAYPROBE_PUBLIC_URL: 'http://demo.test', PAYPROBE_PROVIDER: 'simulated' as const,
    DEEPSEEK_MODEL: 'deepseek-flash', PAYPROBE_API_TOKEN: 'p5-admin-test-only' };
  let { app } = buildServer(config, db);
  try {
    // Public routes must be reachable under actual P1 bearer-hook registration.
    for (const url of ['/demo', '/demo?review=1', '/demo/style.css', '/demo/app.js']) {
      const response = await app.inject({ url });
      assert.equal(response.statusCode, 200, url);
      assert.ok(!response.body.includes(config.PAYPROBE_API_TOKEN), 'admin authority must stay backend-side');
      assert.equal(response.headers['x-content-type-options'], 'nosniff');
    }
    for (const url of ['/api/doctor', '/adapter/capabilities', '/provider/orders/private', '/demography']) {
      assert.equal((await app.inject({ url })).statusCode, 401, url);
    }
    const session = await app.inject({ url: '/demo/session', headers: { host: 'demo.test' } });
    assert.equal(session.statusCode, 200);
    assert.equal(session.json().doctor.deepseekKeyPresent, false);
    const setCookie = String(session.headers['set-cookie']);
    assert.match(setCookie, /HttpOnly/); assert.match(setCookie, /SameSite=Strict/);
    assert.match(setCookie, /Path=\/demo/);
    const cookie = setCookie.split(';')[0]!;
    const headers = { host: 'demo.test', origin: 'http://demo.test', cookie,
      'x-payprobe-csrf': session.json().csrf };
    const payload = { requirements: 'Synthetic no-key check', fixtureMode: 'corrected' };
    const request = (url: string, body: object, overrides = {}) => app.inject({ method: 'POST', url,
      headers: { ...headers, ...overrides }, payload: body });
    assert.equal((await request('/demo/plan', payload, { 'x-payprobe-csrf': 'wrong' })).statusCode, 403);
    assert.equal((await request('/demo/plan', payload, { origin: 'http://external.test' })).statusCode, 403);
    assert.equal((await request('/demo/plan', { ...payload, targetUrl: 'http://external.test' })).statusCode, 400);
    const missing = await request('/demo/plan', payload);
    assert.equal(missing.statusCode, 503);
    assert.equal(missing.json().error, 'deepseek_key_missing');
    assert.ok(!missing.body.includes(config.PAYPROBE_API_TOKEN));
    const unreviewed = await request('/demo/runs', {});
    assert.equal(unreviewed.statusCode, 409);
    assert.equal(unreviewed.json().error, 'plan_review_required');
    const unowned = await app.inject({ url: `/demo/runs/${randomUUID()}`, headers });
    assert.equal(unowned.statusCode, 404);
    assert.equal(unowned.json().error, 'demo_run_not_found');
    assert.equal(db.db.prepare('SELECT COUNT(*) AS n FROM orders').get()!.n, 0);
    await app.close();
    ({ app } = buildServer(config, db));
    const expired = await app.inject({ url: `/demo/runs/${randomUUID()}`, headers });
    assert.equal(expired.statusCode, 401);
    assert.equal(expired.json().error, 'demo_session_expired');
    assert.equal(db.db.prepare('SELECT COUNT(*) AS n FROM orders').get()!.n, 0);
  } finally { await app.close(); db.close(); }
});
