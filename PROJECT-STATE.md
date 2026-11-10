# PayProbe project state
Updated: 2026-11-10, Asia/Kuala_Lumpur
Canonical folder: <project-root>

## Current result
All current local non-video implementation, observed bug fixes, packaging and GitHub prerelease work are complete. The CLI, interactive terminal ledger, browser workflow, deterministic simulator, persisted evidence/recovery and real DeepSeek planning/explanation are connected and verified at the documented scope.

Release: https://github.com/desanv01/PayProbe/releases/tag/v0.1.0-simulated
Frozen package source: 32e036d3cae80a915625319140ffdfc01b736e6d (PR #31 merged).
Archive: PayProbe-v0.1.0-simulated-source.zip, 97,697 bytes, 52 public source files plus manifest.
SHA256: 9858c0759b8754272bda7956db96d7d6d88e51869cc5bcb9c487e11127ee84f3.
Release tag points to frozen source; anonymous download matches the accepted archive hash. Final acceptance/status documentation may be newer than this immutable package source.

## Verified scope
- Foundation, runner, AI workflow, production UI and stabilization test groups pass in CI. Local app/test/config source parity checked against published source.
- Real DeepSeek planner passed; reviewed execution completed all four simulated cases with 42 evidence events. Concise explainer repair passed on first real attempt with 9,138 input and 366 output tokens, valid citations for all four cases and no omitted evidence.
- Actual process restart/recovery, reviewed source persistence, redaction, mismatch/missing evidence and duplicate-delivery checks pass. Known observed blocking bugs #10, #21 and #25 are fixed and closed.
- Native terminal selection/filter/evidence/cleanup and browser wide/mobile plan/review/approval/report/export checks pass. Browser fixture used a disclosed AI client double; actual AI was verified separately via CLI.
- Clean remote-source install/build/startup passed. Docker image build, loopback health and SQLite order persistence across restart passed with synthetic credentials; test services were cleaned up.
- Final package independently verified: ZIP CRC/paths/allowlist, sidecar, all 52 hashes and frozen Git blob matches, complete TypeScript inputs, blank credential templates and packaged Markdown links. No further install was needed because dependencies/build inputs were unchanged and the small runtime changes had already been verified.

## Durable constraints
- VIDEO HOLD remains absolute until the user discusses/resumes video after implementation completion. No capture, render, assembly, storyboard work or MajuPilot video inspection. Preserve prior drafts privately. Future intended direction is HyperFrames using MajuPilot as the visual reference and actual PayProbe terminal footage.
- Payments remain simulated. Real PayPal account setup, API integration and sandbox validation are deferred under issue #9. No PayPal calls or credentials requested.
- Runtime AI uses DeepSeek exclusively through the compatible SDK. deepseek-flash is the configured rolling alias for the requested model; immutable model pinning is not claimed.
- No local Git initialization/commits/worktrees. Remote changes use explicit public-file allowlists. Never publish .env.local, keys, databases, private artifacts or internal coordination identifiers.
- Approved UI palette is graphite/amber/ivory/plum. User approved layout/interactions and delegated the palette adjustment.

## What remains separately
Issue #7 remains open for video (held), public live-demo hosting (needs selected host/account/access and persistent storage), and future hackathon submission/readiness. None is claimed complete. A public source prerelease is available; it is not a hosted demo or submitted entry.
No known blocking defect remains in the tested current local workflows. This does not imply universal payment testing or production qualification.

## Run and handover
Node 24.14+ within 24.x: npm ci; npm run build; npm start -- doctor; npm start -- serve. Browser: http://127.0.0.1:4310/demo. Saved terminal report: npm start -- ledger RUN_ID. See README.md and docs/release/SETUP.md for the complete command sequence.
Browser sessions are memory-only and expire on restart; recorded runs persist in SQLite. node:sqlite emits its experimental warning before the TUI opens.
Full phase/task checklist and worker ownership: TASK-BOARD.md. Detailed acceptance: docs/stabilization and docs/design/runtime-check. Package script/deployment templates: docs/release.
Private validation evidence and video drafts remain in ignored local storage; no active validation server remains.
