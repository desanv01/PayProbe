# PayProbe task board
Updated: 2026-11-10 — parallel execution.
Legend: DONE = implemented/observed at stated scope; ACTIVE = underway; TODO = not yet completed; WAIT = external/approval/dependency; DEFERRED = intentionally later.
Payment scope: explicit simulator only. Real DeepSeek probe passed. No real PayPal behavior is verified.
Main owns this board; workers update docs/handoffs/Pn.md and send meaningful progress.

## P0 — Repository baseline [DONE]
- DONE Public repository desanv01/PayProbe and MIT license.
- DONE Agreed plan, rules, ignore policy and baseline PR #1 merged.
- DONE Phase tracking issues #2–#7 and deferred PayPal issue #9.
- DONE Dedicated PayProbe Codex project and six persistent phase chats.
- ACTIVE Parallel ownership, shared state and remote branch integration.

## P1 — Foundation [DONE; UI integration ACTIVE]
- DONE P1.1 Node/TypeScript/package/lockfile setup.
- DONE P1.2 Private .env.local preserved; public blank template and validated configuration.
- DONE P1.3 DeepSeek key available and model normalized to deepseek-flash (V4.1-Flash-1017 alias).
- DONE P1.4 SQLite order/operation/entitlement and run/evidence storage implemented.
- DONE P1.5 Fastify and Commander headless foundations.
- DONE P1.6 Simulated create/approve/get/capture and protected sample download.
- DONE P1.7 Lost-response transport hook and target reconciliation foundation.
- DONE P1.8 Bounded DeepSeek JSON adapter; one real probe passed (81 total tokens).
- DONE P1.9 Worker-reported typecheck/build and three focused foundation checks.
- DONE P1.10 Foundation remote commits/green CI; PR #8 merged at 871b613.
- DONE P1.11 Seeded premature/duplicate target hooks for P2.
- DONE P1.12 Preapproval-capture bug #10 fixed; P5 2/2 recovery regressions pass and are merged.
- DONE P1.13 CLI integration and handover published/merged via PR #18; review binding precedes execution.
- ACTIVE P1.14 Connect approved TUI/browser exports; add UI/process tests to CI and package scripts.

## P2 — Scenario engine [DONE at simulated scope]
- DONE P2.1 Shared RunnerPlan contract and HTTP adapter implemented locally.
- DONE P2.2 Persisted run lifecycle/resume and interrupted-capture no-recapture check.
- DONE P2.3 S1 approval without fulfillment implemented and focused check passed.
- DONE P2.4 S2 matching completed capture implemented and focused check passed.
- DONE P2.5 S3 repeated processing implemented and focused check passed.
- DONE P2.6 S4 lost-response reconciliation implemented and focused check passed.
- DONE P2.7 Five verdict categories implemented; focused distinctions checked.
- DONE P2.8 Seeded premature/duplicate faults detected from observations.
- DONE P2.9 Five focused checks, publication/handover; PR #16 merged e1d78c4 after CI success.

## P3 — DeepSeek and commands [DONE at current scope]
- DONE P3.1 Strict planner schema and semantic validation.
- DONE P3.2 Shared RunnerPlan mapping and reviewed plan persistence.
- DONE P3.3 Bounded planner using P1 DeepSeek client implemented.
- DONE P3.4 Evidence-grounded explainer/reference validation implemented.
- DONE P3.5 Text/JSON report projections.
- DONE P3.6 plan/run/resume/report/explain command registration exports.
- DONE P3.7 Actual CLI wiring/CI merged via PR #18 at 5a9f8fa; review source binds before execution.
- DONE P3.8 Real planner first-attempt PASS (419 tokens); reviewed CLI simulator run all four PASS with 42 evidence events. Explainer truncation fixed in PR #22, live first-attempt PASS (9,138 input/366 output tokens), all four cases and valid citations, all 42 evidence supplied. Issue #21 closed after verification. Focused schema/citation regressions pass.

