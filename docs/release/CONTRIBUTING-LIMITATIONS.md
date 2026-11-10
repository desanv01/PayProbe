# Contribution, attribution, and limitations

Current scope is a deterministic simulated payment provider and DeepSeek-only runtime AI. Keep simulated provenance in evidence, reports, examples, and screenshots. Do not add PayPal network calls, credential setup, another AI provider, or visual UI without the applicable scope/design approval.

For a focused contribution, describe the observable problem, change only relevant files, and include the smallest meaningful reproduction/check. Open an issue or PR with commands, sanitized expected/actual behavior, and the tested source SHA. Do not upload `.env.local`, API/bearer keys, download tokens, databases, raw private prompts, payment data, or private artifacts. Do not make billable AI requests from ordinary CI. Deterministic checks must own verdicts; model output cannot manufacture evidence or change them.

Current development uses remote GitHub commits, phase branches, and draft PRs; no local Git initialization, commits, or worktrees in the canonical workspace. The orchestrator owns integration and shared documentation. Follow the repository's `AGENTS.md` and current user scope before changing phase-owned files.

Attribution: FollowThrough informs UI direction. Keep a concrete source/file/license record if code or assets are reused; no audit of all future UI assets has occurred. Runtime dependencies include Fastify, Commander, Zod, dotenv, and the OpenAI-compatible SDK pointed at DeepSeek. Retain applicable package licenses. The root `LICENSE` is MIT; main restored the local copy from the existing remote file. Check its inclusion in final packaged source and do not invent author or contributor credits.

## Honest boundaries

- Payment approval/capture/observations come from a simulator ledger, not PayPal. Separate observer paths within one backend are not independent third-party verification.
- Current sample target is a controlled digital-download store. Any seeded defect is a disclosed fixture, not a discovered third-party vulnerability.
- Sequential repeated processing is narrower than concurrency, universal exactly-once execution, or comprehensive double-charge prevention.
- Suppressing one capture response is a controlled transport fault; it does not demonstrate every network failure mode or webhook behavior.
- The planned supported scope is USD integer cents, one merchant, one full capture, one-time purchases. Refunds, subscriptions, real webhook replay/signatures, multi-merchant isolation, arbitrary targets, and production qualification are outside current acceptance.
- Reports are diagnostic records, not compliance certificates. Missing evidence, unsupported capabilities, and execution errors must remain distinct from PASS.
- A working local headless server does not establish an approved UI, hosted judge availability, successful CI, a recorded demonstration, eligibility, or a submitted entry.

Real PayPal sandbox integration/validation is deferred until implementation and stabilization finish. Do not request PayPal credentials for current contributions.
