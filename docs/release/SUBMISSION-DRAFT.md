# Submission copy — draft only

No entry has been submitted. No eligibility determination, hosted URL, video, successful CI, or live PayPal validation is established. This text must be checked against a functioning integrated revision before use. Do not silently submit simulation-only work as satisfying rules requiring real provider integration.

**Name:** PayProbe

**Tagline:** Inspect the boundary between payment state and digital delivery.

**Problem:** Approval screens and successful HTTP responses can hide premature delivery, repeated fulfillment, or unresolved capture uncertainty.

**Approach:** PayProbe is being built to turn a developer's digital-purchase requirement into a reviewed, bounded scenario plan with DeepSeek. A deterministic runner compares separately recorded payment and application observations, records evidence, and supplies findings for an evidence-referenced explanation.

**Current scope disclosure:** All current payment operations use a deterministic simulator. Simulated approval and capture are not actual PayPal buyer approval or independently verified PayPal payments. DeepSeek is the current external API dependency. Real PayPal sandbox integration and validation are deferred until implementation and stabilization complete. The current prototype's eligibility and submission readiness have not been established.

**Checks to demonstrate after verification:** Approval without capture must not fulfill; matching completed capture yields one entitlement; sequential repeated processing preserves one entitlement; a suppressed capture response is reconciled from existing payment state. Seeded defects belong to our sample store and are disclosed as intentional demonstrations.

**Technology:** TypeScript, Node 24, Fastify, Commander, Zod, SQLite, and DeepSeek via an OpenAI-compatible client explicitly configured for DeepSeek. UI direction is inspired by FollowThrough; actual source/asset reuse and licenses must be listed before publication.

**Known limits:** Controlled sample target, simulation-only payments, USD single full capture, sequential repeat checks, no production/security certification, no webhook verification, no refunds/subscriptions, no demonstrated multi-user isolation.

## Fill only from real evidence

| Submission field | Current status |
| --- | --- |
| Public repository | `https://github.com/desanv01/PayProbe`; accessibility at final revision still to verify |
| Source commit / release | Not frozen |
| Working demo URL and judge instructions | Not provisioned or verified |
| Video URL and measured duration | Not recorded |
| Team and contribution credits | Owner to confirm; no invented credits |
| Rules, deadline, judging access period, AI disclosure | Recheck current official event rules before actual submission; dates in planning documents are not current verification |
| Actual submission receipt | None |

Before the deferred submission decision, compare the completed product with [official rules](https://paypalaihackathon.devpost.com/rules), record any mismatch, and obtain the user's direction on eligibility/remediation. The proposed text and repository link are not evidence of acceptance.
