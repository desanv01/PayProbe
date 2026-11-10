# PayProbe task board
Updated: 2026-11-10 — video authoring resumed by user; final render requires full-preview approval.
Legend: DONE = implemented/observed at stated scope; ACTIVE = underway; TODO = not yet completed; WAIT = external/approval/dependency; DEFERRED = intentionally later.
Payment scope: explicit simulator only. Real DeepSeek probe passed. No real PayPal behavior is verified.
Main owns this board; workers update docs/handoffs/Pn.md and send meaningful progress.

## P0 — Repository baseline [DONE]
- DONE Public repository desanv01/PayProbe and MIT license.
- DONE Agreed plan, rules, ignore policy and baseline PR #1 merged.
- DONE Phase tracking issues #2–#7 and deferred PayPal issue #9.
- DONE Dedicated PayProbe Codex project and six persistent phase chats.
- DONE Parallel ownership, shared state and remote phase integration for current non-video scope.

## P1 — Foundation [DONE]
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
- DONE P1.14 Approved TUI/browser connected via PR #24; actual production session flow and CLI ledger passed. UI/process tests in CI. Final wildcard inclusion of all five stabilization checks merged via PR #28 with green CI.

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

## P4 — UI [DONE at local scope; hosted access remains external]
- DONE P4.1 FollowThrough reference inspection and design specification.
- DONE P4.2 Wide/compact rendered proposal layouts inspected and approved.
- DONE P4.3 Doctor, plan, simulated approval, running/uncertain/reconcile previews exist.
- DONE P4.4 Results/evidence/verdict/empty/filter/error previews exist.
- DONE P4.5 Browser mockups rendered; copy refinements applied. Complete review-v1 gallery ready.
- DONE P4.6 User approved all layout/interactions/states with requested palette change. Main selected graphite/amber/ivory/plum, v1.1.
- DONE P4.7 Warm v1.1 previews/spec and TUI module implemented; focused grid/navigation/restoration checks pass. CLI binding merged and verified.
- DONE P4.8 Browser session/plan/review/approval/report modules implemented; actual runner test PASS PASS FAIL PASS for seeded duplicate fixture. Source, tests and warm palette artifacts merged in PR #13 at b6b5d80. Production bindings merged and verified.
- DONE P4.9 Local package and container configuration verified. Public hosting/access remains a separate external stage.
- DONE P4.10 Runtime wiring merged #24; native terminal verified and warning fix merged #26. Actual browser wide/mobile, full fixture workflow, filtering, evidence and text/JSON downloads verified. Final verification documentation merged via PR #30.

## P5 — Stabilization [DONE at local simulated scope; P4 visuals separate]
- DONE P5.1 Focused acceptance matrix with actual evidence and limitations.
- DONE P5.2 Observed blocking defects tracked, fixed and verified (#10, #21, #25).
- DONE P5.3 Targeted recovery regressions 2/2 pass after fix; PR #12 merged. Issue #10 closed.
- DONE P5.4 Actual process-stop/restart/redaction test passes, PR #19 merged at 21884b9; AI explanation truncation fixed and real verification passed.
- DONE P5.5 Wrong amount/currency refuses PASS; repeated delivery, missing evidence and resume checks passed.
- DONE P5.6 Process test confirms text/JSON redaction and missing-review refusal; safe categorical model error diagnostics merged in PR #20.
- DONE P5.7 Production browser access/session/origin/missing-key boundaries checked; actual visual/native terminal inspection belongs to P4.
- DONE P5.8 Clean install from exact remote UI source, npm ci/build/compiled doctor/server/demo passed. Hosted access remains unverified and separately pending.
- DONE P5.9 Final tests/matrix/handover merged via PR #27 at f09860f. No outstanding known blocking defect in tested local paths.

## P6 — Delivery [NON-VIDEO LOCAL SCOPE DONE; video authoring active; final render approval pending]
- DONE P6.1 Simulation-only narrative/attribution draft; actual release claims remain gated.
- DONE P6.2 Setup/release instructions and README proposal prepared.
- DONE P6.3 Initial historical storyboard prepared. Future video must use HyperFrames/MajuPilot reference after a new discussion; all related work held.
- DONE P6.4 Submission draft, release checklist and hosting proposal; docs PR #14 merged.
- DONE P6.5 Complete 170-second MajuPilot-style narrated HyperFrames preview built. Genuine native console recordings include actual DeepSeek request/full six-second wait/returned response, execution, observed FAIL, corrected case and S4 evidence. Checks and normal-speed 170/170 playback pass. Studio: http://localhost:4390/#project/payprobe-demo. Source/assets: draft PR #35. User reviewed the preview and approved it; final HyperFrames rendering and artifact verification ACTIVE.
- DONE P6.6 Public repository and prerelease tag/assets verified, including anonymous ZIP download and checksum. Video/public live-demo links remain future work.
- WAIT P6.7 Reassess real integration/eligibility before claiming submission readiness.
- DONE P6.8 Simulated GitHub prerelease v0.1.0-simulated published; hackathon submission remains a separate uncompleted stage.
- DONE P6.9 Delivery docs/templates/packager merged via PR #31; final 52-file ZIP matches frozen source 32e036d3cae80a915625319140ffdfc01b736e6d. Independent artifact verification passed; Docker build/health/restart persistence passed.

Release: https://github.com/desanv01/PayProbe/releases/tag/v0.1.0-simulated
Archive SHA256: 9858c0759b8754272bda7956db96d7d6d88e51869cc5bcb9c487e11127ee84f3

## Deferred real-provider stage
- DEFERRED D1 PayPal developer account access and private sandbox credentials.
- DEFERRED D2 Real PayPal adapter integration and genuine buyer approval.
- DEFERRED D3 Actual sandbox validation of all four scenarios.
- DEFERRED D4 Update claims and submission readiness using actual evidence.

## Ownership and threads
P1: existing providers/*, sample-store/*, storage/*, core/config.ts, core/schemas.ts, api/server.ts, cli/index.ts, package/lockfile/tsconfig/env/initial CI.
P2: new src/runner/*, src/scenarios/*, src/adapters/*.
P3: new src/ai/*, src/reporting/*, src/cli/commands/*.
P4: docs/design/* plus new src/ui/* and src/web/* after user approval; P1 owns shared CLI/API/package integration.
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

