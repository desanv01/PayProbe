# PayProbe UI specification v1.1

Status: layout, controls, compact behavior and states APPROVED by the user through Main on 2026-11-10, with user-authorized palette change. Production implementation is authorized within that scope.
Date: 2026-11-10. Owner: persistent P4 worker. Tracking: issue #5.

## Approval record and active palette

User response relayed by Main: “yes approve all but change the color scheme to something else, as this color scheme was already used for another project of mine”. This approves the reviewed structure/controls/states and delegates a different color scheme. Main selected graphite/amber/ivory/plum; the user did not pick individual hex values. Revision v1.1 keeps the approved structure and changes palette only. No further palette approval gate is inferred.

Active tokens supersede the historical cyan references below: background #17191E; panels #20232B; text #F4F0E8; accent/header #E9B44C with dark header text; selected row #4B3B68 with ivory text; muted #B8B3AA; PASS #8DBF91; FAIL/ERROR #ED8080; uncertainty amber with textual labels. No cyan in production or v1.1 renders.

Current review package: `review-v1.1/index.html`, `review-v1.1/browser.html`, 28 exact SVG grids and six representative PNGs with unchanged filenames. v1 remains historical provenance, not the active palette target.

## Scope and provenance

All preview values are synthetic design data. Payment provider is simulated. Preview controls never execute a payment, provider request or DeepSeek request. Simulated approval/capture is not PayPal verification, actual buyer approval or submission readiness. Real-provider integration is deferred.

DeepSeek is the runtime planner/explainer; requested alias `deepseek-flash` currently maps to DeepSeek-V4.1-Flash-1017 and is rolling. A preview readiness indicator means a synthetic configuration example, not a fresh API check.

## Reference and visual language

Inspected FollowThrough `docs/project/RUN-LEDGER.md`, `reporting/run_ledger.py`, `docs/project/VIEWER.md`, and actual `docs/assets/demo/terminal.png` and `browser.png` at main (reference tree fe79e0108ae15bb488c08b8b55f038f1717621cb).

- Background #000000; text #EBF1F2; accents #00E7EB; table header #00DEE1 with black text; selection #00656F with #F5FFFF text.
- Thin cyan terminal frames, monospaced text, no gradients or decorative charts. Cascadia Mono / JetBrains Mono / host monospace. Never modify global terminal settings.
- Wide representative terminal: 120 columns × 36 rows. Compact: 80 × 24. At compact size use short scenario cards and a selected-item panel rather than squeeze all columns.
- Preserve visible provenance, selected identity, lifecycle/verdict distinction, missing-evidence notice, and keyboard hints before optional detail. Long identifiers get a short display label and an inspectable full value in evidence.
- Browser: small semantic single-column report with cyan accents, clear focus, literal escaped evidence, and responsive scenario cards. The browser is a proposed judge access surface, not a dashboard expansion.

Reference is design inspiration only. No FollowThrough code is copied. Downloaded reference screenshots remain local inspection inputs and are excluded from the publication allowlist.

## State inventory and transitions

| State | Required content | Proposed next action |
|---|---|---|
| Doctor ready | simulated provider; adapter capability inventory; DeepSeek key present only; local persistence status | review plan |
| Doctor missing key | `deepseek_key_missing`; no key value; saved-plan execution availability depends on engine support | configuration guidance; no silent fallback |
| Plan review | requirement summary, USD amount, target/variant, S1–S4 descriptions, supported hooks, plan hash and explicit review | explicit start reviewed simulation; back |
| Awaiting simulated approval | local order identity, simulated provider, no payment completion yet | explicit simulate approval; pause/back |
| Running | selected case, observed provider and application events separately, no early PASS | inspect evidence; pause if supported |
| Uncertain | capture response lost; completion unknown to target; operation/order identity retained | reconcile existing order; no blind recapture |
| Reconciling | existing order queried; provider observation and entitlement observation independent | wait for recorded outcome |
| Result ledger | S1–S4 lifecycle and PASS/FAIL/INCONCLUSIVE/UNSUPPORTED/ERROR, evidence references | move selection; Enter evidence |
| Evidence | sequence, UTC time, source (simulated provider/application/fault/runner), sanitized fields and stable event ID | Enter or Esc details |
| Inconclusive | specific missing observation/precondition, unknown shown literally | inspect evidence; resume only when valid |
| Unsupported | named absent capability and skipped assertion | inspect capabilities; no success label |
| Error | bounded code, phase and retained run ID; no raw exception/private data | inspect evidence; resume guidance |
| Empty report | no cases/runs; no stale selection | plan guidance |
| No filter matches | applied filter and zero matches; no stale selected detail | Esc clear |
| Browser access/result | fixed sample target, explicit simulated scope, plan review/wait/run/report states, export text/JSON | inspect same report data |

