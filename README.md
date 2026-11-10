# PayProbe

Payment lifecycle diagnostics with DeepSeek-assisted planning and evidence-grounded findings.

Current scope uses an explicitly **simulated** payment provider. Real PayPal account integration and verification are deferred until implementation and bug fixing finish. No PayPal credentials or API calls are needed now. Simulation does not establish real PayPal verification, hackathon eligibility, or submission readiness.

## Run the P1 foundation

Requires Node 24.14+ (24.x) and npm. Install with `npm ci`, then:

```powershell
npm run dev -- doctor
npm run dev -- serve
```

The server defaults to http://127.0.0.1:4310. Output is plain JSON. UI mockup approval is pending. The scenario runner and AI planning/explanation commands are subsequent phase work.

`.env.local` is created without overwriting existing content. Populate `DEEPSEEK_API_KEY` locally; never publish it. The documented `deepseek-flash` API alias currently serves DeepSeek-V4.1-Flash-1017; this rolling alias is not an immutable version pin. `npm run dev -- deepseek-probe` makes one bounded real JSON request to the official DeepSeek API. Do not run it repeatedly without need. No OpenAI key/provider fallback is used.

Optional configuration fields are blank in [.env.example](.env.example); runtime defaults apply. `PAYPROBE_PROVIDER` only accepts `simulated`. Set `PAYPROBE_API_TOKEN` for protected API access; binding beyond loopback requires it. Keep SQLite files in ignored `.payprobe/` and preserve this directory to resume.

## Simulated foundation journey

1. POST `/adapter/orders` with a purchase UUID, operation UUID and integer USD cents. Retain both IDs.
2. Read the returned explicitly simulated approval URL; POST that URL to simulate approval. GET changes no payment state.
3. GET `/provider/orders/:providerOrderId` independently observes APPROVED. POST `/adapter/orders/:purchaseId/buyer-return` does not capture or grant an unpaid download.
4. POST `/adapter/orders/:purchaseId/capture` with a separate operation UUID. A completed matching simulated capture grants one entitlement.
5. POST `/adapter/orders/:purchaseId/process-again` or `/reconcile` retrieves existing provider state and keeps one entitlement.
6. For a separate approved purchase, POST `/arm-fault` before capture. The one-time fault discards the provider's completed capture response before target business logic receives it. Observe uncertainty, then invoke target `/reconcile` to recover existing completion.

Prefix abbreviated actions above with `/adapter/orders/:purchaseId`. API requests require `Authorization: Bearer ...` when configured. The owner-only `/api/orders/:purchaseId/download-link` supplies a capability URL; the download requires both its token and a persisted entitlement. Keep capability tokens private.

The evaluator must read provider state separately from target application behavior. All current payment evidence carries simulated provenance. There is no fake PayPal login and no live provider fallback.

## Development

`npm run typecheck`, `npm run build`, and `npm test` run lightweight local checks without calling external APIs. Node's built-in SQLite currently emits an experimental warning.

Changes are published through remote GitHub APIs with granular commits and phase draft PRs. No local Git initialization, commits, or worktrees. Explicit upload allowlists exclude `.env.local`, credentials, databases, dependencies, and private artifacts.

[Plan](PayProbe-Implementation-Gameplan-v2-2026-11-10.md) · [Project state](PROJECT-STATE.md) · [P1 interfaces and handover](docs/handoffs/P1.md)

UI inspiration: [FollowThrough](https://github.com/desanv01/FollowThrough). No branded UI has been implemented before approval. DeepSeek JSON/thinking parameters follow [official JSON guidance](https://api-docs.deepseek.com/guides/json_mode/) and [thinking-mode guidance](https://api-docs.deepseek.com/guides/thinking_mode/).

MIT. See [LICENSE](LICENSE).
