import { createHash, randomUUID } from 'node:crypto';
import type { Store } from '../storage/database.js';
import type { CaseResult, Evidence, RunReport, RunnerPlan, RunState, ScenarioId } from './types.js';

export class RunRepository {
  constructor(private store:Store) {
    store.db.exec(`CREATE TABLE IF NOT EXISTS runner_runs(id TEXT PRIMARY KEY,state TEXT NOT NULL,plan_json TEXT NOT NULL,plan_hash TEXT NOT NULL,adapter_version TEXT);
      CREATE TABLE IF NOT EXISTS runner_steps(run_id TEXT NOT NULL,scenario_id TEXT NOT NULL,name TEXT NOT NULL,state TEXT NOT NULL,data_json TEXT,PRIMARY KEY(run_id,scenario_id,name));
      CREATE TABLE IF NOT EXISTS runner_evidence(run_id TEXT NOT NULL,sequence INTEGER NOT NULL,data_json TEXT NOT NULL,PRIMARY KEY(run_id,sequence));
      CREATE TABLE IF NOT EXISTS runner_results(run_id TEXT NOT NULL,scenario_id TEXT NOT NULL,data_json TEXT NOT NULL,PRIMARY KEY(run_id,scenario_id));`);
  }
  create(plan:RunnerPlan){const id=randomUUID();this.store.db.prepare("INSERT INTO runner_runs VALUES(?,'created',?,?,NULL)").run(id,JSON.stringify(plan),createHash('sha256').update(JSON.stringify(plan)).digest('hex'));return id;}
  state(id:string,state:RunState){this.store.db.prepare('UPDATE runner_runs SET state=? WHERE id=?').run(state,id);}
  version(id:string,version:string){this.store.db.prepare('UPDATE runner_runs SET adapter_version=? WHERE id=?').run(version,id);}
  step(id:string,scenario:ScenarioId,name:string){const row=this.store.db.prepare('SELECT state,data_json FROM runner_steps WHERE run_id=? AND scenario_id=? AND name=?').get(id,scenario,name);return row?{state:String(row.state),data:row.data_json===null?undefined:JSON.parse(String(row.data_json)) as unknown}:undefined;}
  saveStep(id:string,scenario:ScenarioId,name:string,state:string,data:unknown=null){this.store.db.prepare('INSERT OR REPLACE INTO runner_steps VALUES(?,?,?,?,?)').run(id,scenario,name,state,JSON.stringify(data));}
  evidence(id:string,scenarioId:ScenarioId,source:Evidence['source'],action:string,data:unknown){
    const sequence=Number(this.store.db.prepare('SELECT COALESCE(MAX(sequence),0)+1 AS n FROM runner_evidence WHERE run_id=?').get(id)!.n);
    const event:Evidence={id:`${id}:${sequence}`,sequence,scenarioId,source,action,data,observedAt:new Date().toISOString(),provenance:'simulated'};
    this.store.db.prepare('INSERT INTO runner_evidence VALUES(?,?,?)').run(id,sequence,JSON.stringify(event));return event;
  }
  result(id:string,result:CaseResult){this.store.db.prepare('INSERT OR REPLACE INTO runner_results VALUES(?,?,?)').run(id,result.scenarioId,JSON.stringify(result));}
  report(id:string):RunReport {
    const row=this.store.db.prepare('SELECT * FROM runner_runs WHERE id=?').get(id);if(!row)throw new Error('Run not found');
    const evidence=this.store.db.prepare('SELECT data_json FROM runner_evidence WHERE run_id=? ORDER BY sequence').all(id).map(r=>JSON.parse(String(r.data_json)) as Evidence);
    const cases=this.store.db.prepare('SELECT data_json FROM runner_results WHERE run_id=? ORDER BY scenario_id').all(id).map(r=>JSON.parse(String(r.data_json)) as CaseResult);
    const approvals=this.store.db.prepare("SELECT data_json FROM runner_steps WHERE run_id=? AND name='approval-needed' AND state='waiting'").all(id).map(r=>JSON.parse(String(r.data_json)) as RunReport['approvals'][number]);
    return {id,state:row.state as RunState,plan:JSON.parse(String(row.plan_json)) as RunnerPlan,planHash:String(row.plan_hash),adapterVersion:row.adapter_version===null?null:String(row.adapter_version),provenance:'simulated',realPayPalVerified:false,cases,evidence,approvals};
  }
}
