# Proposed root README copy

For the orchestrator to integrate after checking the selected source revision. This file does not replace the root README.

---

# PayProbe

Payment lifecycle diagnostics with DeepSeek-assisted planning and evidence-grounded explanations.

**Current payment provider: deterministic simulation.** Simulated approval, capture, and provider observations are labeled as such. No real money moves, and no PayPal integration has been verified. DeepSeek is the only external API used in current scope.

PayProbe is being built to compare application delivery with separately recorded payment observations across four checks:

- Approval alone must not unlock a digital download.
- A matching completed capture should produce one entitlement.
- Sequential repeated processing should not multiply fulfillment.
- A completed capture whose response is suppressed should be reconciled from existing payment state.

The sample store, protected download, simulator ledger, and headless foundation exist. The full runner, reviewed AI workflow, final UI, and hosted judge access require integrated-revision verification. UI mockup approval is pending. Treat the repository as an implementation-stage project.

DeepSeek is intended to select supported scenarios and explain evidence; deterministic code assigns verdicts. AI text is not payment truth. The `deepseek-flash` model name is a rolling API alias, currently DeepSeek-V4.1-Flash-1017. The OpenAI-compatible SDK is configured exclusively for DeepSeek; no OpenAI runtime key is required.

See [setup](SETUP.md), [release gates](CHECKLIST.md), and [contribution and limitations](CONTRIBUTING-LIMITATIONS.md) in this documentation directory. When moving this copy to the root README, update these links to `docs/release/...`.

The implementation uses TypeScript, Node 24, Fastify, Commander, Zod, and SQLite. There is no current claim of production qualification, verified third-party vulnerability discovery, webhook correctness, or universal payment testing. Real PayPal sandbox integration and verification are a deferred stage after current implementation and stabilization. Simulation alone establishes neither hackathon eligibility nor submission readiness.

UI direction is inspired by [FollowThrough](https://github.com/desanv01/FollowThrough). Borrowed code/assets, if any, must retain their actual license and attribution; inspiration is not a claim that source was copied. Confirm the root license file before advertising a license or release.
