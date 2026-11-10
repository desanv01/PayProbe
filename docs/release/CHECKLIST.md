# Release checklist — simulated-payment implementation

Prepared 10 November 2026. Documentation preparation can finish now; release, recording, hosting, and submission gates remain open. Do not close P6 issue #7 from this draft alone.

## Prepared

- [x] Source-based local setup and secret handling instructions.
- [x] Proposed README and public contribution/limitation wording.
- [x] Sub-three-minute storyboard with explicit simulated provenance.
- [x] Submission draft without eligibility or completion claims.
- [x] Persistent Node/SQLite hosting options researched; no provisioning.

## Before freezing a demonstration

Current evidence update: main observed a real planner response and a reviewed simulated CLI run with all four cases PASS / 42 evidence events. The repaired real explainer succeeded first attempt (9,138 prompt + 366 completion tokens), with valid references for all four cases and all 42 evidence events supplied. P6 independently checked the existing reviewed plan against the persisted report and the saved explanation's eight citations, without another model request. A private allowlisted local source ZIP passed all file-hash checks. Docker image build, loopback health and simulated-order persistence across restart passed; Compose configuration validates. No real key was passed to the container and no image was uploaded. Main reports P4/P5 local UI checks and clean-install checks complete; final release source/artifact references and actual video review are still separate gates. Main restored the root MIT LICENSE locally. These facts do not close the combined gates below.

- [ ] Main integrates phase dependencies and records exact remote source SHA.
- [x] P4 mockups explicitly approved; local native/browser screens checked against approval.
- [x] P1–P4 connected local workflow works, including a real CLI DeepSeek plan and evidence-referenced explanation; browser fixture checks use a client double.
- [x] Targeted P5 findings resolved or disclosed; all four simulated scenarios use actual observations.
- [x] Seeded/corrected runs, suppressed-response firing, verdict distinctions and resume checked in the local acceptance records.
- [x] Clean install/setup rehearsed on published source; commands updated.
- [ ] Final ZIP matches every allowlisted file at the frozen remote revision, includes working local documentation links, and passes P5 artifact review.
- [ ] Root README integrated by main; root LICENSE present in packaged source; credits/source reuse checked.
- [ ] Sanitized export/screen contents checked; no database, secrets, private artifacts, or raw prompts published.

## Before recording or public judge access

VIDEO HOLD: capture, rendering, assembly, storyboard work and reference-project inspection are paused until the user resumes them. Existing drafts remain private. No entry below authorizes video work. Hosting remains unprovisioned.

- [ ] User-approved interface functioning; storyboard beats checked against actual behavior.
- [ ] Host/budget chosen by user; persistent storage and restart recovery verified.
- [ ] Secrets stay backend-only; access flow avoids distributing a shared administrative bearer token.
- [ ] Public access and availability checked for required judging period; record actual URL and check time.
- [ ] Record real run below three minutes with persistent simulation disclosure; verify playback and duration.
- [ ] Verify repository/video/demo links in a signed-out context and document any required access.

## Local simulated GitHub prerelease

This prerelease packages the locally implemented simulation-only product. Main is authorized to publish the verified source ZIP/checksum through GitHub. Held video, public hosting and real PayPal validation do not gate this explicitly simulated prerelease.

- [x] Local implementation/CLI/UI and focused acceptance checks recorded; payment provenance remains simulated.
- [x] Concrete package script, deployment templates and local Docker build/health/restart checks prepared.
- [ ] Main merges the owned delivery PR and selects the final source revision.
- [ ] Final ZIP/sidecar/per-file hashes, complete public source input set and packaged Markdown links pass remote-match and P5 artifact review.
- [ ] Main publishes a GitHub prerelease explicitly labeled simulated, attaches the verified ZIP/checksum, and verifies its source/assets/access.
- [ ] Release notes clearly keep video, hosted access, real provider verification and hackathon eligibility/submission pending.

## Deferred hackathon submission / real-provider qualification

- [ ] Separate real PayPal sandbox integration and validation completed when authorized, or explicit scope mismatch resolved with user before any submission decision.
- [ ] Current official rules/deadline/eligibility and contribution disclosures checked; simulation never represented as live provider verification.
- [ ] User authorizes actual hackathon submission or later real-provider release; the current local simulated GitHub prerelease is separate.
- [ ] Actual submission receipt/completion independently observed before claiming submitted.
- [ ] Release notes tie source SHA, supported behavior, checks, limitations, access instructions, and recorded artifact together.

Release evidence record to fill: source SHA; phase PRs; actual check commands/results; simulated run IDs/evidence references; known issue IDs; UI approval reference; measured video duration/link; hosted URL/access check time; submission receipt if authorized and completed. Preserve simulated versus real API provenance for each item.
