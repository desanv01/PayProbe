import { z } from 'zod';
import { AdapterError, type Adapter } from '../runner/types.js';

const provenance=z.literal('simulated');
const app=z.object({purchaseId:z.string().uuid(),providerOrderId:z.string().nullable(),state:z.string(),amountCents:z.number().int(),currency:z.literal('USD'),productId:z.string(),approvalUrl:z.string().nullable(),entitlementCount:z.number().int().nonnegative(),downloadAccessible:z.boolean(),fault:z.object({armed:z.boolean(),fired:z.boolean()}),provenance});
const provider=z.object({id:z.string(),purchaseId:z.string().uuid(),status:z.enum(['CREATED','APPROVED','COMPLETED']),amountCents:z.number().int(),currency:z.literal('USD'),merchantId:z.string(),captures:z.array(z.object({id:z.string(),status:z.literal('COMPLETED'),amountCents:z.number().int(),currency:z.literal('USD')})),provenance});
export class HttpAdapter implements Adapter {
  private base:string;
  constructor(private options:{baseUrl:string;token?:string;fetch?:typeof fetch;timeoutMs?:number}) {
    const url=new URL(options.baseUrl);
    if (!['http:','https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Invalid adapter URL');
    this.base=options.baseUrl.replace(/\/$/,'');
  }
  private async request<T>(path:string,schema:z.ZodType<T>,body?:unknown):Promise<T> {
    let response:Response;
    try { response=await (this.options.fetch??fetch)(`${this.base}${path}`,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...(this.options.token?{authorization:`Bearer ${this.options.token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(this.options.timeoutMs??5000),redirect:'error'}); }
    catch { throw new AdapterError('adapter_transport_unavailable',0); }
    if (!response.ok) {
      let code='adapter_http_error';
      try { const data=await response.json() as {error?:unknown}; if(typeof data.error==='string' && /^[a-z_]{1,80}$/.test(data.error)) code=data.error; } catch { /* Never expose response bodies. */ }
      throw new AdapterError(code,response.status);
    }
    try { return schema.parse(await response.json()); } catch { throw new AdapterError('invalid_adapter_observation',502); }
  }
  capabilities(){return this.request('/adapter/capabilities',z.object({version:z.string(),capabilities:z.array(z.string()),provenance}));}
  create(input:Parameters<Adapter['create']>[0]){return this.request('/adapter/orders',app,input);}
  observe(id:string){return this.request(`/adapter/orders/${encodeURIComponent(id)}`,app);}
  buyerReturn(id:string){return this.action(id,'buyer-return');}
  capture(id:string,operationId:string){return this.action(id,'capture',{operationId});}
  reconcile(id:string){return this.action(id,'reconcile');}
  processAgain(id:string){return this.action(id,'process-again');}
  armFault(id:string){return this.action(id,'arm-fault');}
  checkDownload(id:string){return this.request(`/adapter/orders/${encodeURIComponent(id)}/check-download`,z.object({accessible:z.boolean(),provenance}));}
  observeProvider(id:string){return this.request(`/provider/orders/${encodeURIComponent(id)}`,provider);}
  approveSimulated(id:string){return this.request(`/simulated/orders/${encodeURIComponent(id)}/approve`,provider,{});}
  private action(id:string,name:string,body:unknown={}){return this.request(`/adapter/orders/${encodeURIComponent(id)}/${name}`,app,body);}
}
