# P5 acceptance matrix

Updated 2026-11-10. Payment provenance: **simulated** throughout current acceptance. No PayPal calls, buyer approval, real-provider verification, eligibility or submission readiness is established by these checks. DeepSeek is the only current external dependency; no repeated paid probes are needed here.

This is a bounded checklist for the connected product, not a new test framework. User approved UI structure/interactions with the v1.1 graphite/amber/ivory/plum palette. Actual UI source and P1 wiring are published; P4 owns visual/native-key verification separately. Run a focused regression after its owning component or fix becomes available; do not repeatedly run broad suites against concurrent edits.

| Priority / boundary | Small acceptance check | Current evidence / dependency |
| --- | --- | --- |
| Startup | Node 24 starts backend; health/doctor truthfully identify simulated provider and key presence without values | P5 clean remote-source install/build/compiled doctor/health/demo PASS at UI code `68ce006942e6ee2525ca45def61ab0e99b5cbeb8` |
| Approval | GET simulator approval is read-only; explicit POST approval alone grants no entitlement or download | P5 HTTP recovery test includes these preconditions |
| Capture | Completed matching simulated capture produces exactly one accessible entitlement | P1 focused foundation check; P5 verifies after HTTP reconciliation |
| Recovery | One-time suppression really fires after capture; target stays uncertain with zero entitlements; reopening DB and retry cannot recapture; target reconciliation restores one entitlement with same capture/operation IDs | P5 HTTP recovery regression |
| Definite rejection | Premature capture followed by approval remains recoverable with original mutation ID | #10 fixed, focused regression passed, main integrated and closed issue |
| Repeated processing | Three sequential calls preserve one entitlement and one capture | P5 HTTP recovery check passed; P2 connected runner and P5 process journey establish four-case integration |
| Deterministic verdicts | Seeded S1/S3 fulfillment bugs fail; corrected four-scenario run passes; deliberate S4 suppression recovers; incompatible independent truth cannot pass | P2 existing 5 focused checks cover seeded faults/missing truth/interruption. New P5 amount/currency transport check PASS: wrong completed amount and EUR response both INCONCLUSIVE even though target fulfilled |
| Capability/errors | Missing hook => UNSUPPORTED; missing essential observation => INCONCLUSIVE; execution failure => ERROR | Already covered by P2 runner checks; assessed existing source/tests and did not duplicate unchanged suite |
| Planning / review | Valid DeepSeek plan requires explicit review; saved plan executes without another model request; malformed output never silently executes | Main reports actual planner + simulated four-scenario run PASS (42 evidence), then actual explainer PASS first attempt after PR #22 (366 completion tokens, all 42 evidence retained). Prior explainer failure is resolved. P3 schema/citation doubles cover validation; P5 made no paid calls and does not claim exhaustive model-response edge-case transport validation |
| Resume / report | Interrupted run resumes existing orders/mutation IDs; text/JSON reports preserve evidence references and simulated provenance; reports redact tokens/key material | P5 actual child-process check PASSED: approval pause, backend stop/restart, persisted reviewed source, same-run four-scenario completion, two purchases/captures/entitlements, text/JSON canary redaction; missing source refuses resume before payment operation |
| UI / access | Approved representative sizes, keyboard/filter/evidence flow and judge access work; read-only navigation makes no mutations | Actual production buildServer access check PASS: demo public, admin/lookalikes protected, CSRF/origin/session ownership enforced, missing key503/no purchase, unreviewed409, session expiry after restart. P4 owns separate actual visual/native-key report; hosted access is unverified |
| Rehearsal | One clean install and hosted central journey against integrated revision after fixes | Clean install/build/compiled startup/demo/session PASS at frozen remote UI revision. No external deployment/hosted rehearsal performed |

Final source ZIP integrity/link gate also passed independently at revision `32e036d3cae80a915625319140ffdfc01b736e6d`: 52 public files, exact remote blob equality, all manifest/ZIP hashes, four local Markdown links and byte-identical stable publication copy. Runtime/dependency comparison found no material install gap requiring another install. See [artifact acceptance](ARTIFACT-ACCEPTANCE.md). This documentation/verifier publication is outside the frozen package; video remains on hold and hosted access remains unverified.

## Focused command

`node --import tsx --test tests/stabilization/payment-http.test.ts`

Uses explicit test-only config, in-process Fastify injection and a temporary workspace SQLite DB that is removed after closing the backend. It never loads `.env.local`, listens on a port, calls a model, or contacts PayPal. It validates route and persistence integration; it is not a network/hosted or runner acceptance claim. Package/CI inclusion belongs to main; P5 does not edit package/CI files.

`node --import tsx --test tests/stabilization/cli-process.test.ts`

One process-level check (1 pass, 0 fail, zero skips; approximately 20 seconds) against connected CLI main `5a9f8fa84c8fd56ff08acefce89a569e5956822a`. Starts the actual CLI backend on an isolated ephemeral loopback port and uses separate CLI processes sharing a temporary SQLite DB. Empty model/PayPal credentials and an isolated cwd prevent loading the user's `.env.local` or making model calls. Stops/restarts the backend at a simulated approval pause; inspects durable reviewed-source linkage; resumes the same run; checks persisted capture/purchase identity counts and report redaction using synthetic contaminated evidence. Removes the review association to verify fail-closed resume. Reports are read with the backend stopped. All test processes and temporary data were cleaned up. Network-enabled execution was used because restricted-shell loopback is known to fail; this is not hosted-access or abrupt-mid-capture crash validation. P1 owns adding this exact path to CI. Do not repeat unchanged checks.

`node --import tsx --test tests/stabilization/payment-evidence.test.ts`

One new check passed with two controlled corruptions at the independent provider HTTP response boundary. Wrong amount remains valid schema but fails matching capture; wrong currency fails the USD observation schema. Both yield INCONCLUSIVE instead of PASS, despite actual target fulfillment. No provider/AI network calls; no direct verdict override or target fixture-mode inspection.

`node --import tsx --test tests/stabilization/ui-access.test.ts`

One new check passed against actual P1-wired `buildServer` at UI source `68ce006942e6ee2525ca45def61ab0e99b5cbeb8`. It does not register a substitute UI or mock the model. Missing key fails before any request. Validates public route/query handling and protected admin/lookalike routes, session cookie flags, CSRF/origin rejection, fixed-target schema, unreviewed/unowned/missing-key behavior and expired UI session on reopen. No purchase is created. Existing P4/P1 connected session-plan-run checks are not repeated.

`./tests/stabilization/clean-install.ps1 -Revision 68ce006942e6ee2525ca45def61ab0e99b5cbeb8`

Manual one-time rehearsal passed: exact public remote archive, clean `npm ci` (58 packages), `npm run build`, compiled doctor, health, demo and session routes with blank model/PayPal credentials and isolated ephemeral port/SQLite DB. Temporary installation/server removed. npm emitted an esbuild install-script approval advisory and Node emitted its SQLite experimental warning; neither caused a build/startup failure. No user settings changed. No broad suites or paid/PayPal calls. P1 owns package/CI inclusion of the two new test paths; the install rehearsal is not a recurring CI job.
