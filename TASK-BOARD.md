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

## P1 — Foundation [ACTIVE]
- DONE P1.1 Node/TypeScript/package/lockfile setup.
- DONE P1.2 Private .env.local preserved; public blank template and validated configuration.
- DONE P1.3 DeepSeek key available and model normalized to deepseek-flash (V4.1-Flash-1017 alias).
- DONE P1.4 SQLite order/operation/entitlement and run/evidence storage implemented.
- DONE P1.5 Fastify and Commander headless foundations.
- DONE P1.6 Simulated create/approve/get/capture and protected sample download.
- DONE P1.7 Lost-response transport hook and target reconciliation foundation.
- DONE P1.8 Bounded DeepSeek JSON adapter; one real probe passed (81 total tokens).
- DONE P1.9 Worker-reported typecheck/build and three focused foundation checks.
- ACTIVE P1.10 Remote granular commits, PR #8 and CI result verification.
- ACTIVE P1.11 Seeded premature/duplicate target hooks for P2.
- ACTIVE P1.12 Fix reproduced preapproval capture becoming stuck uncertain; P5 regression.
- TODO P1.13 Final handover/integration merge.

## P2 — Scenario engine [ACTIVE]
- ACTIVE P2.1 Shared RunnerPlan contract and HTTP adapter.
- ACTIVE P2.2 Persisted run lifecycle, evidence sequence and resume.
- TODO P2.3 S1 approval without fulfillment.
- TODO P2.4 S2 matching completed capture with one fulfillment.
- TODO P2.5 S3 repeated processing without duplicate entitlement.
- TODO P2.6 S4 lost-response target reconciliation.
- TODO P2.7 PASS/FAIL/INCONCLUSIVE/UNSUPPORTED/ERROR semantics.
- TODO P2.8 Seeded fault detection using observations, not fixture flags.
- TODO P2.9 Minimal connected checks, remote commits/PR and handover.

## P3 — DeepSeek and commands [ACTIVE]
- ACTIVE P3.1 Strict planner schema and semantic validation.
- ACTIVE P3.2 Shared P2 RunnerPlan mapping and reviewed plan persistence.
- TODO P3.3 Bounded planner using P1 DeepSeek client.
- TODO P3.4 Evidence-grounded explainer and reference validation.
- TODO P3.5 Text/JSON report projections.
- TODO P3.6 plan/run/resume/report/explain command registration.
- TODO P3.7 Wiring into P1 entrypoint through owner coordination.
- TODO P3.8 Complete headless journey, targeted checks, remote commits/PR/handover.

## P4 — UI and judge access [ACTIVE, approval gate]
- ACTIVE P4.1 FollowThrough reference inspection and design specification.
- ACTIVE P4.2 Actual wide/compact terminal mockups.
- TODO P4.3 Doctor, plan review, simulated approval, running/uncertain/reconcile states.
- TODO P4.4 Results, evidence, five verdict types, empty/filter/error states.
- TODO P4.5 Small responsive browser/judge mockups.
- WAIT P4.6 Present complete package here and receive explicit user approval.
- WAIT P4.7 Implement approved terminal components/navigation.
- WAIT P4.8 Implement approved browser interface and backend connections.
- TODO P4.9 Local packaging, hosting configuration/persistent storage and access.
- TODO P4.10 Approved UI connected to engine, remote commits/PR/handover.

## P5 — Stabilization [ACTIVE preparation; final pass dependency-gated]
- ACTIVE P5.1 Small acceptance matrix for existing interfaces.
- ACTIVE P5.2 Reproduce central-path defects and track issues.
- ACTIVE P5.3 Targeted regression for preapproval capture and lost-response recovery.
- TODO P5.4 Verify startup and full central journey after connections.
- TODO P5.5 Verify amount/currency, repeated delivery, missing evidence and resume.
- TODO P5.6 Validate model error handling and report redaction without redundant paid calls.
- WAIT P5.7 UI fidelity/usability checks after approved UI exists.
- WAIT P5.8 Clean-install and hosted access rehearsal when packaged.
- TODO P5.9 Close resolved bugs, document limitations, publish PR/handover.

## P6 — Delivery [ACTIVE preparation]
- ACTIVE P6.1 Accurate simulation-only narrative and source attribution.
- ACTIVE P6.2 Setup/release instructions and README proposal.
- ACTIVE P6.3 Under-three-minute script/storyboard.
- ACTIVE P6.4 Submission draft, release checklist and hosting proposal.
- WAIT P6.5 Record actual completed app after approved UI exists.
- TODO P6.6 Verify public repo/video/demo links and access.
- WAIT P6.7 Reassess real integration/eligibility before claiming submission readiness.
- TODO P6.8 Final release and actual submission verification when ready.
- TODO P6.9 Remote commits/PR/handover.

## Deferred real-provider stage
- DEFERRED D1 PayPal developer account access and private sandbox credentials.
- DEFERRED D2 Real PayPal adapter integration and genuine buyer approval.
- DEFERRED D3 Actual sandbox validation of all four scenarios.
- DEFERRED D4 Update claims and submission readiness using actual evidence.

## Ownership and threads
P1: existing providers/*, sample-store/*, storage/*, core/config.ts, core/schemas.ts, api/server.ts, cli/index.ts, package/lockfile/tsconfig/env/initial CI.
P2: new src/runner/*, src/scenarios/*, src/adapters/*.
P3: new src/ai/*, src/reporting/*, src/cli/commands/*.
P4: docs/design/* only until approval; production UI allocation follows approval.
P5: tests/stabilization/*, docs/stabilization/*.
P6: docs/release/*, docs/demo/*.
Each worker owns docs/handoffs/Pn.md.
Main: TASK-BOARD.md, PROJECT-STATE.md, AGENTS.md, plan, root README, integration and merge decisions.
No cross-owner file edits without coordination. All source writes are local working files with remote-only Git commits; no worktrees.

| Phase | Persistent chat | Issue |
|---|---|---|
| P1 | 01a1c372-f490-7330-8752-76918f34d8e5 | #2 |
| P2 | 01a1c37b-1af6-76d2-82bb-5af2e6c8bd43 | #3 |
| P3 | 01a1c37b-2f86-7922-879b-d88659774f05 | #4 |
| P4 | 01a1c37b-44f3-7c01-b36d-88be1d1bda3c | #5 |
| P5 | 01a1c37b-5911-78b2-9a8a-bc8d7940f696 | #6 |
| P6 | 01a1c37b-722c-78f2-ac7d-1f93aefbcb4c | #7 |

