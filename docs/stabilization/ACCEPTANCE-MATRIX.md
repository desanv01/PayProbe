# P5 acceptance matrix

Updated 2026-11-10. Payment provenance: **simulated** throughout current acceptance. No PayPal calls, buyer approval, real-provider verification, eligibility or submission readiness is established by these checks. DeepSeek is the only current external dependency; no repeated paid probes are needed here.

This is a bounded checklist for the connected product, not a new test framework. Full stabilization is gated on P1-P4 being connected and actual UI approval/implementation. Run a focused regression after its owning component or fix becomes available; do not repeatedly run broad suites against concurrent edits.

| Priority / boundary | Small acceptance check | Current evidence / dependency |
| --- | --- | --- |
| Startup | Node 24 starts backend; health/doctor truthfully identify simulated provider and key presence without values | P1 records startup/typecheck and one actual DeepSeek probe; P5 has not repeated these |
| Approval | GET simulator approval is read-only; explicit POST approval alone grants no entitlement or download | P5 HTTP recovery test includes these preconditions |
| Capture | Completed matching simulated capture produces exactly one accessible entitlement | P1 focused foundation check; P5 verifies after HTTP reconciliation |
| Recovery | One-time suppression really fires after capture; target stays uncertain with zero entitlements; reopening DB and retry cannot recapture; target reconciliation restores one entitlement with same capture/operation IDs | P5 HTTP recovery regression |
| Definite rejection | Premature capture followed by approval remains recoverable with original mutation ID | Reproduced defect #10; regression initially fails, P1 owns fix |
| Repeated processing | Three sequential calls preserve one entitlement and one capture | P5 HTTP recovery test after reconciliation; P2 runner verdict connection pending |
| Deterministic verdicts | Seeded S1/S3/S4 faults fail; corrected four-scenario run passes with preconditions; wrong amount/currency/identity or missing provider observations cannot pass | Pending P2 interfaces, then bounded targeted checks |
| Capability/errors | Missing hook => UNSUPPORTED; missing essential observation => INCONCLUSIVE; execution failure => ERROR | Pending P2 verdict projection |
| Planning / review | Valid DeepSeek plan requires explicit review; saved plan executes without another model request; blank/invalid/truncated outputs cannot silently execute | Pending P3; use local transport responses for edge cases, actual probe evidence belongs to P1 |
| Resume / report | Interrupted run resumes existing orders/mutation IDs; text/JSON reports preserve evidence references and simulated provenance; reports redact tokens/key material | Pending P2/P3 connected run/report interfaces |
| UI / access | Approved representative sizes, keyboard/filter/evidence flow and judge access work; read-only navigation makes no mutations | Gated on explicit UI approval and P4 implementation |
| Rehearsal | One clean install and hosted central journey against integrated revision after fixes | Pending P1-P4 integration and deployment; main coordinates |

## Focused command

`node --import tsx --test tests/stabilization/payment-http.test.ts`

Uses explicit test-only config, in-process Fastify injection and a temporary workspace SQLite DB that is removed after closing the backend. It never loads `.env.local`, listens on a port, calls a model, or contacts PayPal. It validates route and persistence integration; it is not a network/hosted or runner acceptance claim. Package/CI inclusion belongs to main; P5 does not edit package/CI files.
