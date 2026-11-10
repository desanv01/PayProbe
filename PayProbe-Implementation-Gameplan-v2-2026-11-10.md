# PayProbe — Updated Implementation Game Plan
Version: 2 — 10 November 2026
Canonical folder: <project-root>
Deadline: 13 November 2026, 04:00 Asia/Kuala_Lumpur
Internal submission target: 12 November 2026, 22:00
Status: Repository baseline complete; six phase workers are active in parallel. Current progress is in PROJECT-STATE.md and TASK-BOARD.md.

PARALLEL EXECUTION OVERRIDE — 10 November 2026: User explicitly requests all phases to progress concurrently. Use the six persistent Sol Medium phase chats with exclusive file ownership and active orchestrator coordination. Earlier sequential scheduling below is superseded. P5 prepares/checks available components in parallel; full connected-system stabilization still depends on connected implementation. P6 prepares delivery materials now; recording/submission readiness depends on real completed behavior. P4 mockups were approved by the user with a delegated palette change; production implementation is now authorized with graphite/amber/ivory/plum v1.1. Main maintains the full concise task board, updates progress in chat, owns shared docs and integrates phase branches. Worker-to-worker and worker/main status messages are authorized. No local Git commits/worktrees; granular remote source publication continues.

CURRENT SCOPE OVERRIDE — 10 November 2026: User defers PayPal developer-account integration and all PayPal network/API calls until current implementation phases and bug fixing are complete. Current P1-P6 work uses an explicit deterministic simulated payment provider by default, including simulated approval and provider observations. No PayPal credentials are required/requested. DeepSeek is the only current external API dependency; use documented deepseek-flash alias, currently DeepSeek-V4.1-Flash-1017, without claiming an immutable version pin. Current acceptance is connected simulated workflows plus an actual bounded DeepSeek response. Real sandbox purchase verification, hackathon eligibility and submission readiness are NOT established by simulation; add a separate deferred real-provider integration/validation stage after stabilization. Earlier live-provider requirements below describe that deferred stage and must not block current implementation. UI approval and source-publication gates remain unchanged.

Execution update, 10 November: GitHub access was verified with network-enabled execution and https://github.com/desanv01/PayProbe was created. Access blockers described later in this planning snapshot are now resolved. Restricted-shell network errors were misleading; do not ask the user to log in again without an unrestricted verification. The PayProbe folder is registered as its own Codex project. The headless workflow, real DeepSeek planner/explainer, and simulated scenario checks now pass. Approved UI integration is underway. Current details are in TASK-BOARD.md.

This version supersedes the Python/OpenAI-runtime plan. The product architecture and four scenarios remain agreed. Runtime AI is DeepSeek. Implementation is TypeScript. Final UI requires explicit user approval of concrete mockups. Git history is created remotely, without local Git commits or worktrees.

## 1. Agreed decisions

- Standalone PayPal integration diagnostic tool, not a MajuPilot extension.
- Node.js + TypeScript + Fastify + Commander + Zod + SQLite.
- Official DeepSeek API for runtime planning and explanations.
- The openai npm package may be used strictly as an API-compatible client pointed at DeepSeek; no OpenAI runtime account/key/fallback is required.
- Codex development remains GPT-6.1 Sol High for the orchestrator and Medium for one persistent worker chat per main phase, where controls support it.
- UI inspiration: desanv01/FollowThrough terminal ledger and evidence navigation.
- Before implementing branded CLI/TUI or browser UI, show actual mockups for all core states and wait for explicit user approval. Silence or time pressure is not approval.
- Implement and connect the complete workflow before extensive reviews, broad tests or polish.
- Fix blocking defects immediately; record nonblocking defects and continue.
- Publish coherent task/subtask changes and fixes to remote GitHub history promptly. Use remote phase branches, draft PRs, issue checklists and CI; no local Git commits or worktrees.
- Local source files and execution still live in the canonical project folder. A remote repository is not an execution environment or automatic deployment.
- Save this full plan in the project folder and copy it to Desktop.

## 2. Problem and product

Pitch: Your AI builder says payments work. PayProbe checks what actually happens.

A checkout may look successful while delivering a digital product before capture, creating repeated entitlements, or mishandling a successful payment whose response was lost.

PayProbe compares:
1. Developer-declared business requirements.
2. Independently retrieved PayPal sandbox state.
3. Observed application fulfillment behavior.

AI maps a developer description onto a bounded test plan and explains recorded findings. Deterministic code executes scenarios and assigns verdicts.