## P4 — UI and judge access [ACTIVE, layout approved]
- DONE P4.1 FollowThrough reference inspection and design specification.
- DONE P4.2 Actual wide/compact rendered proposal layouts exist; final package inspection underway.
- DONE P4.3 Doctor, plan, simulated approval, running/uncertain/reconcile previews exist.
- DONE P4.4 Results/evidence/verdict/empty/filter/error previews exist.
- DONE P4.5 Browser mockups rendered; copy refinements applied. Complete review-v1 gallery ready.
- DONE P4.6 User approved all layout/interactions/states with requested palette change. Main selected graphite/amber/ivory/plum, v1.1.
- DONE P4.7 Warm v1.1 previews/spec and TUI module implemented; focused grid/navigation/restoration checks pass. CLI binding pending.
- DONE P4.8 Browser session/plan/review/approval/report modules implemented; actual runner test PASS PASS FAIL PASS for seeded duplicate fixture. Source, tests and warm palette artifacts merged in PR #13 at b6b5d80. Production bindings pending.
- TODO P4.9 Local packaging, hosting configuration/persistent storage and access.
- ACTIVE P4.10 P1 connecting approved UI to production CLI/server; P4 visual check and P5 integration checks follow. Module handover/publication complete.

## P5 — Stabilization [ACTIVE preparation; final pass dependency-gated]
- ACTIVE P5.1 Small acceptance matrix for existing interfaces.
- ACTIVE P5.2 Reproduce central-path defects and track issues.
- DONE P5.3 Targeted recovery regressions 2/2 pass after fix; PR #12 merged. Issue #10 closed.
- DONE P5.4 Actual process-stop/restart/redaction test passes, PR #19 merged at 21884b9; AI explanation truncation fixed and real verification passed.
- TODO P5.5 Verify amount/currency, repeated delivery, missing evidence and resume.
- DONE P5.6 Process test confirms text/JSON redaction and missing-review refusal; safe categorical model error diagnostics merged in PR #20.
- WAIT P5.7 UI fidelity/usability checks after approved UI exists.
- WAIT P5.8 Clean-install and hosted access rehearsal when packaged.
- TODO P5.9 Close resolved bugs, document limitations, publish PR/handover.

## P6 — Delivery [ACTIVE preparation]
- DONE P6.1 Simulation-only narrative/attribution draft; actual release claims remain gated.
- DONE P6.2 Setup/release instructions and README proposal prepared.
- DONE P6.3 Under-three-minute script/storyboard prepared; no recording yet.
- DONE P6.4 Submission draft, release checklist and hosting proposal; docs PR #14 merged.
- WAIT P6.5 Record actual completed app after approved UI exists.
- TODO P6.6 Verify public repo/video/demo links and access.
- WAIT P6.7 Reassess real integration/eligibility before claiming submission readiness.
- TODO P6.8 Final release and actual submission verification when ready.
- ACTIVE P6.9 Preparation and command-alignment docs/handover merged via PRs #14 and #23; final release materials pending actual UI verification/recording.

## Deferred real-provider stage
- DEFERRED D1 PayPal developer account access and private sandbox credentials.
- DEFERRED D2 Real PayPal adapter integration and genuine buyer approval.
- DEFERRED D3 Actual sandbox validation of all four scenarios.
- DEFERRED D4 Update claims and submission readiness using actual evidence.

## Ownership and threads




P5: tests/stabilization/*, docs/stabilization/*.
P6: docs/release/*, docs/demo/*.
Each worker owns docs/handoffs/Pn.md.
Main: TASK-BOARD.md, PROJECT-STATE.md, AGENTS.md, plan, root README, integration and merge decisions.
No cross-owner file edits without coordination. All source writes are local working files with remote-only Git commits; no worktrees.

| Phase | Persistent chat | Issue |
|---|---|---|
| P1 | [local worker reference] | #2 |
| P2 | [local worker reference] | #3 |
| P3 | [local worker reference] | #4 |
| P4 | [local worker reference] | #5 |
| P5 | [local worker reference] | #6 |
| P6 | [local worker reference] | #7 |

