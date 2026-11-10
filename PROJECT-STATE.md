# PayProbe project state
Updated: 2026-11-10, Asia/Kuala_Lumpur
Canonical folder: the project root

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
- VIDEO PRODUCTION AUTHORIZED: user approved the 170-second MajuPilot-style plan, actual CLI, and standard synthetic English voice for the preview. The complete 170-second HyperFrames preview is live at http://localhost:4390/#project/payprobe-demo; native console recordings show actual CLI execution and a real DeepSeek API request with its full six-second wait and returned response. P6 authored the composition, P4 captured the actual consoles, and P5 completed normal-speed playback to 170/170 with no material defect. Standard Microsoft Zira narration, timed captions and credited music are included. User reviewed the complete Studio preview and approved it; the final 170-second MP4 has been rendered and verified. Prior draft captures are historical and must not substitute for the approved treatment.
- Payments remain simulated. Real PayPal account setup, API integration and sandbox validation are deferred under issue #9. No PayPal calls or credentials requested.
- Runtime AI uses DeepSeek exclusively through the compatible SDK. deepseek-flash is the configured rolling alias for the requested model; immutable model pinning is not claimed.
- No local Git initialization/commits/worktrees. Remote changes use explicit public-file allowlists. Never publish .env.local, keys, databases, private artifacts or internal coordination identifiers.
- Approved UI palette is graphite/amber/ivory/plum. User approved layout/interactions and delegated the palette adjustment.

## What remains separately
Public YouTube upload and actual Devpost submission are complete. The user authorized submission of the disclosed simulation-only prototype, confirmed the required declarations and accepted the final terms. Devpost displayed Project submitted! and lists PayProbe under the PayPal AI Hackathon 2026. Submission: https://devpost.com/software/payprobe-wng98r . Public video: https://youtu.be/N5HF1Um5x_U . See SUBMISSION-RECEIPT.md. Actual PayPal integration remains deferred; organizer eligibility/qualification is not established by the receipt.
Public live-demo hosting remains unprovisioned, with no supplied judge credential/API key. Complete local instructions and the packaged build were supplied instead. Fresh AI use requires the evaluator's own DeepSeek access. Optional hosting and real integration are separate follow-up work.
No known blocking defect remains in the tested current local workflows. This does not imply universal payment testing or production qualification.

## Run and handover
Node 24.14+ within 24.x: npm ci; npm run build; npm start -- doctor; npm start -- serve. Browser: http://127.0.0.1:4310/demo. Saved terminal report: npm start -- ledger RUN_ID. See README.md and docs/release/SETUP.md for the complete command sequence.
Browser sessions are memory-only and expire on restart; recorded runs persist in SQLite. node:sqlite emits its experimental warning before the TUI opens.
Full phase/task checklist and worker ownership: TASK-BOARD.md. Detailed acceptance: docs/stabilization and docs/design/runtime-check. Package script/deployment templates: docs/release.
Private verification artifacts remain excluded from publication.

Video source and referenced assets are published in merged PR #35. User approved the complete preview; final HyperFrames delivery rendering and artifact verification are complete. The Studio server stays running for review. The user has now invoked the Desktop FollowThrough-style repository presentation brief. README/assets, About/topics/homepage and supporting content updates are active under issue #37; runtime/video changes remain outside this task. Use PayPal AI Hackathon 2026 consistently.

Final video: video-production/payprobe-demo/deliverables/PayProbe-Demo-v1.mp4. Verified 170.000 seconds, H.264 1920x1080/30fps/5100 frames, AAC48kHz stereo, full decode PASS, true peak -1.1dBFS. SHA25694af5559e653a112b5b3758baf07f1491286c4f5ff3def66e4bf67e6f2213368. Actual rendered contact sheet and API/export frames inspected. See VIDEO-DELIVERY.md. The master remains local and the approved film is now publicly hosted on YouTube and linked in the submitted entry.
