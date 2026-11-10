import { z } from 'zod';
export const purchaseSchema = z.object({
  purchaseId: z.string().uuid(), amountCents: z.number().int().min(1).max(10000),
  currency: z.literal('USD').default('USD'), productId: z.literal('sample-guide').default('sample-guide'),
}).strict();
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export const fixtureModeSchema = z.enum(['corrected','premature_fulfillment','duplicate_processing']);
export type FixtureMode = z.infer<typeof fixtureModeSchema>;
export const operationSchema = z.object({ operationId: z.string().uuid() }).strict();
export const adapterVersion = '1.0';
export const capabilities = ['create_order','handle_buyer_return','capture','observe_application','check_download','process_again','reconcile','arm_fault'] as const;
export class AppError extends Error {
  constructor(public code: string, public statusCode = 400) { super(code); }
}
