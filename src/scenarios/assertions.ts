import type { ApplicationObservation, ProviderObservation, RunnerPlan } from '../runner/types.js';

// Payment evidence is retrieved independently of target decisions and fixture configuration.
export function matchingCapture(payment:ProviderObservation,application:ApplicationObservation,plan:RunnerPlan) {
  return payment.provenance==='simulated' && payment.id===application.providerOrderId && payment.purchaseId===application.purchaseId &&
    payment.merchantId==='SIMULATED-MERCHANT' && payment.status==='COMPLETED' && payment.amountCents===plan.amountCents &&
    payment.currency===plan.currency && payment.captures.length===1 && payment.captures[0]!.status==='COMPLETED' &&
    payment.captures[0]!.amountCents===plan.amountCents && payment.captures[0]!.currency===plan.currency;
}
export function approvedUnpaid(payment:ProviderObservation,application:ApplicationObservation,plan:RunnerPlan) {
  return payment.id===application.providerOrderId && payment.purchaseId===application.purchaseId && payment.merchantId==='SIMULATED-MERCHANT' &&
    payment.amountCents===plan.amountCents && payment.currency===plan.currency && payment.status==='APPROVED' && payment.captures.length===0;
}
export function oneDelivery(application:ApplicationObservation,accessible:boolean) {
  return application.entitlementCount===1 && application.downloadAccessible && accessible;
}
