# PayProbe judge guide

PayProbe is a locally runnable payment-boundary testing prototype. Payments are deterministic simulations; no PayPal account, credentials or API calls are involved. DeepSeek provides real AI planning and optional explanation. There is no hosted demo, supplied API key or judge account.

## Choose an access route

- **Watch:** [the public 2:50 demonstration](https://youtu.be/N5HF1Um5x_U). A recording does not provide live app access.
- **Inspect or run:** use the [public repository](https://github.com/desanv01/PayProbe) or [verified simulated prerelease](https://github.com/desanv01/PayProbe/releases/tag/v0.1.0-simulated). The immutable prerelease archive predates the final video and these updated delivery notes; the repository contains newer documentation/video source.
- **Run fresh AI workflows:** supply your own DeepSeek API key with API access and balance. No credentials or private saved runs are shipped. Never send your key to the project owner or place it in a public report.

## Local startup

Install Node 24.14 or newer within Node 24 and npm. In the extracted source/repository root:

```powershell
npm ci
npm run build
npm start -- doctor
```

`doctor` creates `.env.local` only if absent and reports credential presence without values. To use AI, edit that local file and set `DEEPSEEK_API_KEY` to your own key. Preserve existing content. The defaults are `DEEPSEEK_MODEL=deepseek-flash` and `PAYPROBE_PROVIDER=simulated` when unset; no OpenAI or PayPal key is needed. Process environment variables override the file. The model name is a rolling alias, not an immutable version pin.

Start the backend and keep this terminal open:

```powershell
npm start -- serve
```

Open [the local browser workflow](http://127.0.0.1:4310/demo) on the same computer. The default server binds only to loopback. Follow the plan, review, simulated approval and report flow. Browser sessions expire when the server restarts; saved runs remain in SQLite. Node's experimental SQLite warning is expected.

## CLI demonstration

Keep the backend running. In a second terminal at the same project root and configuration:

```powershell
New-Item -ItemType Directory -Force .private/demo | Out-Null
npm start -- plan examples/download-contract.json --out .private/demo/draft-plan.json
Get-Content .private/demo/draft-plan.json
# Accept only after inspecting the exact draft:
npm start -- plan --review .private/demo/draft-plan.json --out .private/demo/reviewed-plan.json
npm start -- run .private/demo/reviewed-plan.json --auto-approve-simulated
```

The first `plan` command makes a real DeepSeek request and can consume API credit. Review and execution do not call AI. The approval flag authorizes simulated orders only. Without it, execution pauses for simulated approval. The CLI does not start the backend automatically.

Use the actual run ID returned by execution:

```powershell
$runId = 'PASTE_ACTUAL_RUN_ID'
npm start -- report $runId --format text
npm start -- ledger $runId
# Optional fresh, billable DeepSeek explanation:
npm start -- explain $runId --out .private/demo/explanation.json
# Continue a paused/interrupted run rather than creating a replacement:
npm start -- resume $runId --auto-approve-simulated
```

Reports and ledger inspection need no new AI request. Plan/explanation output paths cannot overwrite existing files; choose new filenames for another attempt. The terminal ledger supports arrow keys or j/k, Enter for evidence, `/` to filter and q to leave.

## Inspection without an API key

After dependency installation, the shipped deterministic test suites use local fixtures/client doubles and need no API key:

```powershell
npm test
npm run test:runner
npm run test:workflow
```

These establish local test behavior, not a fresh external AI response. A fresh end-to-end plan/explain journey requires your own key; the source package does not include a private accepted plan/database to bypass that requirement.

## What to evaluate

Look for approval without fulfillment, matching capture with one entitlement, repeat processing without duplicate delivery, and recovery after a suppressed capture response. The deliberately faulty store fixture demonstrates duplicate delivery; the corrected fixture passes. Provider observations come from a separate simulated ledger path, not a real payment provider. Current scope is the controlled sample, USD single full capture and sequential repeats; refunds, subscriptions, webhooks and production qualification are outside this demonstration.

See [detailed setup](SETUP.md) for configuration and command behavior. Historical video-hold language there predates the approved completed film; [the current checklist](CHECKLIST.md) records delivery/submission status. Public hosting and real PayPal sandbox validation remain deferred.
