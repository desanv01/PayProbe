import type { RunReport } from '../runner/types.js';
import { sanitizeText } from '../ai/planner.js';

// Explicit observation field allowlist: never export credentials or download capability URLs.
const allowed=new Set(['purchaseId','providerOrderId','state','status','amountCents','currency','productId','entitlementCount','downloadAccessible','accessible','fault','armed','fired','provenance','id','merchantId','captures','code','error','operationId','kind','count','expected','actual','captureId','requestId','reason','completed','uncertain']);
export function sanitizeObservation(value:unknown,depth=0):unknown {
  if (depth>6) return '[depth limit]';
  if (value===null || typeof value==='number' || typeof value==='boolean') return value;
  if (typeof value==='string') return sanitizeText(value).slice(0,500);
  if (Array.isArray(value)) return value.slice(0,20).map(v=>sanitizeObservation(v,depth+1));
  if (typeof value==='object'&&value) return Object.fromEntries(Object.entries(value).filter(([k])=>allowed.has(k)).map(([k,v])=>[k,sanitizeObservation(v,depth+1)]));
  return null;
}
export function projectReport(report:RunReport) {
  const evidence=report.evidence.map(e=>({id:e.id,sequence:e.sequence,scenarioId:e.scenarioId,source:e.source,action:sanitizeText(e.action),observedAt:e.observedAt,provenance:e.provenance,data:sanitizeObservation(e.data)}));
  return {version:'1.0',id:report.id,state:report.state,provider:'simulated',provenance:'simulated',realPayPalVerified:false,
    plan:report.plan,planHash:report.planHash,adapterVersion:report.adapterVersion,
    cases:report.cases.map(c=>({...c,reason:sanitizeText(c.reason)})),evidence,
    pendingScenarios:report.plan.scenarios.filter(id=>!report.cases.some(c=>c.scenarioId===id)),
    approvals:report.approvals.map(a=>({purchaseId:a.purchaseId,approvalUrl:safeApprovalUrl(a.approvalUrl),action:'POST the simulator approval URL, then resume. This is simulated approval, not PayPal approval.'})),
    limitations:['Simulated payment evidence only. Real PayPal verification and submission readiness are not established.','Missing evidence is not a pass. AI explanations do not change deterministic verdicts.']};
}
function safeApprovalUrl(value:string|null):string|null {
  if(!value)return null;
  try {const url=new URL(value);if(!['http:','https:'].includes(url.protocol)||url.username||url.password||!/^\/simulated\/orders\/SIM-ORDER-[a-f0-9]+\/approve$/.test(url.pathname))return null;url.search='';url.hash='';return url.toString();}catch{return null;}
}
export function formatReport(report:RunReport,format:'text'|'json'='text'):string {
  const view=projectReport(report);
  if(format==='json')return JSON.stringify(view,null,2);
  return [`Run ${view.id}: ${view.state}`,'Payment provider/provenance: simulated; real PayPal verified: false',`Plan hash: ${view.planHash}`,`Adapter: ${view.adapterVersion??'unknown'}`,
    ...view.cases.map(c=>`${c.scenarioId} ${c.verdict}: ${c.reason}\n  Evidence: ${c.evidenceIds.join(', ')||'none'}`),
    ...view.pendingScenarios.map(id=>`${id} PENDING: no deterministic result recorded`),
    ...view.approvals.map(a=>`Simulated approval for ${a.purchaseId}: ${a.approvalUrl??'URL unavailable'}\n  ${a.action}`),
    ...view.evidence.map(e=>`${e.id} [${e.source}/${e.provenance}] ${e.action}: ${JSON.stringify(e.data)}`),...view.limitations].join('\n');
}
