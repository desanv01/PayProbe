# PayProbe submission copy

Updated 10 November 2026. PayProbe was submitted to the PayPal AI Hackathon on Devpost after explicit user authorization, with the known simulation/PayPal eligibility mismatch disclosed. The submission owner observed the “Project submitted!” confirmation and “SUBMITTED TO PayPal AI Hackathon” sidebar. Submission does not establish eligibility, judging acceptance or real PayPal integration.

**Name:** PayProbe

**Saved tagline:** AI-assisted payment lifecycle diagnostics: review a test plan, run simulated checkout fault scenarios, and inspect evidence-backed results in a CLI and browser.

## Problem and solution

Approval screens and successful HTTP responses can hide premature delivery, repeated fulfillment or unresolved capture uncertainty. PayProbe turns a digital-purchase requirement into a bounded scenario plan with DeepSeek, requires human review, and runs deterministic checks against a controlled sample store. It compares separately recorded simulated payment and application observations, preserves evidence in SQLite, and generates an evidence-referenced explanation with DeepSeek.

The CLI, terminal ledger and local browser workflow connect planning, review, execution, reports and evidence inspection. Saved runs can resume after a backend restart without replanning.

## What the demonstration shows

- Approval alone does not fulfill a purchase.
- A matching completed capture produces one entitlement.
- Sequential repeated processing preserves one entitlement.
- A deliberately suppressed capture response leaves uncertainty that the sample target reconciles against its existing capture before fulfilling once.

The intentionally faulty sample produces two entitlements for one capture and fails the duplicate-delivery check. A separate corrected run passes all four scenarios with 42 evidence events. These are disclosed sample fixtures, not discoveries in a third-party store. Real DeepSeek planner and explainer requests were verified through the CLI; browser fixture checks used an AI client double.

## Scope and technology

All payment operations use a deterministic simulator. Simulated approval and capture are not PayPal buyer approval, PayPal API integration or independently observed real-provider payment truth. Real PayPal sandbox integration and validation remain deferred. DeepSeek is the only external runtime API dependency, using the rolling `deepseek-flash` alias through an explicitly configured compatible SDK.

Built with TypeScript, Node 24, Fastify, Commander, Zod and SQLite. Current coverage is a controlled digital-download target, USD single full capture and sequential repeat checks. There is no production/security certification, webhook verification, refunds/subscriptions coverage or demonstrated multi-user isolation.

## Links and access

| Item | Status |
| --- | --- |
| Public source | [desanv01/PayProbe](https://github.com/desanv01/PayProbe) |
| Verified source prerelease | [v0.1.0-simulated](https://github.com/desanv01/PayProbe/releases/tag/v0.1.0-simulated); frozen package source `32e036d3cae80a915625319140ffdfc01b736e6d` |
| Video source and delivery records | Merged source commit `882548db246df2b4761caeadc2038f981008fbb6`; [delivery receipt](../../video-production/payprobe-demo/deliverables/DELIVERY-RECEIPT.md) |
| Public film | [PayProbe demo on YouTube](https://youtu.be/N5HF1Um5x_U), published 10 November 2026; 170 seconds (2:50), 1920×1080, 30 fps |
| Judge access | [Local setup and access guide](JUDGE-GUIDE.md); no hosted demo, supplied API credentials or judge account |
| Devpost | [Submitted project](https://devpost.com/software/payprobe-wng98r), project `1292802`; submission confirmation observed 10 November 2026 |

YouTube's public visibility setting and publication confirmation were observed. Watch playback advanced to 0:30 of 2:50 in the owner's signed-in browser; signed-out playback was not independently verified. Devpost's receipt states that editing remains available until 12 November 2026 at 3:00 pm EST (13 November at 4:00 am Asia/Kuala_Lumpur). Private receipt evidence is retained outside the public source.

The source archive contains no private key or saved private database. Judges need their own DeepSeek key and API access for fresh AI planning/explanation. Installed deterministic test suites can run without a key. The video demonstrates the recorded workflow without granting live application access.

Video narration uses the standard Microsoft Zira synthetic voice. Music, font and asset disclosures are in [media credits](../../video-production/payprobe-demo/assets/MEDIA-CREDITS.md). The film uses MajuPilot-inspired editorial framing around the actual PayProbe terminal. Team/contribution fields must reflect the owner's actual contributions; no additional team member is asserted here.
