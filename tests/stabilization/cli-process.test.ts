import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, type ChildProcess } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { capabilities } from '../../src/core/schemas.js';
import { planHash, validatePlan } from '../../src/ai/planner.js';
import { ReviewedPlanStore } from '../../src/ai/review-store.js';
import { RunRepository } from '../../src/runner/repository.js';
import { Store } from '../../src/storage/database.js';

const cli = fileURLToPath(new URL('../../src/cli/index.ts', import.meta.url));

test('CLI persists reviewed source across server restart and redacts reports without model calls', { timeout: 60000 }, async () => {
  const root = resolve(process.cwd());
  const cwd = await mkdtemp(join(root, '.payprobe-test-p5-cli-'));
  const path = join(cwd, 'process.sqlite');
  const draftPath = join(cwd, 'draft.json'), reviewedPath = join(cwd, 'reviewed.json');
  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const port = (listener.address() as { port: number }).port;
  await new Promise<void>((done, reject) => listener.close(error => error ? reject(error) : done()));
  const base = `http://127.0.0.1:${port}`;
  const token = 'p5-test-only-bearer-canary', secret = 'p5-private-evidence-canary';
  // Child cwd has no .env.local/example; empty model credentials prohibit paid calls.
  const env = { ...process.env, NODE_OPTIONS: '', DEEPSEEK_API_KEY: '',
    PAYPAL_CLIENT_ID: '', PAYPAL_CLIENT_SECRET: '', PAYPAL_MERCHANT_ID: '',
    PAYPROBE_HOST: '127.0.0.1', PAYPROBE_PORT: String(port), PAYPROBE_PUBLIC_URL: base,
    PAYPROBE_DB_PATH: path, PAYPROBE_PROVIDER: 'simulated', PAYPROBE_API_TOKEN: token };
  let server: ChildProcess | undefined;
  const processes = new Set<ChildProcess>();
  const launch = (args: string[]) => {
    const child = spawn(process.execPath, ['--import', 'tsx', cli, ...args], {
      cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    processes.add(child);
    child.once('close', () => processes.delete(child));
    return child;
  };
  const command = async (args: string[], code = 0) => {
    const child = launch(args);
    let stdout = '', stderr = '';
    child.stdout!.on('data', data => { stdout += String(data); });
    child.stderr!.on('data', data => { stderr += String(data); });
    const timeout = setTimeout(() => child.kill(), 15000);
    const [actual] = await once(child, 'close');
    clearTimeout(timeout);
    assert.equal(actual, code, `CLI ${args[0]} exited unexpectedly: ${stderr}`);
    assert.ok(!stdout.includes(token), 'CLI output leaked bearer token');
    return { stdout, stderr };
  };
  const stop = async () => {
    if (server && server.exitCode === null && server.signalCode === null) {
      const closed = once(server, 'close');
      server.kill();
      await closed;
    }
    server = undefined;
  };
  const start = async () => {
    server = launch(['serve']);
    server.stdout!.resume(); server.stderr!.resume();
    for (let attempt = 0; attempt < 100; attempt++) {
      if (server.exitCode !== null) throw new Error('Test server exited before health');
      try {
        const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(200) });
        if (response.ok) { assert.equal((await response.json()).provider, 'simulated'); return; }
      } catch { /* Bound local startup wait; no external endpoint. */ }
      await new Promise(done => setTimeout(done, 50));
    }
    throw new Error('Test server startup timed out');
  };
  try {
    const plan = validatePlan({ version: '1.0', provider: 'simulated', provenance: 'simulated',
      contract: { requirements: 'Synthetic offline acceptance fixture: approval, capture, repeat, recovery.',
        purchase: { amountCents: 500 }, adapter: { version: '1.0', capabilities: [...capabilities] },
        fulfillmentTimeoutMs: 0 },
      selection: { scenarios: ['S1', 'S2', 'S3', 'S4'].map(id => ({ id, rationale: `Synthetic ${id} acceptance` })) } });
    const hash = planHash(plan);
    await writeFile(draftPath, JSON.stringify({ plan, hash, review: null }));
    assert.match((await command(['run', draftPath], 1)).stderr, /plan_review_required/);
    await command(['plan', '--review', draftPath, '--out', reviewedPath]);
    const reviewed = JSON.parse(await readFile(reviewedPath, 'utf8'));
    assert.equal(reviewed.review.hash, hash);
    await start();
    const waiting = JSON.parse((await command(['run', reviewedPath])).stdout);
    assert.equal(waiting.state, 'awaiting_approval');
    assert.equal(waiting.approvals.length, 1);
    await stop();
    let store = new Store(path);
    try {
      assert.equal(new ReviewedPlanStore(store).forRun(waiting.id)?.hash, hash);
      assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM orders').get()!.n, 1);
    } finally { store.close(); }
    await start();
    const completed = JSON.parse((await command(['resume', waiting.id, '--auto-approve-simulated'])).stdout);
    assert.equal(completed.id, waiting.id);
    assert.equal(completed.state, 'finished');
    assert.deepEqual(completed.cases.map((c: { verdict: string }) => c.verdict), ['PASS', 'PASS', 'PASS', 'PASS']);
    assert.equal(completed.realPayPalVerified, false);
    await stop();
    store = new Store(path);
    try {
      const source = new ReviewedPlanStore(store).forRun(waiting.id);
      assert.equal(source?.hash, hash);
      assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM orders').get()!.n, 2);
      assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM entitlements').get()!.n, 2);
      assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM simulated_provider_orders').get()!.n, 2);
      assert.equal(store.db.prepare("SELECT COUNT(*) AS n FROM operations WHERE kind='capture'").get()!.n, 2);
      // Synthetic contaminated evidence tests actual persisted CLI report projection.
      new RunRepository(store).evidence(waiting.id, 'S4', 'runner', 'synthetic-redaction-check', {
        state: `Bearer ${secret}`, apiKey: secret, downloadToken: secret,
        downloadUrl: `${base}/private?token=${secret}`, authorization: `Bearer ${token}`,
      });
    } finally { store.close(); }
    for (const format of ['json', 'text']) {
      const output = (await command(['report', waiting.id, '--format', format])).stdout;
      assert.ok(!output.includes(secret), 'CLI report leaked synthetic private evidence');
      assert.match(output, /simulated/);
      assert.match(output, /REDACTED/);
    }
    // Resume must refuse missing reviewed source before creating or mutating payments.
    store = new Store(path);
    try { store.db.prepare('DELETE FROM reviewed_plan_runs WHERE run_id=?').run(waiting.id); }
    finally { store.close(); }
    assert.match((await command(['resume', waiting.id, '--auto-approve-simulated'], 1)).stderr, /reviewed_run_source_missing/);
    store = new Store(path);
    try { assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM orders').get()!.n, 2); }
    finally { store.close(); }
  } finally {
    await stop();
    await Promise.all([...processes].map(async child => { const closed = once(child, 'close'); child.kill(); await closed; }));
    assert.ok(resolve(cwd).startsWith(root + sep));
    await rm(cwd, { recursive: true, force: true });
  }
});