`awaiting_approval`, `running`, `paused`, `finished`, `error` are lifecycle labels. PASS/FAIL/INCONCLUSIVE/UNSUPPORTED/ERROR are assertion verdicts. Pending execution has no verdict. Unknown capture/entitlement values are `unknown`, never zero.

## Keyboard and interaction contract

- Up/Down or j/k moves the selected case in a bounded visible window.
- Enter opens evidence in ledger; Enter again returns. Context-specific mutation actions require explicit labelled confirmation and cannot reuse a report-navigation keystroke.
- `/` starts a bounded literal filter over case/scenario/state/verdict; Enter applies; Escape cancels edit, then closes evidence, then clears filter, then leaves viewer.
- `q` closes the report viewer. It must not cancel a running operation silently.
- Evidence navigation is read-only. A rendered preview offers only mock-state navigation.
- Text mode is plain, noninteractive and suitable for piping; JSON is the canonical sanitized report, without ANSI. Do not drop provider provenance in either export.
- Terminal state/cursor/color restoration is required on exit/error after implementation approval. Unsupported interactive terminals fall back with a plain actionable diagnostic.
- Browser uses semantic buttons/links, visible focus, keyboard-operable controls and status text announced without continuous chatter; no color-only verdict meaning. No arbitrary external target URL form.

## Integration boundary after approval

P2 owns run/case/evidence truth; P3 owns reviewed-plan and report command projection. UI consumes these projections and never assigns verdicts, repairs target fulfillment, invents success or discovers private files. All actions must route through supported engine commands/endpoints. Main owns shared CLI/API/package edits and resolves those interfaces.

## Authoritative review artifacts

Approval target: `review-v1/index.html`, `review-v1/browser.html`, and the 28 `review-v1/*-120x36.svg` / `*-80x24.svg` state renders. `build-review.mjs` reproduces these design-only refinements. They retain selected 12ui direction A's black/cyan stacked frame language while correcting AI-generated labels and fitting exact terminal grids. These are source-rendered proposals, not a running terminal UI or product verification.

Browser-captured PNGs: `review-v1/ledger-120x36.png`, `ledger-80x24.png`, `evidence-80x24.png`, `plan-120x36.png`, `browser-wide.png`, `browser-compact.png`. Browser widths: 1000 and 390 CSS pixels. Native SVG dimensions include a 20-pixel outer margin; each terminal cell is 10 × 22 pixels. `snapshots.json` records exact row/column source content and synthetic provenance.

Four original 12ui candidate images and seven branch images were inspected. Raw exploration (`direction-a.png`, `api-state-mockups/*`) contains generated copy errors and is not the approval target. Notably it used an outdated model alias, premature outcomes and an out-of-scope checkout card; final review-v1 corrects those. The local converter failed with Windows spawn EINVAL; API conversion recovered the existing generated screens, but final prototype packaging hit fsync EPERM. Completed generated pages remain local exploration inputs; the self-contained final gallery is the review artifact.

All 14 states are available in both grid sizes: doctor, missing-key, plan, approval, running, uncertain, reconcile, ledger, evidence, inconclusive, unsupported, error, empty, filter. This is more explicit than the eight grouped conceptual screens. Gallery controls select snapshots; browser buttons/exports navigate or download synthetic preview content only. Runtime j/k/filter/input handling remains a proposed interaction contract for implementation after approval.

User approval now identifies the v1 layout with the explicitly requested palette change realized in v1.1. Runtime implementation exports `showReportTui` and `registerDemoUi`; integration remains P1/Main-owned. The browser uses one fixed-target bounded demo/session, server-owned run membership and mutations, no administrator bearer or arbitrary target URL input. All payment evidence remains simulated.
