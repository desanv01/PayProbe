# Review v1 — approval pending

Open [terminal gallery](review-v1/index.html) or [small browser proposal](review-v1/browser.html). These self-contained files navigate synthetic mock states only. They do not connect to the engine or perform provider/AI operations. Main owns approval presentation and records the user's actual response.

Representative images:

- [Wide result ledger](review-v1/ledger-120x36.png)
- [Compact ledger](review-v1/ledger-80x24.png)
- [Compact evidence](review-v1/evidence-80x24.png)
- [Plan review](review-v1/plan-120x36.png)
- [Browser wide](review-v1/browser-wide.png)
- [Browser compact](review-v1/browser-compact.png)

The gallery includes doctor, missing-key, plan, simulated approval, running, uncertain, reconcile, ledger, evidence, inconclusive, unsupported, error, empty and no-match filter in both terminal geometries. Select state and size to inspect. Browser review has the same states and local preview exports. Keyboard hints describe the proposed runtime contract; actual terminal key handling is not implemented by image snapshots.

All preview payment provenance is simulated, and all values are synthetic design data. No real PayPal validation, buyer approval or submission readiness is established. These explanatory notes belong to the review wrapper; product panels focus on actions and findings.

Read [UI-SPEC.md](UI-SPEC.md) for palette, interactions, scope and boundaries. Run `node docs/design/build-review.mjs` to reproduce exact SVG grids, HTML and synthetic snapshots. PNGs are browser captures of those files at representative widths.

12ui supplied four candidate directions and an eight-state branch exploration. The final source-rendered refinements retain direction A's stacked black/cyan T3 geometry and correct generated semantic errors. Raw exploration files, screenshots from FollowThrough and service metadata are local inspection inputs, excluded from the public publication allowlist. Reference sources and attribution are in UI-SPEC.md. No FollowThrough code is copied.

Actual checks: all 28 grids are bounded to declared columns/rows; wide ledger and plan, compact evidence and responsive browser were visually inspected; browser plan/report/evidence controls switch expected local states; browser document has no horizontal overflow at 390px. The only observed browser console resource error was an absent favicon. This is design verification, not engine integration.

User approval remains pending. Do not treat this package as production UI or completed P4.
