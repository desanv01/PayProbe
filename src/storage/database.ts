import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { AppError, type PurchaseInput, type FixtureMode } from '../core/schemas.js';

export type Order = PurchaseInput & { providerOrderId: string | null; state: string; approvalUrl: string | null; downloadToken: string; fault: string; faultFired: number };
export type Operation = { id: string; purchaseId: string; kind: string; requestHash: string; state: string; result: string | null; createdAt: string };
export class Store {
  readonly db: DatabaseSync;
  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS schema_version(version INTEGER PRIMARY KEY);
      INSERT OR IGNORE INTO schema_version VALUES(1);
      CREATE TABLE IF NOT EXISTS runs(id TEXT PRIMARY KEY, state TEXT NOT NULL, plan_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS cases(id TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES runs(id), scenario_id TEXT NOT NULL, state TEXT NOT NULL, verdict TEXT, data_json TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS events(run_id TEXT NOT NULL REFERENCES runs(id), sequence INTEGER NOT NULL, scenario_id TEXT, source TEXT NOT NULL, provenance TEXT NOT NULL, observed_at TEXT NOT NULL, data_json TEXT NOT NULL, PRIMARY KEY(run_id,sequence));
      CREATE TABLE IF NOT EXISTS orders(purchaseId TEXT PRIMARY KEY, amountCents INTEGER NOT NULL, currency TEXT NOT NULL, productId TEXT NOT NULL, providerOrderId TEXT UNIQUE, state TEXT NOT NULL, approvalUrl TEXT, downloadToken TEXT NOT NULL UNIQUE, fault TEXT NOT NULL DEFAULT 'none', faultFired INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS operations(id TEXT PRIMARY KEY, purchaseId TEXT NOT NULL REFERENCES orders(purchaseId), kind TEXT NOT NULL, requestHash TEXT NOT NULL, state TEXT NOT NULL, result TEXT, createdAt TEXT NOT NULL, UNIQUE(purchaseId,kind));
      CREATE TABLE IF NOT EXISTS entitlements(id TEXT PRIMARY KEY, purchaseId TEXT NOT NULL UNIQUE REFERENCES orders(purchaseId), captureId TEXT NOT NULL UNIQUE, createdAt TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS simulated_fixture_modes(purchaseId TEXT PRIMARY KEY REFERENCES orders(purchaseId), mode TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS simulated_fixture_deliveries(id TEXT PRIMARY KEY, purchaseId TEXT NOT NULL REFERENCES orders(purchaseId), reason TEXT NOT NULL, createdAt TEXT NOT NULL);
    `);
    // A process may have stopped after the provider accepted a mutation.
    this.db.prepare("UPDATE operations SET state='uncertain' WHERE state='in_flight'").run();
  }
  close() { this.db.close(); }
  order(id: string): Order {
    const order = this.db.prepare('SELECT * FROM orders WHERE purchaseId=?').get(id) as Order | undefined;
    if (!order) throw new AppError('purchase_not_found',404);
    return order;
  }
  createOrder(input: PurchaseInput) {
    this.db.prepare("INSERT OR IGNORE INTO orders(purchaseId,amountCents,currency,productId,state,downloadToken) VALUES(?,?,?,?,'created',?)")
      .run(input.purchaseId,input.amountCents,input.currency,input.productId,randomUUID());
    const order = this.order(input.purchaseId);
    if (order.amountCents !== input.amountCents || order.currency !== input.currency || order.productId !== input.productId) throw new AppError('purchase_id_conflict',409);
    return order;
  }
  updateOrder(id: string, state: string, providerOrderId?: string, approvalUrl?: string) {
    this.db.prepare('UPDATE orders SET state=?,providerOrderId=COALESCE(?,providerOrderId),approvalUrl=COALESCE(?,approvalUrl) WHERE purchaseId=?').run(state,providerOrderId ?? null,approvalUrl ?? null,id);
  }
  operation(id: string, purchaseId: string, kind: string, request: unknown): Operation {
    const hash = createHash('sha256').update(JSON.stringify(request)).digest('hex');
    const existing = this.db.prepare('SELECT * FROM operations WHERE id=? OR (purchaseId=? AND kind=?)').get(id,purchaseId,kind) as Operation | undefined;
    if (existing) {
      if (existing.id !== id || existing.purchaseId !== purchaseId || existing.kind !== kind || existing.requestHash !== hash) throw new AppError('operation_identity_conflict',409);
      return existing;
    }
    this.db.prepare("INSERT INTO operations VALUES(?,?,?,?,'prepared',NULL,?)").run(id,purchaseId,kind,hash,new Date().toISOString());
    return this.db.prepare('SELECT * FROM operations WHERE id=?').get(id) as Operation;
  }
  setOperation(id: string, state: string, result: unknown = null) {
    this.db.prepare('UPDATE operations SET state=?,result=? WHERE id=?').run(state,result === null ? null : JSON.stringify(result),id);
  }
  fulfill(purchaseId: string, captureId: string) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('INSERT OR IGNORE INTO entitlements VALUES(?,?,?,?)').run(randomUUID(),purchaseId,captureId,new Date().toISOString());
      const row = this.db.prepare('SELECT captureId FROM entitlements WHERE purchaseId=?').get(purchaseId);
      if (!row || row.captureId !== captureId) throw new AppError('entitlement_identity_conflict',409);
      this.updateOrder(purchaseId,'fulfilled');
      this.db.exec('COMMIT');
    } catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  count(purchaseId: string): number {
    return Number(this.db.prepare('SELECT (SELECT COUNT(*) FROM entitlements WHERE purchaseId=?) + (SELECT COUNT(*) FROM simulated_fixture_deliveries WHERE purchaseId=?) AS n').get(purchaseId,purchaseId)!.n);
  }
  setFixtureMode(purchaseId: string,mode: FixtureMode) {
    this.db.prepare('INSERT OR IGNORE INTO simulated_fixture_modes VALUES(?,?)').run(purchaseId,mode);
    if (this.fixtureMode(purchaseId) !== mode) throw new AppError('fixture_mode_conflict',409);
  }
  fixtureMode(purchaseId: string): FixtureMode {
    return (this.db.prepare('SELECT mode FROM simulated_fixture_modes WHERE purchaseId=?').get(purchaseId)?.mode as FixtureMode | undefined) ?? 'corrected';
  }
  seedDelivery(purchaseId: string,reason: 'premature_fulfillment' | 'duplicate_processing') {
    this.db.prepare('INSERT INTO simulated_fixture_deliveries VALUES(?,?,?,?)').run(randomUUID(),purchaseId,reason,new Date().toISOString());
  }
  operations(purchaseId: string) { return this.db.prepare('SELECT id,kind,state,createdAt FROM operations WHERE purchaseId=?').all(purchaseId); }
  armFault(purchaseId: string) { this.db.prepare("UPDATE orders SET fault='suppress_capture_response',faultFired=0 WHERE purchaseId=? AND faultFired=0").run(purchaseId); }
  consumeFault(purchaseId: string) {
    return this.db.prepare("UPDATE orders SET fault='none',faultFired=1 WHERE purchaseId=? AND fault='suppress_capture_response' AND faultFired=0").run(purchaseId).changes === 1;
  }
  createRun(plan: unknown) {
    const id = randomUUID(), now = new Date().toISOString();
    this.db.prepare("INSERT INTO runs VALUES(?,'created',?,?,?)").run(id,JSON.stringify(plan),now,now); return id;
  }
  run(id: string) { return this.db.prepare('SELECT * FROM runs WHERE id=?').get(id); }
  setRunState(id: string,state: string) { this.db.prepare('UPDATE runs SET state=?,updated_at=? WHERE id=?').run(state,new Date().toISOString(),id); }
  appendEvent(runId: string, scenarioId: string | null, source: string, provenance: string, data: unknown) {
    this.db.prepare('INSERT INTO events SELECT ?,COALESCE(MAX(sequence),0)+1,?,?,?,?,? FROM events WHERE run_id=?').run(runId,scenarioId,source,provenance,new Date().toISOString(),JSON.stringify(data),runId);
  }
  events(runId: string) { return this.db.prepare('SELECT * FROM events WHERE run_id=? ORDER BY sequence').all(runId); }
}
