# PayProbe

Payment lifecycle diagnostics with DeepSeek-assisted planning and evidence-grounded explanations.

**Current payment provider: deterministic simulation.** Simulated approval, capture, and provider observations are labeled as such. No real money moves, and no PayPal integration has been verified. DeepSeek is the only external API used in current scope.

PayProbe compares application delivery with separately recorded simulated payment observations across four checks:

- Approval alone must not unlock a digital download.
- A matching completed capture should produce one entitlement.
- Sequential repeated processing should not multiply fulfillment.
- A completed capture whose response is suppressed should be reconciled from existing payment state.

The sample store, protected download, simulator ledger, deterministic runner, and reviewed headless CLI workflow are connected. Main observed an actual DeepSeek planner response and a reviewed simulated run with all four checks passing and 42 evidence events. That is one observed journey, not full product validation. The real explainer passed after a concise-output repair: all four cases have valid citations and all 42 evidence events were supplied. Runtime UI verification remains pending. Approved graphite/amber/ivory/plum UI modules are merged and production bindings are underway. Hosting is not provisioned.

DeepSeek selects supported scenarios and is used for optional evidence explanations; deterministic code assigns verdicts. AI text is not payment truth. The `deepseek-flash` model name is a rolling API alias, currently DeepSeek-V4.1-Flash-1017. The OpenAI-compatible SDK is configured exclusively for DeepSeek; no OpenAI runtime key is required.

Requires Node 24.14+ (24.x). Run `npm ci`, populate the ignored `.env.local` with `DEEPSEEK_API_KEY`, then run `npm run build` and `npm start -- doctor`. The public `.env.example` lists optional configuration. Keep the SQLite directory for resumability. Set `PAYPROBE_API_TOKEN` before binding beyond loopback. After building, keep `npm start -- serve` running. In another terminal at the same project root:

```powershell
New-Item -ItemType Directory -Force .private/demo | Out-Null
npm start -- plan examples/download-contract.json --out .private/demo/draft-plan.json
Get-Content .private/demo/draft-plan.json
# Accept only after inspecting the exact draft:
npm start -- plan --review .private/demo/draft-plan.json --out .private/demo/reviewed-plan.json
npm start -- run .private/demo/reviewed-plan.json --auto-approve-simulated
```

The planner makes a real DeepSeek request. Review and execution do not replan. `--auto-approve-simulated` affects simulated orders only; omit it to pause for simulated approval. Use the actual run ID for `npm start -- resume RUN_ID --auto-approve-simulated`, `npm start -- report RUN_ID --format text` (or `json`), and optional `npm start -- explain RUN_ID --out .private/demo/explanation.json`. `explain` makes a real DeepSeek request; its concise-output repair has passed one actual API verification. New output files never overwrite existing paths. See setup for configuration and persistence details.

See [setup](docs/release/SETUP.md), [release gates](docs/release/CHECKLIST.md), and [contribution and limitations](docs/release/CONTRIBUTING-LIMITATIONS.md).

The implementation uses TypeScript, Node 24, Fastify, Commander, Zod, and SQLite. There is no current claim of production qualification, verified third-party vulnerability discovery, webhook correctness, or universal payment testing. Real PayPal sandbox integration and verification are a deferred stage after current implementation and stabilization. Simulation alone establishes neither hackathon eligibility nor submission readiness.

UI direction is inspired by [FollowThrough](https://github.com/desanv01/FollowThrough). Borrowed code/assets, if any, must retain their actual license and attribution; inspiration is not a claim that source was copied. The root `LICENSE` is MIT and has been restored locally from the existing remote file. Check final packaged source and contribution credits before release.