Initial users: individual developers and small teams integrating one-time digital purchases. Enterprise readiness is a later validation goal, not a hackathon claim.

Deliverables:
- CLI with text and JSON modes.
- FollowThrough-inspired interactive terminal ledger after mockup approval.
- Four payment lifecycle scenarios.
- One explicit HTTP adapter contract.
- Small digital-download sample store with disclosed seeded faults and corrected behavior.
- Evidence collection and resumable runs.
- DeepSeek planner and evidence-grounded explanation.
- Minimal hosted judge-access page after UI approval.
- Public repository, license, runnable instructions, short video and submission.

Excluded: general security certification, universal website discovery, arbitrary generated code execution, automatic fixes, refunds, subscriptions, multicurrency, multiple merchants, marketplace flows, arbitrary browser agents, model training, AP2, concurrency guarantees, verified webhook delivery/signatures, broad fuzzing, desktop packaging and elaborate dashboards.

## 3. Alternatives and differentiation

Postman and Bruno already support programmable API tests. pytest and Playwright can implement these workflows. Schemathesis supports schema-driven property testing and stateful workflows. Pact checks interaction contracts. PayPal toolkit/example repositories already offer useful payment operations and testing patterns.

PayProbe does not claim these capabilities are absent. Its proposed contribution is a compact PayPal-specific requirement-to-scenario workflow that connects provider state to application delivery and produces inspectable evidence.

Novelty claim:
A focused PayPal integration diagnostic experience using AI for constrained planning/explanation and deterministic payment/fulfillment checks.

Not a novelty claim:
Inventing idempotency, payment testing, fault injection, test generation, or evidence logs.

FollowThrough is design inspiration. Any actual borrowed source/assets must be identified and retain appropriate attribution/license terms. New PayProbe contribution must be distinguishable from previous hackathon work.

Sources:
- https://learning.postman.com/docs/postman-cli/postman-cli-overview/
- https://docs.usebruno.com/bru-cli/overview
- https://playwright.dev/docs/api-testing
- https://schemathesis.readthedocs.io/en/stable/
- https://docs.pact.io/
- https://github.com/paypal/agent-toolkit

## 4. User journey

1. Configure local backend credentials and the explicit application adapter.
2. Describe the intended purchase behavior.
3. DeepSeek selects supported scenarios and returns a structured plan.
4. Validate with Zod and semantic checks; show the plan for review.
5. Start the reviewed run.
6. Create sandbox orders and provide actual PayPal approval links.
7. The sandbox buyer approves in PayPal.
8. The runner executes the specified application operations and independent provider observations.
9. Deterministic assertions produce findings.
10. Save evidence and optionally ask DeepSeek for an explanation.
11. Resume interrupted runs from persisted operation/order IDs.
12. Inspect the same records in text, JSON, TUI or browser views.

Illustrative commands; these do not exist yet:

    payprobe doctor
    payprobe plan examples/download-contract.json
    payprobe run plans/download-plan.json --mode sandbox
    payprobe resume RUN_ID
    payprobe report RUN_ID --format text
    payprobe report RUN_ID --format json
    payprobe report RUN_ID --format tui
    payprobe explain RUN_ID

A saved reviewed plan runs without making a new planner request. AI failure must not overwrite deterministic verdicts. The submission still needs a functioning live DeepSeek path, not only a prerecorded explanation.

## 5. Exact payment scenarios

### S1 — Approval is not completed payment

- Create a CAPTURE-intent order A.
- Buyer approves in the real sandbox.
- Pause before server-side capture.
- Independently GET PayPal order state.
- Exercise the application's buyer-return handler.
- Observe entitlement count and protected download access.

Expected: no completed matching capture means no unlocked purchase.

Seeded failure: the sample grants access merely on return/approval.
Corrected behavior: gate fulfillment on verified completed matching capture.

The return handler must not automatically capture before the S1 observation, or the precondition has not been established. A missing precondition is not PASS.

### S2 — Completed capture produces one fulfillment

- Capture order A through the target application.
- Independently query provider state.
- Verify a COMPLETED capture matching order, expected USD amount, currency and relevant identity.
- Observe the protected download and entitlement count within a declared bounded interval.

Expected: one entitlement and accessible purchase.

An application HTTP 200 or success banner is not proof. If provider completion is established but fulfillment fails beyond the specified interval, FAIL. If essential provider evidence is unavailable, INCONCLUSIVE.

