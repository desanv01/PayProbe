import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync,rmSync } from 'node:fs';
import { join } from 'node:path';
import { Store } from '../src/storage/database.js';
import { SimulatedProvider } from '../src/providers/simulated.js';
import { SampleStore } from '../src/sample-store/service.js';
import { buildServer } from '../src/api/server.js';
import type { Config } from '../src/core/config.js';

test('approval remains unpaid, completed capture grants one protected download, repeated processing stays singular',async()=>{
  const db=new Store(':memory:'), provider=new SimulatedProvider(db,'http://localhost:4310'), target=new SampleStore(db,provider);
  try {
    const purchaseId=randomUUID(),createId=randomUUID(),captureId=randomUUID();
    const input={purchaseId,amountCents:199,currency:'USD' as const,productId:'sample-guide' as const};
    const created=await target.create(input,createId);
    assert.equal(created.entitlementCount,0);
    await assert.rejects(target.create({...input,amountCents:200},createId),/purchase_id_conflict/);
    await provider.approve(created.providerOrderId!);
    assert.equal((await provider.get(created.providerOrderId!)).status,'APPROVED');
    assert.equal((await target.buyerReturn(purchaseId)).entitlementCount,0);
    assert.throws(()=>target.download(purchaseId,db.order(purchaseId).downloadToken),/download_forbidden/);
    assert.equal((await target.capture(purchaseId,captureId)).entitlementCount,1);
    for(let i=0;i<3;i++) assert.equal((await target.reconcile(purchaseId)).entitlementCount,1);
    assert.equal((await provider.get(created.providerOrderId!)).captures.length,1);
    assert.match(target.download(purchaseId,db.order(purchaseId).downloadToken),/sample guide/);
    assert.throws(()=>target.download(purchaseId,'wrong-token'),/download_forbidden/);
    await assert.rejects(target.capture(purchaseId,randomUUID()),/operation_identity_conflict/);
  } finally {db.close();}
});

test('lost response leaves target uncertain; restart and target reconciliation recover existing completed capture',async()=>{
  const dir=mkdtempSync(join(process.cwd(),'.payprobe-test-')),path=join(dir,'resume.sqlite');
  let db=new Store(path);
  try {
    let provider=new SimulatedProvider(db,'http://localhost:4310'),target=new SampleStore(db,provider);
    const purchaseId=randomUUID(),captureId=randomUUID();
    const created=await target.create({purchaseId,amountCents:250,currency:'USD',productId:'sample-guide'},randomUUID());
    await provider.approve(created.providerOrderId!); db.armFault(purchaseId);
    await assert.rejects(target.capture(purchaseId,captureId),/capture_response_suppressed/);
    assert.equal((await provider.get(created.providerOrderId!)).status,'COMPLETED');
    assert.equal(target.observe(purchaseId).state,'capture_uncertain');
    assert.equal(target.observe(purchaseId).entitlementCount,0);
    assert.equal(target.observe(purchaseId).fault.fired,true);
    db.close();db=new Store(path);provider=new SimulatedProvider(db,'http://localhost:4310');target=new SampleStore(db,provider);
    await assert.rejects(target.capture(purchaseId,captureId),/capture_uncertain_reconcile_required/);
    assert.equal((await target.reconcile(purchaseId)).entitlementCount,1);
    assert.equal((await provider.get(created.providerOrderId!)).captures.length,1);
  } finally {db.close();rmSync(dir,{recursive:true,force:true});}
});

test('headless HTTP contract authenticates mutations and independent observer stays read only',async()=>{
  const config:Config={DEEPSEEK_MODEL:'deepseek-flash',PAYPROBE_PROVIDER:'simulated',PAYPROBE_HOST:'127.0.0.1',PAYPROBE_PORT:4310,PAYPROBE_PUBLIC_URL:'http://127.0.0.1:4310',PAYPROBE_DB_PATH:':memory:',PAYPROBE_API_TOKEN:'test-only'};
  const {app}=buildServer(config);
  try {
    assert.equal((await app.inject({method:'GET',url:'/health'})).statusCode,200);
    assert.equal((await app.inject({method:'POST',url:'/adapter/orders',payload:{}})).statusCode,401);
    const headers={authorization:'Bearer test-only'}, purchaseId=randomUUID();
    const response=await app.inject({method:'POST',url:'/adapter/orders',headers,payload:{purchaseId,operationId:randomUUID(),amountCents:100}});
    assert.equal(response.statusCode,200);
    const order=response.json();
    const link=await app.inject({method:'GET',url:`/simulated/orders/${order.providerOrderId}/approve`,headers});
    assert.equal(link.json().order.status,'CREATED');
    const observed=await app.inject({method:'GET',url:`/provider/orders/${order.providerOrderId}`,headers});
    assert.equal(observed.json().status,'CREATED');
    assert.equal((await app.inject({method:'POST',url:'/api/deepseek/probe',headers})).json().error,'deepseek_key_missing');
  } finally {await app.close();}
});
