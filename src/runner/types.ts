import { z } from 'zod';

export const scenarioIds = ['S1','S2','S3','S4'] as const;
export type ScenarioId = typeof scenarioIds[number];
export const runnerPlanSchema = z.object({
  version:z.literal('1.0'), scenarios:z.array(z.enum(scenarioIds)).min(1).max(4)
    .refine(ids=>new Set(ids).size===ids.length,'Duplicate scenarios'),
  amountCents:z.number().int().min(1).max(10000).default(500),
  currency:z.literal('USD').default('USD'), productId:z.literal('sample-guide').default('sample-guide'),
  fulfillmentTimeoutMs:z.number().int().min(0).max(10000).default(1000),
  fixtureMode:z.enum(['corrected','premature_fulfillment','duplicate_processing']).optional(),
}).strict();
export type RunnerPlan = z.infer<typeof runnerPlanSchema>;
export type Verdict = 'PASS'|'FAIL'|'INCONCLUSIVE'|'UNSUPPORTED'|'ERROR';
export type RunState = 'created'|'running'|'awaiting_approval'|'paused'|'finished'|'error';
export type ApplicationObservation = {
  purchaseId:string; providerOrderId:string|null; state:string; amountCents:number; currency:'USD';
  productId:string; approvalUrl:string|null; entitlementCount:number; downloadAccessible:boolean;
  fault:{armed:boolean;fired:boolean}; provenance:'simulated';
};
export type ProviderObservation = {
  id:string; status:'CREATED'|'APPROVED'|'COMPLETED'; purchaseId:string; amountCents:number;
  currency:'USD'; merchantId:string; captures:{id:string;status:'COMPLETED';amountCents:number;currency:'USD'}[];
  provenance:'simulated';
};
export type Evidence = { id:string; sequence:number; scenarioId:ScenarioId; source:'application'|'provider'|'fault'|'runner'; action:string; observedAt:string; provenance:'simulated'; data:unknown };
export type CaseResult = { scenarioId:ScenarioId; verdict:Verdict; reason:string; evidenceIds:string[] };
export type RunReport = { id:string; state:RunState; plan:RunnerPlan; planHash:string; adapterVersion:string|null; provenance:'simulated'; realPayPalVerified:false; cases:CaseResult[]; evidence:Evidence[]; approvals:{purchaseId:string;approvalUrl:string|null}[] };
export interface Adapter {
  capabilities():Promise<{version:string;capabilities:string[];provenance:'simulated'}>;
  create(input:{purchaseId:string;operationId:string;amountCents:number;currency:'USD';productId:'sample-guide';fixtureMode?:'corrected'|'premature_fulfillment'|'duplicate_processing'}):Promise<ApplicationObservation>;
  observe(purchaseId:string):Promise<ApplicationObservation>;
  buyerReturn(purchaseId:string):Promise<ApplicationObservation>;
  capture(purchaseId:string,operationId:string):Promise<ApplicationObservation>;
  reconcile(purchaseId:string):Promise<ApplicationObservation>;
  processAgain(purchaseId:string):Promise<ApplicationObservation>;
  armFault(purchaseId:string):Promise<ApplicationObservation>;
  checkDownload(purchaseId:string):Promise<{accessible:boolean;provenance:'simulated'}>;
  observeProvider(providerOrderId:string):Promise<ProviderObservation>;
  approveSimulated(providerOrderId:string):Promise<ProviderObservation>;
}
export class AdapterError extends Error {
  constructor(public code:string,public status:number) { super(code); }
}