### S3 — Repeated processing does not multiply fulfillment

- After successful capture, invoke completion processing/reconciliation three times for the same order.
- Inspect entitlement count after each invocation.
- Check recorded provider captures.

Expected: one purchase still yields one entitlement.

Seeded failure: a new delivery record is inserted each time completion is processed.
Corrected behavior: idempotent fulfillment keyed to the purchase.

Scope: sequential repeated processing. Not proof of every race, exactly-once distributed execution, double-charge prevention under all conditions, or webhook signature/delivery correctness.

### S4 — Recover a completed capture whose response is lost

- Create and approve separate order B.
- Arm a one-time fault at the sample target's PayPal transport boundary.
- Allow a real capture request to complete at PayPal.
- Suppress the successful response before the target's business logic receives it.
- Surface timeout/uncertainty to that business logic.
- Observe the uncertain application state.
- Invoke the target's reconciliation path.
- Independently observe PayPal and final entitlement state.

Expected: acknowledge uncertainty, query existing payment state, recover the completed capture, deliver exactly one entitlement for this controlled case.

The runner must not repair the target behind the scenes. If the fault never fired or payment did not complete, do not claim this scenario passed.

Typical full variant run uses two approved orders, with order A shared by S1–S3 and order B for S4. Additional faulty/corrected demonstrations may require additional approvals. Do not promise a zero-click live payment run.

## 6. Verdict and evidence model

Verdicts:
- PASS: established preconditions and sufficient evidence satisfy the assertion.
- FAIL: sufficient evidence establishes a violation.
- INCONCLUSIVE: required evidence or scenario condition cannot be established.
- UNSUPPORTED: adapter lacks a capability.
- ERROR: execution/configuration failure prevented the scenario.

Run lifecycle is separate: created, planned, awaiting_approval, running, paused, finished, error.

Evidence contains:
- Run and scenario IDs.
- Sequence, UTC timestamps and observation source.
- Provider/application/fault/runner distinctions.
- Order/capture/request IDs where appropriate.
- Sanitized observed fields.
- Source version/plan hash and adapter version.
- Live sandbox versus replay/synthetic provenance.
- Boundaries and missing observations.

Do not log secrets, access tokens, buyer passwords or unnecessary PII. Do not publish raw environment files, raw private prompts or provider reasoning. Retain useful final structured output and sanitized usage metadata.

Reports are diagnostic records, not tamper-proof compliance attestations. Unknown is not zero and missing evidence is not a pass.

## 7. Architecture

CLI commands / approved TUI / approved judge page
    -> reviewed plan
    -> deterministic runner
    -> versioned HTTP adapter
    -> target application
    -> PayPal sandbox

Runner
    -> separate provider observer
    -> deterministic assertions
    -> SQLite evidence/run store
    -> text/JSON report
    -> DeepSeek explanation

One backend process can host the engine and sample store initially, but keep modules/routes/data responsibilities separate.

Adapter capabilities:
- capabilities
- create_order
- handle_buyer_return
- capture
- observe_application
- check_download
- process_again
- reconcile
- arm_fault

The evaluator must not import target decision logic, read buggy-mode flags to generate verdicts, or trust a target /pass endpoint.

External adapters require integration work. Missing hooks are UNSUPPORTED. The hosted demo exposes only fixed sample targets, not arbitrary user URLs.

Sample test hooks are protected and only enabled in the test/sandbox context.

## 8. PayPal integration

Use sandbox only:
- Obtain OAuth access token.
- Create order.
- Retrieve order.
- Capture order.
- Optionally retrieve capture details if needed.

Use actual returned buyer approval links. Redirect completion is not payment proof.

Persist operation identifiers before mutations. Reuse the same idempotency identifier only for the same supported operation and request body; separate create/capture operation identities. After uncertainty, reconcile existing state first. Check endpoint-specific idempotency support/retention rather than inventing a universal guarantee.

Scope: USD integer cents internally, explicit API decimal serialization, one merchant, one purchase unit, one full capture.

Credentials remain in backend configuration; the browser and exported report never receive merchant secrets.

Sources:
- https://developer.paypal.com/api/orders/v2/orders-create
- https://developer.paypal.com/api/orders/v2/orders-get
- https://developer.paypal.com/api/orders/v2/orders-capture
- https://developer.paypal.com/api/rest/reference/idempotency/

## 9. DeepSeek runtime

