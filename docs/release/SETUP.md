# Local setup

Status: instructions checked against the integrated command source on 10 November 2026. Payments are deterministic simulations. No PayPal account, credentials, or API access is needed. DeepSeek is the only external runtime API. Main observed a real planner response, a reviewed simulated run with all four checks passing, and the repaired real explainer succeeding with valid references for all four cases and all 42 evidence events supplied. Native terminal/browser checks and a clean install passed locally. Browser fixture checks used an AI client double; those checks do not independently establish a fresh browser-to-DeepSeek journey or hosted availability.

PayProbe is submitted to the **PayPal AI Hackathon 2026**. Watch the [public 2:50 demonstration](https://youtu.be/N5HF1Um5x_U), inspect the [submitted project](https://devpost.com/software/payprobe-wng98r), or follow this guide to run locally. No hosted backend, judge account or API credentials are supplied. Fresh AI requests need your own DeepSeek key/access; no private accepted plan or saved database is shipped. Submission does not establish eligibility or real PayPal integration. See the [judge guide](JUDGE-GUIDE.md) for access choices.

## Local headless setup

Use Node 24.14 or newer within the Node 24 line and npm. Obtain the [public source](https://github.com/desanv01/PayProbe) or the verified [v0.1.0-simulated source archive](https://github.com/desanv01/PayProbe/releases/tag/v0.1.0-simulated). The immutable archive contains the runnable implementation; later documentation and video source are in the repository. From the project root:

```powershell
npm ci
npm run typecheck
npm run build
npm start -- doctor
npm start -- serve
```

`doctor` creates `.env.local` from the blank `.env.example` only if absent. Keep any existing file and key. Edit it locally when needed; never paste its contents into an issue, report, recording, or PR. Existing process environment variables take precedence.

| Variable | Local value / purpose |
| --- | --- |
| `DEEPSEEK_API_KEY` | Private key; needed for AI calls, not simulated payment operations |
| `DEEPSEEK_MODEL` | `deepseek-flash`; rolling alias, currently DeepSeek-V4.1-Flash-1017, not an immutable pin |
| `PAYPROBE_PROVIDER` | `simulated` (only supported current value) |
| `PAYPROBE_HOST` | `127.0.0.1` default |
| `PAYPROBE_PORT` | `4310` default |
| `PAYPROBE_PUBLIC_URL` | `http://127.0.0.1:4310` default; match externally reachable URL if hosted |
| `PAYPROBE_DB_PATH` | `.payprobe/payprobe.sqlite` default; writable persistent directory |
| `PAYPROBE_API_TOKEN` | Optional locally; required beyond loopback; private bearer token |

Leave PayPal fields blank. No `OPENAI_API_KEY` is needed. The `openai` package is transport configured for DeepSeek. `npm run dev -- deepseek-probe` performs a real bounded DeepSeek request and may consume API credit; it is optional, not part of ordinary offline setup.

With the server running, `Invoke-RestMethod http://127.0.0.1:4310/health` should identify the simulated provider and `realPayPalVerified: false`. Health is a process check, not full workflow verification. `doctor` reports credential presence without values. Node's experimental SQLite warning is expected on the current Node 24 runtime.

## Reviewed plan, execution, and reports

Keep `npm start -- serve` running in one terminal. Open a second terminal at the same project root, using the same configuration and SQLite path. The CLI calls the configured HTTP adapter at `PAYPROBE_PUBLIC_URL`; it does not start the server automatically. Use the shipped `examples/download-contract.json` for the corrected digital-download sample.

```powershell
New-Item -ItemType Directory -Force .private/demo | Out-Null
npm start -- plan examples/download-contract.json --out .private/demo/draft-plan.json
# Inspect the exact draft plan and selected scenarios before accepting it:
Get-Content .private/demo/draft-plan.json
npm start -- plan --review .private/demo/draft-plan.json --out .private/demo/reviewed-plan.json
npm start -- run .private/demo/reviewed-plan.json --auto-approve-simulated
```

`plan CONTRACT --out PATH` makes a real bounded DeepSeek request and needs the private API key. `plan --review DRAFT --out REVIEWED` explicitly accepts the inspected draft; it does not ask the model again. Review does not execute payment operations. Generated plans must pass schema and scenario/capability checks; an unreviewed or modified plan cannot be run.

`run REVIEWED --auto-approve-simulated` explicitly authorizes approval of simulated orders only. Without that flag, `run REVIEWED` pauses for simulated approval. The report includes simulator approval information; an approval requires POST, and reading a link does not approve anything. To continue an existing paused/interrupted run with explicit simulated autoapproval, use its recorded ID:

```powershell
# Replace this with the id from the actual run output; do not start a replacement run:
$runId = 'PASTE_ACTUAL_RUN_ID'
npm start -- resume $runId --auto-approve-simulated
npm start -- report $runId --format text
npm start -- report $runId --format json
# Optional real DeepSeek request; reuse a saved explanation when no fresh call is needed:
npm start -- explain $runId --out .private/demo/explanation.json
```

`resume` uses persisted run/order/operation state and does not replan. `report` defaults to text and also supports `--format json`. `run` and `resume` emit JSON reports. Deterministic findings remain separate from the optional AI explanation; an explanation failure does not establish a failed payment check or change its verdict. Both planner and explainer calls may consume API credit; report/review/run/resume do not call DeepSeek.

The integrated `npm start -- ledger RUN_ID` opens the approved read-only terminal ledger for an existing saved run; it does not process payments or call DeepSeek. Use arrow keys or j/k to select, Enter for evidence, `/` to filter, and q to leave. Noninteractive output falls back to plain text. Open `http://127.0.0.1:4310/demo` while the server runs for the browser workflow. Its fixed-target session owns its own runs and does not import a prior CLI run. Browser sessions expire on server restart; saved runs remain in SQLite. The browser does not need the administrative bearer token. These local checks do not prove public hosting access.

Output paths for `plan` and `explain --out` use exclusive creation: choose new filenames for later attempts; existing files are never overwritten. `.private/` is ignored and must remain outside API publication allowlists. Use synthetic sample requirements and inspect artifacts before sharing them. Check `npm start -- COMMAND --help` for the selected integrated revision.

The approved graphite/amber/ivory/plum terminal and browser interfaces are implemented and locally checked. Design preview fixtures are not runtime evidence. The final 170-second film is rendered, verified and publicly published; [delivery and submission status](CHECKLIST.md) distinguishes this from unprovisioned live hosting. Public video visibility and owner-signed-in playback were confirmed; signed-out playback remains unverified.

Stop with Ctrl+C. Keep the SQLite file to preserve state. Do not delete it as a recovery technique or publish it as demonstration evidence. Redaction and report export passed focused local checks; inspect any new export before sharing it.

## Deployment status

No public backend has been provisioned. The local Docker image build, loopback health check and simulated-order persistence across a named-volume restart passed using synthetic credentials, without a DeepSeek key in the container. See [local delivery](LOCAL-DELIVERY.md) for packaging and container commands. These checks establish the rehearsed local container behavior, not hosted availability.

The backend needs one running Node process, writable persistent SQLite storage and backend-only secrets. Fresh AI requests require outbound DeepSeek access. A future public deployment also needs HTTPS, a selected host/budget and an availability/access check; static file hosting alone cannot run this backend.

The browser's fixed-target `/demo` session owns its own plans and runs, has bounded requests and does not require the administrative bearer token. The administrative API token grants mutation access; do not distribute it as a browser login. Demo-session protections and local fixture checks do not establish production multi-user isolation. Hosting, public judge access and real PayPal sandbox integration/validation remain separate deferred work; no paid service or availability commitment is made here.
