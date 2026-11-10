import type { Store } from '../storage/database.js';
import { AppError } from '../core/schemas.js';
import { loadSavedPlan,toRunnerPlan,type SavedPlan } from './planner.js';

/** Keep the reviewed source artifact independent of AI availability and run execution. */
export class ReviewedPlanStore {
  constructor(private store:Store) {
    store.db.exec(`CREATE TABLE IF NOT EXISTS reviewed_plans(hash TEXT PRIMARY KEY,saved_json TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS reviewed_plan_runs(run_id TEXT PRIMARY KEY,hash TEXT NOT NULL REFERENCES reviewed_plans(hash));`);
  }
  save(input:unknown):SavedPlan {
    const saved=loadSavedPlan(input,true);
    this.store.db.prepare('INSERT OR IGNORE INTO reviewed_plans VALUES(?,?)').run(saved.hash,JSON.stringify(saved));
    return saved;
  }
  attach(runId:string,input:unknown) {
    const saved=this.save(input);
    const row=this.store.db.prepare('SELECT plan_json FROM runner_runs WHERE id=?').get(runId);
    if(!row||JSON.stringify(JSON.parse(String(row.plan_json)))!==JSON.stringify(toRunnerPlan(saved.plan)))throw new AppError('reviewed_run_plan_mismatch');
    const prior=this.store.db.prepare('SELECT hash FROM reviewed_plan_runs WHERE run_id=?').get(runId);
    if(prior&&prior.hash!==saved.hash)throw new AppError('reviewed_run_identity_conflict');
    this.store.db.prepare('INSERT OR IGNORE INTO reviewed_plan_runs VALUES(?,?)').run(runId,saved.hash);
  }
  forRun(runId:string):SavedPlan|undefined {
    const row=this.store.db.prepare('SELECT saved_json FROM reviewed_plans JOIN reviewed_plan_runs USING(hash) WHERE run_id=?').get(runId);
    return row?loadSavedPlan(JSON.parse(String(row.saved_json)),true):undefined;
  }
}