Provider: official DeepSeek API.
Base URL: https://api.deepseek.com
Default configured model: deepseek-flash.
Optional explicit alternative: deepseek-v4-pro if an observed planning-quality weakness warrants it.
Do not silently switch providers or make an expensive fallback call.

Verified 10 November 2026: DeepSeek's official documentation currently lists deepseek-flash and deepseek-v4-pro and demonstrates the openai JavaScript client. Model aliases can change backing implementations; record requested and returned identifiers without claiming an immutable snapshot.

Using the openai package does NOT require sending requests to OpenAI:
- Supply DeepSeek baseURL explicitly.
- Supply DEEPSEEK_API_KEY explicitly.
- Require valid provider configuration.
- No fallback to the SDK's default OpenAI endpoint.
- No OPENAI_API_KEY needed.
- No dependency on a DeepSeek desktop harness or local model server.

Use Chat Completions JSON output for the initial adapter, with JSON requested explicitly and a concrete schema example. Parse final content and validate with Zod, then enforce scenario/endpoint/evidence constraints.

DeepSeek documents that JSON output can be blank/whitespace. Detect blank, truncation, invalid JSON and schema errors. Bound retries/repair to one additional attempt with time/token limits. Avoid SDK retries plus application retries multiplying silently.

Explicitly configure thinking behavior rather than inheriting a provider default. Initial recommendation: non-thinking mode for the short bounded JSON task; enable low-effort thinking only if the narrow task evaluation demonstrates need. Use only supported wire parameters and verify behavior on the account.

AI roles:
1. Planner: requirement/capability -> supported scenario selection and rationale.
2. Explainer: sanitized findings/evidence -> explanation and hypotheses with valid evidence references.

AI does not:
- Invent APIs.
- Generate and execute arbitrary code.
- Decide payment truth or verdicts.
- Receive PayPal credentials.
- Execute autonomous money operations.
- Claim a specific source-code line is broken without inspecting source.

Normally two bounded calls per new run: planning and explanation. Store token usage if returned; do not label estimates as billed cost.

Official sources:
- https://api-docs.deepseek.com/
- https://api-docs.deepseek.com/guides/json_mode/
- https://api-docs.deepseek.com/guides/thinking_mode/

## 10. Environment file and required access

During Phase 1 create an ignored .env.local in the project root if it does not exist. Never overwrite a populated file. Commit only .env.example with blanks.

Planned .env.local template:

    DEEPSEEK_API_KEY=
    DEEPSEEK_BASE_URL=https://api.deepseek.com
    DEEPSEEK_MODEL=deepseek-flash
    DEEPSEEK_THINKING=disabled

    PAYPAL_ENV=sandbox
    PAYPAL_CLIENT_ID=
    PAYPAL_CLIENT_SECRET=

    PAYPROBE_HOST=127.0.0.1
    PAYPROBE_PORT=4310
    PAYPROBE_PUBLIC_URL=http://127.0.0.1:4310
    PAYPROBE_DB_PATH=.payprobe/payprobe.sqlite
    PAYPROBE_TEST_TOKEN=

DEEPSEEK_THINKING is our application configuration mapped to the provider's supported request field, not a claim the SDK auto-loads it.

Load .env.local explicitly with dotenv and do not override already supplied deployment environment variables. Plain Node/Fastify does not automatically load this filename.

Needed:
- DeepSeek API key and usable provider balance/access.
- PayPal sandbox REST app client ID and secret.
- Sandbox merchant and buyer accounts; buyer credentials entered in PayPal itself.
- GitHub authorization for repository creation and contents/PR/issues/workflows.
- Hosting access during packaging.

Not needed:
- OpenAI runtime API key.
- Real payment card or production PayPal credentials for the demo.
- Local GPU or downloaded model.
- DeepSeek Harness.
- A new agent framework.

The backend generates the local test token. Do not ask the user to invent one or paste keys into chat.

GitHub credentials belong in the authenticated connector/CLI/credential store, not the public app config. Deployment secrets are configured in the host's environment, not by uploading .env.local.

## 11. Selected TypeScript stack

