# PayProbe project state
Updated: 2026-11-10, approximately 12:00 MYT
Canonical folder: <project-root>
Full checklist: TASK-BOARD.md. Plan: PayProbe-Implementation-Gameplan-v2-2026-11-10.md; current-scope overrides supersede historical milestones.

## Current result
The reviewed headless workflow is connected. Actual DeepSeek planning and explanation pass against a completed four-scenario simulated run with 42 evidence events. Approved graphite/amber/ivory/plum TUI/browser modules are merged; P1 is connecting them to the production CLI and server. Actual UI verification and delivery remain pending.

## Scope and working rules
- Only deterministic simulated payments. No PayPal credentials or calls until the user resumes the deferred provider stage (#9).
- Runtime AI uses DeepSeek through the openai SDK configured exclusively for DeepSeek. deepseek-flash is the documented rolling alias currently serving V4.1-Flash-1017, not an immutable snapshot.
- User approved layout/interactions/states and requested another palette; Main selected graphite/amber/ivory/plum v1.1. No further approval gate for that authorized change.
- No local Git initialization, commits or worktrees. Remote GitHub API commits use explicit file allowlists; never upload .env.local, private databases, dependencies or local evidence artifacts.
- Six persistent workers operate under TASK-BOARD.md ownership. Main owns integration, root README, this file, task board and plan.

## Integrated source
Repository: https://github.com/desanv01/PayProbe
Latest observed main: dd705c62931cf7952e6aeaa849f68cfd448b9ddd.
- #8 foundation; #12 HTTP regression checks; #14 initial release docs.
- #16 runner; #15 AI workflows; #18 reviewed CLI integration.
- #19 actual process restart/redaction check; #20 safe categorical AI error diagnostics.
- #22 concise explanation repair (e2a95dd); #13 approved UI modules/artifacts (b6b5d80); #23 command-aligned release docs (dd705c6).
- #17 shared progress docs needs refresh/merge. P1 new UI integration PR is next.
Use exact current remote heads when publishing/merging; this snapshot is not a lock.

## Observed checks
- Node 24.14.1, npm 11.19.0. Build/typecheck, foundation, runner, AI workflow doubles and HTTP recovery checks passed for their relevant source revisions.
- Real health probe: 81 total tokens. Real planner: 419 total tokens. Main reviewed the generated plan and executed all four simulated cases: PASS, 42 evidence events.
- First explanation attempts truncated at 1,200 output tokens. Repair keeps provider budgets unchanged and requires concise text with 1–2 relevant references. Real repaired explanation: first attempt, 9,138 prompt + 366 completion = 9,504 tokens; all four cases, valid references, 42 supplied/0 omitted evidence. Issue #21 closed after verification.
- Actual backend process stop/restart preserved reviewed plan/run identity and completed all four cases with one entitlement per purchase. Text/JSON redaction canaries and missing-review refusal passed. PR #19 merged.
- P4 module checks: TUI navigation/restoration and browser session/CSRF ownership passed; seeded duplicate fixture yielded PASS PASS FAIL PASS using actual runner with an AI client double. Production bindings and actual-browser visual checks still pending.
- No real PayPal verification, hosted access, video upload, hackathon eligibility or submission readiness claimed.

## Runtime notes
Local validation used an isolated loopback server and private SQLite database; these artifacts are excluded from publication.
Validation run identifiers and artifacts remain in the ignored local evidence directory. Credentials must never be printed or published.
Default serve port is 4310. Commands: doctor, serve, plan CONTRACT --out DRAFT, plan --review DRAFT --out REVIEWED, run REVIEWED [--auto-approve-simulated], resume ID, report ID --format text|json, explain ID --out PATH.
node:sqlite emits an experimental warning. Browser sessions are currently memory-only and expire after restart; underlying runs remain in SQLite.

## Next work
1. P1 binds /demo and TUI, updates scripts/CI to include actual process and UI tests.
2. P4 checks actual UI appearance/interaction; P5 checks connected interfaces and clean installation once ready, without repeating unchanged suites.
3. P6 prepares actual runtime recording and concrete deployment/package guidance. Main integrates README/progress docs.
4. Public hosting/video/submission need actual access and evidence; do not infer readiness from local completion. Real PayPal stays separately deferred.
