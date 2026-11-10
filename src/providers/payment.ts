export type PaymentOrder = {
  id: string; status: 'CREATED' | 'APPROVED' | 'COMPLETED'; purchaseId: string;
  amountCents: number; currency: 'USD'; merchantId: string;
  approvalUrl: string; captures: { id: string; status: 'COMPLETED'; amountCents: number; currency: 'USD' }[];
  provenance: 'simulated';
};
export interface PaymentProvider {
  readonly provenance: 'simulated';
  create(input: { purchaseId: string; amountCents: number; currency: 'USD' }, requestId: string): Promise<PaymentOrder>;
  get(orderId: string): Promise<PaymentOrder>;
  capture(orderId: string, requestId: string): Promise<PaymentOrder>;
}