- Node.js 24 LTS baseline; local inspection found v24.14.1 and npm 11.19.0. Pin a compatible tested patch in implementation. Node 26 is also LTS, but upgrading solely for novelty is unnecessary.
- TypeScript with strict types.
- npm and package-lock.json for reproducibility.
- Fastify for backend routes.
- Commander for command parsing.
- Zod for config, AI output, adapters and reports.
- SQLite through better-sqlite3, subject to an early Windows/Linux install check.
- Native fetch for PayPal requests with explicit timeout/retry handling.
- openai npm package configured exclusively for DeepSeek.
- dotenv for .env.local.
- tsx for development and tsc for build.
- Node test runner for focused tests; use a small conventional runner only if necessary.
- Ink/React for the approved interactive terminal layout, keeping logic in the engine.
- Minimal semantic HTML/CSS/JS for the approved judge page.
- No Next.js, Electron, desktop app, ORM, Redis, vector DB or multi-agent runtime.

Genuine alternatives:
- Native fetch to DeepSeek: fewer SDK dependencies and transparent wire format; better if SDK compatibility causes trouble.
- Native node:sqlite: avoids external native addon; only select after checking API stability and support on the pinned Node release.
- PostgreSQL: better for multiple replicas/concurrent hosted users, not needed for the single-process initial demo.
- Direct ANSI renderer: closer control and fewer UI dependencies, but manual input/resize/cleanup work can cost time.
- Ink: better for reusable declarative terminal components; slightly more dependencies. Recommended here.
- Fastify versus Express: use Express only if familiarity materially accelerates delivery; no need to redesign around both.
- Commander versus oclif: Commander fits the small command set; oclif becomes attractive for a larger plugin CLI.
- Vitest: useful richer TS test ergonomics; not required before the core product exists.

Do not switch stacks mid-build without a concrete blocker.

## 12. FollowThrough reference and approval gate

Inspected sources:
- https://github.com/desanv01/FollowThrough
- https://github.com/desanv01/FollowThrough/blob/main/docs/project/RUN-LEDGER.md
- https://github.com/desanv01/FollowThrough/blob/main/reporting/run_ledger.py
- https://github.com/desanv01/FollowThrough/blob/main/docs/project/VIEWER.md

Observed design:
- Black terminal background.
- Explicit cyan borders/header accents.
- Dark teal selected row.
- Boxed ledger and selected-item detail panel.
- Separate evidence view.
- j/k and arrows to move; Enter for evidence; / filter; Esc back; q quit.
- Text/JSON alternatives.
- Distinct compact and wide geometry.
- Honest unknown/provenance labels.

Reference palette from source:
background #000000
text #EBF1F2
accent #00E7EB
header #00DEE1
selection #00656F
selected text #F5FFFF

These are reference values, not an approved PayProbe design.

PayProbe adapts the rows to scenarios, payment observations, fulfillment observations, verdict and evidence. Do not copy FollowThrough's software-repair evaluation terminology or imply identical product semantics.

Before production UI implementation:
1. Read applicable UI-design skill instructions.
2. Prepare a full concrete mockup package in docs/design/ only.
3. Render wide terminal (e.g. 120x36) and compact terminal (80x24) examples.
4. Present actual mockup images/previews in this chat, not merely prose or ASCII.
5. Include keyboard flow and interactions.
6. Include browser page states and responsive behavior.
7. Label all preview values as synthetic design data.
8. Ask the user to approve or revise.
9. Record approval scope/version in docs/design/UI-SPEC.md.
10. Implement the approved layout, with no unapproved redesign.

Required core mockups:
- Setup/doctor readiness.
- Scenario plan and explicit review.
- Awaiting PayPal buyer approval.
- Running/uncertain/reconciling.
- Results ledger with PASS and FAIL.
- Evidence/detail view.
- INCONCLUSIVE, UNSUPPORTED, ERROR and missing-key conditions.
- Empty/no-match and compact terminal behavior.
- Small judge access page and result report.

Payment approval still happens on PayPal's real page; our UI represents waiting/return status.

Mockup approval covers geometry, palette, labels, controls and transitions. Font rasterization and host terminal metrics cannot be identical on every machine; verify against agreed representative sizes. Do not change the user's global terminal settings.

Plain command plumbing and machine-readable/diagnostic output may be implemented before the visual gate. Branded TUI, final styled CLI and browser UI must wait. Read-only report navigation must not trigger payment operations.

If approval is pending, continue independent backend, packaging, documentation and deployment configuration. Do not treat elapsed time as approval or substitute a different interface.

