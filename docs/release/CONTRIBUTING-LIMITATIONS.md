# Contribution and limitations

PayProbe's current release is an implemented local prototype with deterministic simulated payments and DeepSeek-only runtime AI. The CLI, reviewed scenario runner, terminal ledger, browser workflow and persisted reports are connected. Real DeepSeek planner/explainer calls and focused implementation/stabilization checks passed; browser fixture checks used an AI client double. The final demonstration is public and the entry is submitted to the **PayPal AI Hackathon 2026**. Submission does not establish organizer eligibility, production qualification or real PayPal integration.

## Focused contributions

Describe the observable problem, change relevant files, and include the smallest meaningful reproduction/check. Open an issue or PR with commands, sanitized expected/actual behavior and the tested source SHA. Deterministic checks own verdicts; model output cannot manufacture evidence or change them. Keep billable AI requests out of ordinary CI.

Never upload `.env.local`, API/bearer keys, download tokens, databases, raw private prompts, payment data or private artifacts. Preserve existing local configuration and keys. Payments remain explicitly simulated; do not add PayPal calls/credential setup, an AI-provider fallback or an unapproved interface change as incidental cleanup.

Follow [AGENTS.md](../../AGENTS.md) and the current authorized scope. Development in the canonical workspace uses remote GitHub commits and PRs with explicit public-file allowlists; no local Git initialization, commits or worktrees. Shared-file changes need coordination with their current owner.

## Attribution and licensing

See [contributions and credits](CONTRIBUTIONS.md) for the solo creator, Codex assistance, FollowThrough UI direction and MajuPilot video reference. The root [LICENSE](../../LICENSE) is MIT and is included in the verified source release. Preserve dependency and third-party asset notices; record the source, files and license for any new reuse. The `openai` npm package is a compatible transport explicitly configured for DeepSeek, not use of the OpenAI runtime service or an additional contributor.

## Honest boundaries

- Payment approval, capture and observations come from a simulator ledger. Separate observer paths within one backend are not independent third-party verification.
- The controlled sample is a digital-download store. Seeded defects are disclosed fixtures, not discovered third-party vulnerabilities.
- Sequential repeated processing is narrower than concurrency, universal exactly-once execution or comprehensive double-charge prevention.
- Suppressing one capture response is a controlled transport fault; it does not demonstrate every network failure mode or webhook behavior.
- Implemented scope uses USD integer cents, one merchant, one full capture and one-time purchases. Refunds, subscriptions, real webhook replay/signatures, multi-merchant isolation, arbitrary targets and production qualification are outside this release.
- Reports are diagnostic records, not compliance certificates. Missing evidence, unsupported capabilities and execution errors remain distinct from PASS.
- There is no hosted demo, supplied API key or judge account. Fresh AI planning/explanation requires the evaluator's own DeepSeek access. Public video visibility and owner-signed-in playback were confirmed; signed-out playback remains unverified.

Real PayPal sandbox integration/validation remains a separate deferred stage. Do not request PayPal credentials for current simulated workflows. See [setup](SETUP.md), [judge access](JUDGE-GUIDE.md) and the [delivery checklist](CHECKLIST.md) for the supported local pipeline and recorded status.
