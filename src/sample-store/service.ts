import type { Store, Order } from '../storage/database.js';
import type { PaymentOrder, PaymentProvider } from '../providers/payment.js';
import { AppError, type PurchaseInput, type FixtureMode } from '../core/schemas.js';

// This boundary discards a completed capture response before target business logic sees it.
export class TargetPaymentTransport {
  constructor(private provider: PaymentProvider, private store: Store) {}
  create(input: PurchaseInput, requestId: string) { return this.provider.create(input,requestId); }
  get(id: string) { return this.provider.get(id); }
  async capture(order: Order, requestId: string) {
    const response = await this.provider.capture(order.providerOrderId!,requestId);
    if (response.status === 'COMPLETED' && this.store.consumeFault(order.purchaseId)) throw new AppError('capture_response_suppressed',504);
    return response;
  }
}
export class SampleStore {
  private transport: TargetPaymentTransport;
  constructor(private store: Store, provider: PaymentProvider) { this.transport = new TargetPaymentTransport(provider,store); }
  async create(input: PurchaseInput, operationId: string, fixtureMode: FixtureMode = 'corrected') {
    let order = this.store.createOrder(input);
    this.store.setFixtureMode(input.purchaseId,fixtureMode);
    const op = this.store.operation(operationId,input.purchaseId,'create',input);
    if (order.providerOrderId) return this.observe(input.purchaseId);
    // Unknown create response may be retried with its persisted exact identity in this simulator.
    // A future live provider must implement endpoint-specific retention/reconciliation policy.
    if (op.state === 'in_flight') throw new AppError('operation_in_flight',409);
    this.store.setOperation(operationId,'in_flight');
    try {
      const payment = await this.transport.create(input,operationId);
      this.store.updateOrder(input.purchaseId,'awaiting_approval',payment.id,payment.approvalUrl);
      this.store.setOperation(operationId,'completed',{providerOrderId:payment.id});
    } catch (e) { this.store.setOperation(operationId,'uncertain'); throw e; }
    return this.observe(input.purchaseId);
  }
  private matching(order: Order, payment: PaymentOrder) {
    if (payment.id !== order.providerOrderId || payment.purchaseId !== order.purchaseId || payment.merchantId !== 'SIMULATED-MERCHANT' || payment.amountCents !== order.amountCents || payment.currency !== order.currency || payment.status !== 'COMPLETED' || payment.captures.length !== 1) return undefined;
    const capture = payment.captures[0]!;
    return capture.status === 'COMPLETED' && capture.amountCents === order.amountCents && capture.currency === order.currency ? capture : undefined;
  }
  private complete(order: Order,payment: PaymentOrder) {
    const capture = this.matching(order,payment);
    if (!capture) throw new AppError('completed_matching_capture_not_observed',409);
    const alreadyFulfilled = Boolean(this.store.db.prepare('SELECT id FROM entitlements WHERE purchaseId=?').get(order.purchaseId));
    this.store.fulfill(order.purchaseId,capture.id);
    if (alreadyFulfilled && this.store.fixtureMode(order.purchaseId) === 'duplicate_processing') this.store.seedDelivery(order.purchaseId,'duplicate_processing');
  }
  async buyerReturn(id: string) {
    const order = this.store.order(id);
    if (!order.providerOrderId) throw new AppError('provider_order_missing',409);
    const payment = await this.transport.get(order.providerOrderId);
    // Return NEVER captures; S1 can independently observe APPROVED before capture.
    if (this.matching(order,payment)) this.complete(order,payment);
    else {
      this.store.updateOrder(id,payment.status === 'APPROVED' ? 'approved_unpaid' : 'awaiting_approval');
      // Disclosed simulation-only seeded bug: deliver on approval without capture.
      // Evaluator observes count/access and independent provider truth, never this flag.
      if (payment.status === 'APPROVED' && this.store.fixtureMode(id) === 'premature_fulfillment' && this.store.count(id) === 0) this.store.seedDelivery(id,'premature_fulfillment');
    }
    return this.observe(id);
  }
  async capture(id: string, operationId: string) {
    const order = this.store.order(id);
    if (!order.providerOrderId) throw new AppError('provider_order_missing',409);
    const op = this.store.operation(operationId,id,'capture',{providerOrderId:order.providerOrderId});
    if (op.state === 'completed') return this.reconcile(id);
    if (op.state !== 'prepared') throw new AppError('capture_uncertain_reconcile_required',409);
    this.store.setOperation(operationId,'in_flight'); this.store.updateOrder(id,'capturing');
    try {
      const payment = await this.transport.capture(order,operationId);
      this.complete(order,payment);
      this.store.setOperation(operationId,'completed',{providerOrderId:payment.id,captureId:payment.captures[0]?.id});
    } catch (e) {
      // The simulator rejects this request before any capture mutation. Preserve
      // its identity so explicit later approval can retry the same operation.
      if (e instanceof AppError && e.code === 'simulated_buyer_approval_required') {
        this.store.setOperation(operationId,'prepared'); this.store.updateOrder(id,'awaiting_approval');
      } else {
        this.store.setOperation(operationId,'uncertain'); this.store.updateOrder(id,'capture_uncertain');
      }
      throw e;
    }
    return this.observe(id);
  }
  async reconcile(id: string) {
    const order = this.store.order(id);
    if (!order.providerOrderId) throw new AppError('provider_order_missing',409);
    const payment = await this.transport.get(order.providerOrderId);
    const capture = this.matching(order,payment);
    if (capture) {
      this.complete(order,payment);
      const op = this.store.db.prepare("SELECT id FROM operations WHERE purchaseId=? AND kind='capture'").get(id);
      if (op) this.store.setOperation(String(op.id),'completed',{providerOrderId:payment.id,captureId:capture.id,reconciled:true});
    } else if (order.state !== 'capture_uncertain') this.store.updateOrder(id,payment.status === 'APPROVED' ? 'approved_unpaid' : 'awaiting_approval');
    return this.observe(id);
  }
  observe(id: string) {
    const order = this.store.order(id), entitlementCount = this.store.count(id);
    return { purchaseId:id,providerOrderId:order.providerOrderId,state:order.state,amountCents:order.amountCents,currency:order.currency,productId:order.productId,approvalUrl:order.approvalUrl,entitlementCount,downloadAccessible:entitlementCount > 0,fault:{armed:order.fault !== 'none',fired:Boolean(order.faultFired)},provenance:'simulated' as const };
  }
  download(id: string, token: string) {
    const order = this.store.order(id);
    if (token !== order.downloadToken || this.store.count(id) < 1) throw new AppError('download_forbidden',403);
    return 'PayProbe sample guide\nThis protected digital product was delivered by the simulated sample store.\n';
  }
}
