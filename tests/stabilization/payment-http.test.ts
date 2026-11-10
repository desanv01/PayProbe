import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { buildServer } from '../../src/api/server.js';
import type { Config } from '../../src/core/config.js';

// Explicit test-only configuration; never loads .env.local or calls DeepSeek/PayPal.
const config = (path: string): Config => ({
  DEEPSEEK_MODEL: 'deepseek-flash', PAYPROBE_PROVIDER: 'simulated',
  PAYPROBE_HOST: '127.0.0.1', PAYPROBE_PORT: 4310,
  PAYPROBE_PUBLIC_URL: 'http://127.0.0.1:4310', PAYPROBE_DB_PATH: path,
  PAYPROBE_API_TOKEN: 'stabilization-test-only',
});
const headers = { authorization: 'Bearer stabilization-test-only' };

test('simulated HTTP lost-response recovery survives database reopen without another capture', async () => {
  const root = resolve(process.cwd());
  const directory = mkdtempSync(join(root, '.payprobe-test-p5-'));
  const path = join(directory, 'recovery.sqlite');
  let server = buildServer(config(path));
  const request = async (method: 'GET' | 'POST', url: string, status = 200, payload?: object) => {
    const response = await server.app.inject({ method, url, headers, ...(payload ? { payload } : {}) });
    assert.equal(response.statusCode, status, `${method} ${url}: ${response.body}`);
    return response.json();
  };
  try {
    const purchaseId = randomUUID(), captureId = randomUUID();
    const order = await request('POST', '/adapter/orders', 200, {
      purchaseId, operationId: randomUUID(), amountCents: 250,
    });
    assert.equal(order.provenance, 'simulated');
    const target = `/adapter/orders/${purchaseId}`;
    const provider = `/provider/orders/${order.providerOrderId}`;
    const approval = new URL(order.approvalUrl).pathname;
    // Reading either approval or provider state cannot approve or fulfill.
    assert.equal((await request('GET', approval)).order.status, 'CREATED');
    assert.equal((await request('GET', provider)).status, 'CREATED');
    await request('POST', approval);
    assert.equal((await request('POST', `${target}/buyer-return`)).entitlementCount, 0);
    await request('POST', `${target}/arm-fault`);
    const failure = await request('POST', `${target}/capture`, 504, { operationId: captureId });
    assert.equal(failure.error, 'capture_response_suppressed');
    assert.equal(failure.provenance, 'simulated');
    const payment = await request('GET', provider);
    assert.equal(payment.status, 'COMPLETED');
    assert.equal(payment.captures.length, 1);
    assert.equal(payment.captures[0].amountCents, 250);
    assert.equal(payment.captures[0].currency, 'USD');
    const capture = payment.captures[0].id;
    const uncertain = await request('GET', target);
    assert.equal(uncertain.state, 'capture_uncertain');
    assert.equal(uncertain.entitlementCount, 0);
    assert.equal(uncertain.fault.fired, true);
    assert.equal((await request('GET', `${target}/check-download`)).accessible, false);

    await server.app.close();
    server = buildServer(config(path));
    const retry = await request('POST', `${target}/capture`, 409, { operationId: captureId });
    assert.equal(retry.error, 'capture_uncertain_reconcile_required');
    assert.equal((await request('GET', target)).entitlementCount, 0);
    assert.equal((await request('POST', `${target}/reconcile`)).entitlementCount, 1);
    for (let i = 0; i < 3; i++) {
      assert.equal((await request('POST', `${target}/process-again`)).entitlementCount, 1);
    }
    const recovered = await request('GET', provider);
    assert.equal(recovered.captures.length, 1);
    assert.equal(recovered.captures[0].id, capture);
    const operations = await request('GET', `${target}/operations`);
    assert.deepEqual(operations.filter((op: {kind: string}) => op.kind === 'capture')
      .map((op: {id: string; state: string}) => [op.id, op.state]), [[captureId, 'completed']]);
    const link = await request('GET', `/api/orders/${purchaseId}/download-link`);
    const download = await server.app.inject({ method: 'GET', url: new URL(link.url).pathname + new URL(link.url).search, headers });
    assert.equal(download.statusCode, 200);
    assert.match(download.body, /simulated sample store/);
    const denied = await server.app.inject({ method: 'GET', url: `${target}/download?token=wrong`, headers });
    assert.equal(denied.statusCode, 403);
  } finally {
    await server.app.close();
    // Verify the absolute deletion target is the created test folder within this workspace.
    assert.ok(resolve(directory).startsWith(root + sep));
    rmSync(directory, { recursive: true, force: true });
  }
});

test('simulated premature capture can complete after approval with the original identity (#10)', async () => {
  const { app } = buildServer(config(':memory:'));
  try {
    const purchaseId = randomUUID(), operationId = randomUUID();
    const created = await app.inject({ method: 'POST', url: '/adapter/orders', headers,
      payload: { purchaseId, operationId: randomUUID(), amountCents: 100 } });
    assert.equal(created.statusCode, 200);
    const url = `/adapter/orders/${purchaseId}/capture`;
    const rejected = await app.inject({ method: 'POST', url, headers, payload: { operationId } });
    assert.equal(rejected.statusCode, 409);
    assert.equal(rejected.json().error, 'simulated_buyer_approval_required');
    const approval = await app.inject({ method: 'POST', url: new URL(created.json().approvalUrl).pathname, headers });
    assert.equal(approval.statusCode, 200);
    const captured = await app.inject({ method: 'POST', url, headers, payload: { operationId } });
    assert.equal(captured.statusCode, 200, captured.body);
    assert.equal(captured.json().entitlementCount, 1);
    const observed = await app.inject({ method: 'GET', url: `/provider/orders/${created.json().providerOrderId}`, headers });
    assert.equal(observed.json().captures.length, 1);
  } finally { await app.close(); }
});