## 13. Repository layout

    PayProbe/
      src/
        cli/
          index.ts
          commands/
        api/
          server.ts
          routes/
        core/
          config.ts
          schemas.ts
          runner.ts
          assertions.ts
          evidence.ts
        providers/
          deepseek.ts
          paypal.ts
        adapters/
          http.ts
        scenarios/
          approval.ts
          capture.ts
          repeat.ts
          uncertain.ts
        storage/
          database.ts
        sample-store/
        reporting/
        ui/                 # only after design approval
      examples/
      tests/
      docs/
        design/
        demo/
      .github/workflows/
      .env.example
      .env.local            # ignored; generated later
      .gitignore
      package.json
      package-lock.json
      tsconfig.json
      PROJECT-STATE.md
      README.md

This is a responsibility map, not instructions to populate empty handlers and call the implementation complete.

SQLite records runs, cases, events, operations, sample orders and entitlements. Keep authoritative payment observations separate from AI descriptions.

## 14. Remote GitHub workflow

Intended public repository: desanv01/PayProbe.
Canonical local working files: <project-root>.
No local git init/commit or worktrees required.

GitHub still requires commits to represent repository versions. Create them remotely through the Contents/Git Database APIs:
- Read current branch head.
- Upload the explicit changed file set.
- Create a tree and commit.
- Advance the branch with an expected-head check.
- Verify the resulting remote SHA and file content.
- Record remote base/head in the shared state.

Never publish an entire workspace recursively. Explicitly exclude .env.local, credentials, node_modules, databases, private artifacts and raw payment data. .gitignore alone does not protect API-based uploads, so the upload file allowlist matters.

If branch head changed unexpectedly, inspect and reconcile before retrying. Do not overwrite remote work with a forced update.

Granularity:
- Each completed coherent task/subtask: remote commit.
- Each implemented fix: separate traceable remote commit.
- Each main phase: remote codex/pN-description branch and one draft PR.
- Each phase/subphase: issue/checklist tracking; each nontrivial defect gets an issue.
- At phase implementation completion: update PR and merge once required lightweight checks pass, documenting remaining nonblocking defects.
- Prefer merge commits to retain granular task commits. Do not silently squash the requested history.
- Close issues only when their acceptance is actually satisfied; keep deferred defects open.
- Reuse phase worker/PR for repair while open; after merge use a new remote repair branch/PR with the same worker.
- One PR per keystroke or failed command is unnecessary; all meaningful work remains traceable through commits, checklists, issues and relevant logs.

GitHub Actions:
- Bootstrap docs-only checks initially.
- During build: dependency install, typecheck, compile and small relevant checks once those scripts exist.
- Avoid paid DeepSeek calls and live PayPal operations on every push.
- Cancel superseded branch CI runs.
- Broad integration/regression validation belongs to stabilization.
- Do not disable failing checks just to show green; fix blocking compile/build errors.
- Known nonblocking functional defects may remain open through implementation phases and are addressed in stabilization.

CD:
- Add deployment to the selected backend host during packaging.
- Ordinary branch pushes are not automatically production releases.
- Keep all PayPal operations sandbox.
- Static GitHub Pages alone cannot host the Fastify payment backend or secret-bearing AI calls.
- Configure deployment secrets through the host, with least required access.
- Tie final release and demo evidence to a real remote commit.

This is remote source control, not an obligation to execute code only inside GitHub.

Current access finding:
- GitHub connector successfully read FollowThrough.
- No create-repository capability is exposed by the connector.
- gh auth status reports the desanv01 login invalid.
- Browser connection attempt timed out.
- Repository creation has NOT been completed.
- User has been asked to restore gh authentication or create/link the empty repository. Do not claim the repository exists until verified.

Sources:
- https://docs.github.com/en/rest/git/commits
- https://docs.github.com/en/rest/git/trees

## 15. Codex worker arrangement

This chat is the main planner/orchestrator, requested GPT-6.1 Sol High.
Use one persistent GPT-6.1 Sol Medium worker chat per main phase where controls support it.
Phase 0 repository setup remains orchestrator-owned.
Phase 4's worker handles both mockup preparation and, only after approval, UI implementation.

No new chat per subtask. No standing audit/review/test fleet. No substitute subagents or cross-desktop model harnesses. Reuse original phase workers for fixes.

Use the current PayProbe project/folder, not the former General QnA/PayProbe directory. Recheck registered project mapping before worker creation and report genuine tool limitations rather than inventing applied settings.

All work stays in the canonical folder. Avoid conflicting edits; serialize publication and worker handoffs. Orchestrator owns cross-phase decisions and remote publication status.

PROJECT-STATE.md tracks:
scope, phase/thread mapping, current remote SHA/PR, implemented behavior, remaining work, decisions, bugs, blockers, UI approval status and run commands.

