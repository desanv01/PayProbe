# Local setup and proposed hosting

Status: instructions checked against the integrated command source on 10 November 2026. Payments are deterministic simulations. No PayPal account, credentials, or API access is needed. DeepSeek is the only external runtime API. Main observed a real planner response, a reviewed simulated run with all four checks passing, and the repaired real explainer succeeding with valid references for all four cases and all 42 evidence events supplied. Native terminal/browser checks and a clean install passed locally. Browser fixture checks used an AI client double; those checks do not independently establish a fresh browser-to-DeepSeek journey or hosted availability.

## Local headless setup

Use Node 24.14 or newer within the Node 24 line and npm. Obtain a checkout of the implementation revision selected by the orchestrator; the default branch may lag phase branches. From the project root:

```powershell
npm ci
npm run typecheck
npm run build
npm run dev -- doctor
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

UI layout/interactions are approved with a graphite/amber/ivory/plum palette adjustment, implemented and locally checked. Design preview fixtures are not runtime evidence. There is no public judge URL. Video work is on hold; these setup instructions do not authorize capture or production work.

Stop with Ctrl+C. Keep the SQLite file to preserve state. Do not delete it as a recovery technique or publish it as demonstration evidence. Redacted report export must be checked separately.

## Hosting proposal — no service provisioned

For the concrete local source ZIP script, Dockerfile/build-context exclusions, and persistent-volume Compose rehearsal, see [local delivery](LOCAL-DELIVERY.md). These files do not provision a public service or establish completed container/runtime acceptance.

The current architecture needs one continuously available Node process, a writable persistent SQLite directory, backend-only secrets, HTTPS, and outbound access to DeepSeek. Static hosting alone does not provide this backend.

| Option | Practical fit | Setup to resolve before provisioning |
| --- | --- | --- |
| Render paid web service + persistent disk | Simplest proposed managed option; one service instance | Pin Node 24; build with `npm ci` then `npm run build`; start `npm start -- serve`; mount `/var/data`; use DB path `/var/data/payprobe.sqlite` |
| Fly.io Machine + volume | Alternative if the owner already uses Fly | Package Node 24; run exactly one Machine/process with a volume mounted at `/data`; use `/data/payprobe.sqlite`; configure HTTPS routing and secrets |

Render disks require a paid service and preserve only the mounted path; disk-backed services have single-instance constraints. [Render disks](https://render.com/docs/disks). Render requires public services to bind `0.0.0.0` and defaults to port 10000. [Render web services](https://render.com/docs/web-services).

For Render, explicitly set `PAYPROBE_HOST=0.0.0.0`, `PAYPROBE_PORT=10000`, `PAYPROBE_PUBLIC_URL` to the assigned HTTPS origin, `PAYPROBE_DB_PATH=/var/data/payprobe.sqlite`, and `PAYPROBE_PROVIDER=simulated`. The app reads `PAYPROBE_PORT`, not generic `PORT`. Put the DeepSeek key and a strong API token in the host's private environment settings, never source or build output. Use `/health` for the liveness probe. Disable automatic production releases while phase branches are being integrated.

Fly volumes attach to individual Machines and are not automatically replicated; a single Machine is a simplicity tradeoff with downtime/data-loss risk, not high availability. [Fly volumes](https://docs.fly.io/volumes/overview). Fly injects stored secrets at runtime. [Fly secrets](https://docs.fly.io/apps/secrets).

Before any judge access: select a verified integrated commit, obtain host/budget approval, verify persistence across restart, keep secrets server-side, and define an approved access flow. Current bearer authentication protects all non-health routes, including simulator controls; sharing the backend token grants mutation access. An unrestricted public shared backend is not a finished multi-user judge experience. P4/main must resolve the actual access boundary before publishing instructions or recording. No paid service, deployment, or availability claim is made here.
