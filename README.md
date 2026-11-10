# PayProbe

PayPal sandbox lifecycle diagnostics with DeepSeek-assisted planning and evidence-grounded findings.

## Status

Implementation is starting. The CLI and hosted demo are not available yet. Do not interpret this repository as a completed payment-testing product.

## Planned scope

- Approval must not release a digital product before capture.
- A matching completed capture produces one entitlement.
- Repeated processing must not multiply fulfillment.
- A completed capture with a lost response is reconciled correctly.

DeepSeek selects supported scenarios and explains recorded findings. Deterministic code evaluates provider and application observations.

## Implementation

TypeScript, Node.js, Fastify, Commander, Zod, SQLite, and the OpenAI-compatible client configured exclusively for DeepSeek. UI inspiration comes from [FollowThrough](https://github.com/desanv01/FollowThrough); actual PayProbe mockups must be approved before visual UI implementation.

[Complete implementation plan](PayProbe-Implementation-Gameplan-v2-2026-11-10.md) · [Project state](PROJECT-STATE.md)

## Development

Changes are committed remotely on GitHub through phase branches and pull requests. The working directory does not need local Git commits or worktrees. Keep credentials in ignored local environment files; API uploads must explicitly exclude them.

## License

MIT. See [LICENSE](LICENSE).

