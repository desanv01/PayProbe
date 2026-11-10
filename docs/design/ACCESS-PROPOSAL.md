# P4 access proposal (approval pending)

This is deployment planning, not a deployed service or a claim of working judge access. UI approval and P2/P3 integration remain prerequisites. Payment provider remains simulated.

## Smallest supported installation

Use the existing Node 24/TypeScript/Fastify process and npm lockfile. Preserve headless doctor/plan/run/resume/report/explain. The approved TUI should be optional; noninteractive environments use text/JSON. A small approved browser page can be served by the same process. No additional framework or login system is needed for the fixed demonstration.

The local preview package is separate from runtime: it is static synthetic data, has no backend credentials and never creates orders. It must not be mounted as a working product route or called a successful integration.

## Hosted access requirements for main

- Select one long-running Node host with a persistent volume for the configured SQLite path; a static host alone cannot run Fastify or server-side DeepSeek.
- Configure the DeepSeek key only in the server environment; do not publish `.env.local` or ask for PayPal credentials.
- Use fixed seeded/corrected sample targets. Do not expose arbitrary URL execution, filesystem paths or unrestricted configuration controls.
- Preserve P1 bearer-token protection for test hooks; browser access must not embed a private token in an exported report. Main decides the narrow public demo route and any server-side mediation.
- Bound simultaneous runs and DeepSeek requests, maintain server-side run identity and durable operation IDs, and keep existing-order reconciliation on resume.
- Export only sanitized report/evidence projections. Show `provider: simulated` on access, approval, running, result and exported views. A lost capture response must remain uncertain until recorded observations support a result.
- Judge access documentation should identify exact deployed revision, retained storage, restart behavior, supported fixed variants and explicit simulation limits.

## Approval/integration checklist

Main must obtain explicit approval of the concrete mockup version before production UI. Then agree with P2/P3 on the canonical report schema, scenario IDs, event-source names, reviewed-plan hash, supported pause/resume semantics, and simulation approval command. Rendered design labels are not invented backend capabilities. Main owns package/CLI/API/shared-doc edits and deployment actions; P4 requests these cross-owner changes rather than modifying them unilaterally.