Handovers:
what changed; connections; actual checks; known problems; next needs.

## 16. Implementation-first rule

Complete P1–P4 behavior and integration before P5 broad stabilization.
During implementation:
- Check only what is needed to continue.
- Fix compile/startup/API blockers now.
- Record nonblocking defects and continue.
- Avoid repeated comprehensive suites and audits.
- Avoid speculative hardening and unrelated refactors.
- No tests that only mirror implementation.
- No large testing framework before the product.

The scenario engine is the product. Implementing it is not a premature testing campaign.

Implementation complete means real connected behavior, not stubs, hardcoded success or disconnected screens.

A real external blocker must remain explicit. Clearly mark any temporary simulation. Missing credentials cannot justify pretending a live API path was verified.

Preserve sandbox, credentials, actual buyer approval and payment-state boundaries throughout.

## 17. Phase plan and completion gates

### P0 — Repository and plan baseline (orchestrator; 1h target excluding access wait)

0.1 Restore/verify repository creation access.
0.2 Check name/ownership, create public desanv01/PayProbe without overwriting an existing repository.
0.3 Publish plan, README scope, .gitignore and appropriate license/bootstrap documentation.
0.4 Open phase tracking issues/checklists and establish remote publication conventions.
0.5 Record initial remote commit and access status.

No application implementation worker before repository setup is concretely available as requested. Planning and blocker resolution can proceed.

### P1 — TypeScript foundation and real provider path (5h)

1.1 Package setup, lockfile, TS config, scripts and configuration schema.
1.2 Create ignored .env.local and public .env.example, respecting existing files.
1.3 SQLite schema, operation IDs, adapter schema and Fastify/Commander plumbing.
1.4 DeepSeek credential check and one bounded real JSON request.
1.5 PayPal OAuth, order creation, buyer approval link, provider observation and capture.
1.6 Sample protected download, entitlement and persistence/resume foundation.
1.7 Publish coherent changes and hand over.

Completion: one actual sandbox purchase and one actual DeepSeek response work through the configured backend. Any absent credential is a specific external blocker, not claimed completion.
Checks: install/typecheck/startup and the smallest live journey needed.

### P2 — Runner and four scenarios (7h)

2.1 Run lifecycle, evidence sequence and interrupted-run persistence.
2.2 HTTP adapter and separate provider observations.
2.3 S1 approval-only nonfulfillment and S2 completed-capture fulfillment.
2.4 S3 repeated processing and entitlement observation.
2.5 S4 one-time response suppression and target reconciliation.
2.6 Five verdict categories and seeded/corrected sample configurations.
2.7 Connect all scenarios and publish handover/issues.

Completion: all four scenarios call actual adapter operations and evaluate actual observations. Minimal connection checks; defer nonblocking issues.

### P3 — DeepSeek planning, explanation and headless commands (4.5h)

3.1 DeepSeek client, strict configuration, deadlines and bounded retries.
3.2 JSON planner and Zod/semantic validation.
3.3 Plan review representation and machine-readable execution.
3.4 Evidence-bound explainer with valid reference checks.
3.5 Text/JSON doctor, plan, run, resume, report and explain commands.
3.6 Connect requirement -> reviewed plan -> execution -> deterministic results -> explanation.

Completion: complete headless product workflow exists. No branded final UI is implemented here.

### P4 — Approved UI and delivery access (6h + user review wait)

4.1 Prepare concrete terminal/browser mockups using FollowThrough source reference.
4.2 Present all core states in this chat and await explicit user approval.
4.3 Record approved UI specification and relevant assets/tokens.
4.4 Implement approved TUI, shared report projection, keyboard/filter/evidence behavior.
4.5 Implement approved minimal judge page with actual plan/approval/run/report connection.
4.6 Package local install, configure deployment and persistent storage, document access.
4.7 Confirm every planned core feature is connected; publish phase handover.

While approval is pending, work on independent documentation/packaging/backend deployment tasks only.
Completion: approved interface and headless engine are connected; no placeholder-success pathways. This ends implementation, not stabilization.

### P5 — Dedicated stabilization (5h)

5.1 Triage recorded bugs without expanding scope.
5.2 Fix startup/central journey first.
5.3 Fix payment/approval/uncertainty/recovery defects.
5.4 Fix remaining core integrations and usability.
5.5 Check seeded faults, corrected outcomes, wrong amount/currency, missing evidence, unsupported hooks, blank model output, interrupted resume and redaction.
5.6 Compare UI with approved representative mockups and correct material deviations.
5.7 Perform one clean-install/hosted access rehearsal and relevant full journey after fixes.
5.8 Publish targeted regression evidence and close actually resolved issues.

