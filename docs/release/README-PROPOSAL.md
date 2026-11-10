# Proposed root README copy

For the orchestrator to integrate after checking the selected source revision. This file does not replace the root README.

---

# PayProbe

Payment lifecycle diagnostics with DeepSeek-assisted planning and evidence-grounded explanations.

**Current payment provider: deterministic simulation.** Simulated approval, capture, and provider observations are labeled as such. No real money moves, and no PayPal integration has been verified. DeepSeek is the only external API used in current scope.

PayProbe compares application delivery with separately recorded simulated payment observations across four checks:

- Approval alone must not unlock a digital download.
- A matching completed capture should produce one entitlement.
- Sequential repeated processing should not multiply fulfillment.
- A completed capture whose response is suppressed should be reconciled from existing payment state.

The sample store, protected download, simulator ledger, deterministic runner, and reviewed headless CLI workflow are connected. Main observed an actual DeepSeek planner response and a reviewed simulated run with all four checks passing and 42 evidence events. The repaired real explainer succeeded on its first attempt with valid references for all four cases and all 42 events supplied. That is one observed journey, not full product validation. The approved graphite/amber/ivory/plum native terminal and browser interfaces are connected and locally checked; browser fixture checks used an AI client double. Hosting is not provisioned.

DeepSeek selects supported scenarios and is used for optional evidence explanations; deterministic code assigns verdicts. AI text is not payment truth. The `deepseek-flash` model name is a rolling API alias, currently DeepSeek-V4.1-Flash-1017. The OpenAI-compatible SDK is configured exclusively for DeepSeek; no OpenAI runtime key is required.

After installing dependencies and building, keep `npm start -- serve` running. In another terminal at the same project root:

```powershell
New-Item -ItemType Directory -Force .private/demo | Out-Null
npm start -- plan examples/download-contract.json --out .private/demo/draft-plan.json
Get-Content .private/demo/draft-plan.json
# Accept only after inspecting the exact draft:
npm start -- plan --review .private/demo/draft-plan.json --out .private/demo/reviewed-plan.json
npm start -- run .private/demo/reviewed-plan.json --auto-approve-simulated
```

The planner makes a real DeepSeek request. Review and execution do not replan. `--auto-approve-simulated` affects simulated orders only; omit it to pause for simulated approval. Use the actual run ID for `npm start -- resume RUN_ID --auto-approve-simulated`, `npm start -- report RUN_ID --format text` (or `json`), and optional `npm start -- explain RUN_ID --out .private/demo/explanation.json`. `explain` makes a real DeepSeek request; a saved actual explanation can be inspected without another call. New output files never overwrite existing paths. See setup for configuration and persistence details.

Open `http://127.0.0.1:4310/demo` while the server runs for the fixed-target browser workflow. Use `npm start -- ledger RUN_ID` to inspect a saved run in the read-only interactive terminal ledger; noninteractive output falls back to text. Browser sessions expire on server restart, while saved runs remain in SQLite. Source packaging and local container instructions are in [local delivery](LOCAL-DELIVERY.md). Video work is on hold.

See [setup](SETUP.md), [release gates](CHECKLIST.md), and [contribution and limitations](CONTRIBUTING-LIMITATIONS.md) in this documentation directory. When moving this copy to the root README, update these links to `docs/release/...`.

The implementation uses TypeScript, Node 24, Fastify, Commander, Zod, and SQLite. There is no current claim of production qualification, verified third-party vulnerability discovery, webhook correctness, or universal payment testing. Real PayPal sandbox integration and verification are a deferred stage after current implementation and stabilization. Simulation alone establishes neither hackathon eligibility nor submission readiness.

UI direction is inspired by [FollowThrough](https://github.com/desanv01/FollowThrough). Borrowed code/assets, if any, must retain their actual license and attribution; inspiration is not a claim that source was copied. The root `LICENSE` is MIT and has been restored locally from the existing remote file. Check final packaged source and contribution credits before release.
