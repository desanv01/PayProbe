# Actual connected UI observations — 10 November 2026

These are captures of the connected application, distinct from synthetic design mockups in `review-v1.1`. Payments remain simulated. No new paid model request was made for these checks.

| Capture | Provenance |
|---|---|
| [Readiness wide](initial-wide.png) | Actual production browser page, 1000px; readiness/static requests only |
| [Readiness compact](initial-compact.png) | Same actual page at 390px |
| [Fixture results wide](fixture-results-wide.png) | Actual production UI/routes and simulator; labelled planner-double test setup |
| [Fixture results compact](fixture-results-compact.png) | Same report at 390px, actual recorded simulated findings |
| [Fixture evidence compact](fixture-evidence-compact.png) | Actual S3 recorded fields at 390px under the same test fixture |

The full browser fixture exercised Create scenario plan, explicit reviewed start, two explicit simulated approvals, PASS/PASS/FAIL/PASS under disclosed seeded duplicate fulfillment, no-match and FAIL filtering, separate evidence/back navigation and actual local text/JSON downloads. Exported JSON retained simulated provenance, `realPayPalVerified:false`, four cases and 30 events. The planner was a fixed test double, not an actual DeepSeek response. Test rationale and an explicit fixture banner disclosed that boundary.

Readiness, report and evidence had no horizontal overflow at checked widths. Warm palette, frame/card hierarchy, readable wrapping, visible focus and logical Tab order were inspected against approved v1.1. Runtime forms/observed data replace design placeholders; no new visual system was introduced. No additional paid design conversion was requested for this comparison.

Read-only evidence/back/filter/export interaction made no further server mutations. Browser request record contained only local fixture session/plan/review/run and two approval operations; no external API host. Test services stopped after inspection.

Native Windows terminal check: actual 80x24 ledger selection, evidence, filtering and q restoration passed on an isolated real simulator report created from a synthetic fixed plan. Node's asynchronous SQLite warning initially corrupted the first frame; issue #25/PR #26 fixed startup ordering and native rerun passed. This is terminal execution evidence, not a mockup image.

Limitations: these observations do not establish hosted access, clean-install acceptance, actual DeepSeek browser planning, PayPal behavior or submission readiness. Those claims require their own evidence.