Completion: supported demonstration is reliable; known limitations are explicit. Expand tests only for observed failure/unresolved risk.

### P6 — Demo and submission (3h)

6.1 Freeze accurate feature/limitation narrative and remote revision.
6.2 Record a real demonstration under three minutes.
6.3 Finish repository README, license, contribution attribution and judge access instructions.
6.4 Verify video/repository/demo links and public access.
6.5 Complete Devpost submission and verify actual completion.
6.6 Publish release notes and tie source artifact to remote revision.

Completion: functioning submission materials and submitted entry, not merely drafted text. Account/captcha/access steps that require the user are stated concretely.

## 18. Time budget and deadline

Planning reference: about 11:00 MYT on 10 November leaves roughly 65 elapsed hours until 13 November 04:00.
Base focused work: P0 1 + P1 5 + P2 7 + P3 4.5 + P4 6 + P5 5 + P6 3 = 31.5 hours.
Allow roughly 2 additional hours for remote GitHub administration/recovery; use 33–35 focused hours as a more honest target. User review and external access waits are additional elapsed time.

Proposed calendar:
10 Nov: P0, P1, first portion P2 (~10h).
11 Nov: finish P2, P3, present mockups and begin approved P4 (~11–12h).
12 Nov: finish P4, P5, P6 (~12h).
Target submission by 22:00 on 12 Nov; deadline 04:00 on 13 Nov.

This is intensive and depends on prompt credential/repo/UI access. Do not promise success regardless of delays.

Cut optional work first:
- Extra report styles/themes.
- Animated transitions.
- Additional report comparison.
- More fault variants.
- Sponsor integrations.
- Extra scenarios beyond four.

Do not bypass explicit UI approval, fabricate payment evidence, silently cut core behavior or replace live access with a video-only claim.

If the actual remaining time becomes insufficient, explain the concrete tradeoff and request a scope decision; do not claim an impossible plan remains on schedule.

## 19. Acceptance and demo

Central acceptance:
- DeepSeek creates a valid reviewed plan.
- Actual sandbox buyer approval occurs.
- Independent provider truth is compared with application behavior.
- All four checks have real implementations.
- Unknown/unsupported/error states remain honest.
- Resume does not blindly start a new payment.
- Final UI follows approved design.
- Judge can access a working supported route.
- Credentials/private artifacts are excluded from public source.
- GitHub history captures meaningful implementation/fixes.
- Live results and seeded demonstration faults are labeled.

Suggested 2m55 demo:
0:00–0:20 problem.
0:20–0:45 DeepSeek plan/review.
0:45–1:20 premature fulfillment failure.
1:20–1:55 corrected behavior and evidence.
1:55–2:30 lost-response recovery.
2:30–2:55 report, architecture and scope.

Do not spend video time on repository administration. Disclose seeded bugs. Do not claim discovered third-party vulnerabilities.

Judge backend requires available runtime credentials server-side and persistent run storage. It must stay accessible through the judging period; verify current schedule before deployment decisions. A saved report is a useful inspection option but does not replace the working live application.

Official rules: https://paypalaihackathon.devpost.com/rules

## 20. After the hackathon

Potential later work:
- Second independently integrated application adapter.
- Actual webhook delivery/replay/signature checks.
- Refunds and additional lifecycle scopes.
- Concurrency testing.
- CI-friendly approval/precreated-fixture strategy.
- Import/export existing API collections.
- Source mapping and specific repair suggestions backed by inspected code.
- Multiple users/merchant isolation and production qualification.

None of these are committed deadline scope.

## 21. Current execution status

Completed:
- Read updated user requirements and workflow attachment.
- Inspected FollowThrough README, terminal design documentation, renderer palette/navigation and browser-viewer documentation.
- Verified current DeepSeek API/model and JSON behavior documentation.
- Inspected local Node/npm versions.
- Defined remote-commit workflow compatible with no local commits/worktrees.
- Prepared updated plan in canonical PayProbe folder.

Not completed:
- GitHub repository creation: access blocker described above.
- Application implementation or worker creation.
- .env.local creation (scheduled for P1, as requested).
- Live DeepSeek/PayPal calls.
- UI mockups or approval.
- Deployment, CI execution, release or submission.

Do not treat this document as evidence those future actions have happened.

