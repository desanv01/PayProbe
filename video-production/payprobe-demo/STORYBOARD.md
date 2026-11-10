---
message: "Inspect what actually happened at the payment-to-delivery boundary."
mode: autonomous
length: 170
fps: 30
---

Approved nine-scene plan; full playable preview is the next approval gate. Final render is not authorized.

## Frame 1
id: hook
status: animated
src: compositions/hook.html
start: 0
duration: 8
rules: waterfall-entry, svg-path-draw, scale-swap-transition
beat: Approval is not payment.
narration: A checkout can look successful while delivering too early, delivering twice, or losing track of a completed payment.

## Frame 2
id: boundary
status: animated
src: compositions/boundary.html
start: 8
duration: 12
rules: waterfall-entry, svg-path-draw, scale-swap-transition
beat: Inspect the boundary.
narration: PayProbe checks the boundary between payment state and product delivery. This demonstration uses simulated payments. DeepSeek proposes supported checks; deterministic code assigns the verdicts.

## Frame 3
id: plan
status: animated
src: compositions/plan.html
start: 20
duration: 22
rules: waterfall-entry, svg-path-draw, scale-swap-transition
beat: Describe. Generate. Review.
narration: Start with the digital purchase requirement. The real DeepSeek planner selects four supported lifecycle checks. The generated plan is saved for inspection. Review accepts that exact plan before execution. The model does not invent endpoints, execute payment operations, or decide whether money moved.

## Frame 4
id: execute
status: animated
src: compositions/execute.html
start: 42
duration: 20
rules: waterfall-entry, svg-path-draw, scale-swap-transition
beat: The same run continues.
narration: Run the reviewed plan against the sample store. Execution pauses for simulated approval. Resume continues the same persisted run, using recorded order and operation identities. This explicit approval switch affects simulator orders only. It never represents a real PayPal buyer approval.

## Frame 5
id: faulty
status: animated
src: compositions/faulty.html
start: 62
duration: 28
rules: waterfall-entry, svg-path-draw, scale-swap-transition
beat: One payment. Repeated delivery.
narration: This sample deliberately contains a duplicate delivery defect. The runner compares the completed payment observation with the application fulfillment count. Repeated processing multiplies delivery, so the mismatch produces a failure. Select scenario three in the ledger, then open its recorded evidence. The payment and application observations make the reason inspectable.

## Frame 6
id: corrected
status: animated
src: compositions/corrected.html
start: 90
duration: 22
rules: waterfall-entry, svg-path-draw, scale-swap-transition
beat: A separate corrected run.
narration: Now inspect a separate corrected fixture. Approval alone keeps the product locked. A matching completed simulated capture yields one entitlement. Three sequential completion calls preserve that one delivery and the same capture. The report keeps this corrected run distinct from the intentionally faulty sample.

## Frame 7
id: recovery
status: animated
src: compositions/recovery.html
start: 112
duration: 26
rules: waterfall-entry, svg-path-draw, scale-swap-transition
beat: Unknown is a state to resolve.
narration: Here, capture completed, but its response was deliberately suppressed. Recorded event thirty seven shows the application uncertain with zero entitlements. The provider observation confirms an existing completed capture. Target reconciliation then fulfills the purchase once. Follow the recorded sequence from the lost response, through independent observation, to one accessible download backed by the same capture.

## Frame 8
id: explain
status: animated
src: compositions/explain.html
start: 138
duration: 18
rules: waterfall-entry, svg-path-draw, scale-swap-transition
beat: A real request. An inspectable response.
narration: The explain command sends the recorded findings to DeepSeek. Watch the actual request and returned explanation, with references to the evidence. Text and JSON reports retain the same deterministic findings. The AI explains the observations while code keeps control of the verdicts.

## Frame 9
id: proof
status: animated
src: compositions/proof.html
start: 156
duration: 14
rules: waterfall-entry, svg-path-draw, scale-swap-transition
beat: Inspectable, within its scope.
narration: The simulated source prerelease is available on GitHub. Real PayPal validation remains deferred. PayProbe makes its supported scope and recorded evidence inspectable.
