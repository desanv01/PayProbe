import { createHash } from 'node:crypto';
import type { Store } from '../storage/database.js';
import { AppError } from '../core/schemas.js';
import type { PaymentOrder, PaymentProvider } from './payment.js';

// Separate provider ledger: target fulfillment state is never payment truth.
// No network calls, credentials, PayPal pages or production-money operations.
export class SimulatedProvider implements PaymentProvider {
  readonly provenance = 'simulated' as const;
  constructor(private store: Store, private publicUrl: string) {
    store.db.exec(`CREATE TABLE IF NOT EXISTS simulated_provider_orders(id TEXT PRIMARY KEY, purchase_id TEXT NOT NULL UNIQUE, create_request_id TEXT NOT NULL UNIQUE, capture_request_id TEXT UNIQUE, data_json TEXT NOT NULL);`);
  }
  private id(prefix: string, value: string) { return `${prefix}-${createHash('sha256').update(value).digest('hex').slice(0,24)}`; }
  async create(input: { purchaseId: string; amountCents: number; currency: 'USD' }, requestId: string) {
    const row = this.store.db.prepare('SELECT * FROM simulated_provider_orders WHERE create_request_id=? OR purchase_id=?').get(requestId,input.purchaseId);
    if (row) {
      const order = JSON.parse(String(row.data_json)) as PaymentOrder;
      if (row.create_request_id !== requestId || order.purchaseId !== input.purchaseId || order.amountCents !== input.amountCents || order.currency !== input.currency) throw new AppError('provider_request_conflict',409);
      return order;
    }
    const id = this.id('SIM-ORDER',requestId);
    const order: PaymentOrder = { ...input, id, status:'CREATED', merchantId:'SIMULATED-MERCHANT', approvalUrl:`${this.publicUrl}/simulated/orders/${id}/approve`, captures:[], provenance:'simulated' };
    this.store.db.prepare('INSERT INTO simulated_provider_orders VALUES(?,?,?,NULL,?)').run(id,input.purchaseId,requestId,JSON.stringify(order)); return order;
  }
  async get(id: string): Promise<PaymentOrder> {
    const row = this.store.db.prepare('SELECT data_json FROM simulated_provider_orders WHERE id=?').get(id);
    if (!row) throw new AppError('provider_order_not_found',404);
    return JSON.parse(String(row.data_json)) as PaymentOrder;
  }
  async approve(id: string) {
    const order = await this.get(id);
    if (order.status === 'CREATED') { order.status = 'APPROVED'; this.save(order); }
    return order;
  }
  async capture(id: string, requestId: string) {
    const order = await this.get(id);
    const row = this.store.db.prepare('SELECT capture_request_id FROM simulated_provider_orders WHERE id=?').get(id)!;
    if (order.status === 'COMPLETED') {
      if (row.capture_request_id !== requestId) throw new AppError('provider_capture_identity_conflict',409);
      return order;
    }
    if (order.status !== 'APPROVED') throw new AppError('simulated_buyer_approval_required',409);
    order.status = 'COMPLETED';
    order.captures = [{ id:this.id('SIM-CAPTURE',requestId),status:'COMPLETED',amountCents:order.amountCents,currency:order.currency }];
    this.store.db.prepare('UPDATE simulated_provider_orders SET capture_request_id=?,data_json=? WHERE id=?').run(requestId,JSON.stringify(order),id);
    return order;
  }
  private save(order: PaymentOrder) { this.store.db.prepare('UPDATE simulated_provider_orders SET data_json=? WHERE id=?').run(JSON.stringify(order),order.id); }
}
