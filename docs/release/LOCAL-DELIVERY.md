# Local package and deployment rehearsal

Payments are simulated. No public host has been provisioned. Local runtime UI and clean-install checks passed at their recorded source revisions; final package integrity is checked separately against main's frozen source. Video work is on hold and is outside these packaging instructions.

## Build the private source package

From the canonical project root, pass main's selected 40-character integrated SHA:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File docs/release/package-local.ps1 -Revision ACTUAL_40_CHARACTER_SHA
# Final package only after publication/source freeze; requires authorized GitHub CLI access:
powershell -NoProfile -ExecutionPolicy Bypass -File docs/release/package-local.ps1 -Revision ACTUAL_40_CHARACTER_SHA -VerifyRemote
```

The process-scoped execution-policy flag allows this selected local script to run without changing machine policy. The script writes a uniquely named ZIP and SHA256 sidecar under ignored `.private/release/`. It selects only named root metadata, the sample contract, selected delivery docs/templates (including this script and the checklist), and `.ts` files under `src/` and `tests/`. It rejects linked inputs and nonblank `.env.example` values, checks for files changing during packaging, checks that every relative Markdown link resolves within the package, and includes per-file hashes in `PACKAGE-MANIFEST.json`. No workspace-wide archive, `.env.local`, node_modules, dist, database, private run/AI artifact, design preview, credential, or recording is included.

Without `-VerifyRemote`, the source revision is an operator-supplied hint and `revisionVerifiedAgainstRemote` remains false. With it, the script reads the selected GitHub commit/tree and requires every packaged file's Git blob hash to match; it also refuses missing published TypeScript source. Only that successful comparison sets `revisionVerifiedAgainstRemote` true and status `remote-matched-source-package`. This does not verify the entire repository or replace runtime acceptance. No local Git initialization/commits are used. Wait for main's integrated source freeze before producing the final package.

Extract to a new empty private rehearsal directory when main/P5 is ready. Use Node 24.14+ within the 24 line, then `npm ci`, `npm run build`, `npm start -- doctor`, and `npm start -- serve`. Installation needs access to the npm registry. The blank environment template gives simulated payment defaults; offline payment operations need no API key. AI planning/explanation requires a private DeepSeek key, so avoid extra AI calls during packaging rehearsal. See SETUP for the reviewed workflow. Keep private DB/run artifacts separate from a public deliverable.

## Concrete local container files

`deploy/Dockerfile` builds TypeScript with Node 24.14.1, installs production dependencies in the final image, runs as the `node` user, and copies only explicit public source/package paths. Its Dockerfile-specific `Dockerfile.dockerignore` also denies the rest of the workspace as build context, keeping private files away from the build daemon. It never copies `.env.local` or the workspace root wholesale. `deploy/compose.yaml` binds port 4310 to localhost, supplies runtime environment variables, and mounts one named data volume at `/data`. Container building needs the Node base image and npm registry. P1 confirms browser assets compile from `src/web/page.ts`, with no separate static asset copy needed.

Actual local verification on 10 November: image build succeeded; loopback `/health` identified the simulated provider; an actual simulated order remained present with the same identity and awaiting-approval state after container restart on a named SQLite volume. Rehearsal used a synthetic API token, no DeepSeek key, and no PayPal calls. Verified no `.env.local` or DeepSeek key in that runtime. The temporary container and its task-owned volume were removed afterward. Compose configuration separately passed `config --quiet`. This establishes local build/start/persistence behavior, not hosted access or comprehensive container security qualification.

For a later local rehearsal, create a private `.private/release/container.env` using `deploy/env.example`, set a strong API token, and supply a DeepSeek key only if the rehearsal needs AI. Preserve the user's existing `.env.local` and do not display either private file:

```powershell
docker compose --env-file .private/release/container.env -f docs/release/deploy/compose.yaml config --quiet
docker compose --env-file .private/release/container.env -f docs/release/deploy/compose.yaml build
docker compose --env-file .private/release/container.env -f docs/release/deploy/compose.yaml up -d
Invoke-RestMethod http://127.0.0.1:4310/health
# Browser entry is /demo; fixed-target session access does not use the admin token.
docker compose --env-file .private/release/container.env -f docs/release/deploy/compose.yaml stop
```

Use `config --quiet`; plain `config` can print interpolated secrets. Stopping preserves the named SQLite volume. Do not use `down --volumes` as recovery. The image runs the server; a CLI needing its persisted DB must run in that same container/configuration, not against a separate host SQLite file. For example, `docker compose --env-file .private/release/container.env -f docs/release/deploy/compose.yaml exec payprobe node dist/cli/index.js report ACTUAL_RUN_ID --format text` does not call DeepSeek.

The private admin bearer token is not a general public browser credential. The locally checked `/demo` surface is fixed-target and session-owned; admin routes remain protected. Sessions are in memory and expire on restart, while underlying runs remain in SQLite. No arbitrary target input or public exposure is added by these templates. See Docker's documentation for [Dockerfile-specific context exclusions](https://docs.docker.com/build/concepts/context/#dockerignore-files) and [Compose environment interpolation](https://docs.docker.com/compose/how-tos/environment-variables/variable-interpolation/).

## Remaining external access for a public demo

Local installation and the downloadable source package need no hosting account. Installation needs the npm registry; optional container builds also need the Node image registry. Runtime AI needs the existing DeepSeek API access and key in private configuration; no PayPal account is needed.

To make `/demo` publicly reachable later, the owner must choose a host and provide deployment permission to a project/account with one Node 24 process, a writable persistent disk, HTTPS routing, and backend-secret configuration. The proposed Render persistent-disk option requires a paid service/billing decision. Reuse the existing DeepSeek key only through the host's secret settings; never put it in the package or browser. Supply a private admin token and set the externally assigned origin/port explicitly. An assigned service subdomain is sufficient; no domain purchase is required. Confirm restart persistence and judge access on that actual host before claiming availability.

No account signup, billing action, paid hosting, public deployment, video upload or submission is performed or requested by these files. There is no external access blocker to the local deliverable. Host selection/access remains the concrete dependency for a future public demo; video stays on hold and its destination is not being selected now.
