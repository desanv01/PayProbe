# PayProbe UI proposal v1

Status: DRAFT — explicit user approval pending. No production UI is authorized by this document.
Date: 2026-11-10. Owner: persistent P4 worker. Tracking: issue #5.

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

Render/package paths and actual visual checks are added to P4 handoff when generation completes. Approval must identify this proposal version and concrete reviewed artifacts; elapsed time is not approval.
