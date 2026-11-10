# PayProbe video preview acceptance

Date: 2026-11-10. **Preview verification complete; no material blocker found in the final reviewed preview. USER PREVIEW APPROVED:** main relayed the user's “looks good” approval of the complete preview. P6 rendered that approved source; P5's bounded rendered-frame check also passed. No final render or new model/payment request was performed by P5.

## Actual checks

- Canonical project: `video-production/payprobe-demo`, HyperFrames0.9.28. Root metadata/timeline:170 seconds,1920×1080,30fps target, nine scenes,12video segments, nine narration clips and music; no unresolved media. Frame rate is the authored target, not an assertion about an unrendered master.
- Played the actual Studio project at `http://localhost:4390/#project/payprobe-demo` from0 through170 seconds at confirmed1×, loop off, without seeking or pausing. Observed monotonic playhead progression through23/52/71/99/128/150/159 seconds, then02:50/02:50 with Play restored and closing frame still visible.
- Inspected P6's final nine-scene midpoint contact sheet; inspected boundary14s and plan31s at full frame, plus actual running preview frames for opening, execute, faulty/corrected evidence, recovery, returned API output and closing. Captured/inspected one assembled export frame at153.8s to verify the short export cut. No blank/stale replay interval remains in these reviewed shots.
- Final P6 `check-native.json` reports `ok:true`; P5 did not rerun a broad suite. Caption timing recheck has zero nonpositive intervals and no wordmarks after their processed voice clip. Visible captions show one phrase at a time below the terminal.
- Preview audio was unmuted at100% throughout. P6's automated check reports no audio errors. **Subjective narration/music balance and sound quality remain for the user's listening review**; screen/control observations are not an independent listening verdict.
- No keys, tokens or personal paths were seen in reviewed frames. Synthetic fixture identifiers are intentionally visible in direct-native shots under main's scope clarification; those shots do not claim masking. This is a bounded visual review, not an exhaustive frame-by-frame secret scan.

## Scene findings and provenance

| Time | Actual reviewed content / result |
| --- | --- |
| 0–8s | Editorial serif opening, product/thesis/creator; persistent simulated-payment label. |
| 8–20s | Readable payment-to-delivery diagram; DeepSeek planning/explanation separated from deterministic verdicts. |
| 20–42s | Actual generated plan and explicit review; honestly labelled faithful native-PTY session replay. Pager holds are trimmed; initial planner wait retained. |
| 42–62s | Direct-native console shows approval pending and resume; EXECUTION-C is explicitly a separate capture take. Same-run continuity refers to thatC execution. The previously blank52s moment is fixed. |
| 62–90s | Direct-native FAULTY-A: S3 FAIL, completed provider capture1, entitlement2 versus expected1. No stale PASS detail in reviewed shots. |
| 90–112s | Separate CORRECTED-B: three sequential process calls preserve entitlement1/S3 PASS. Its recorded42-event source is distinct from FAULTY-A. |
| 112–138s | Recorded S4/B events36suppression,37uncertain/0,38provider completed capture,39reconciliation/1 and42download; no fabricated interactive Reconcile screen. |
| 138–156s | Continuous direct-native explanation request/wait/returned-response shot, then actual exported JSON. Full source13.5–28.5s is retained for the15sAPI beat, followed by native-export4–7s for3s. Assembled153.8s frame is nonblank and readable. |
| 156–170s | Qualified local proof, correct repository/prerelease text, real PayPal deferred, music/synthetic-voice credit, intact closing hold. |

The final direct API packet reports three fresh production AI calls total: one planner and two explanation calls. P5 made none. The current direct-native explanation has a six-second request wait and one-attempt6918-token metadata; visible references are S1 sequences4/8, S2 13/14, S3 19/20, S4 25/28. These are distinct from the earlier PTY take's timing/citations. Native readback is labelled inspection of the just-returned response.

P5 independently checked that the current faulty report and exported report share the same run identity,31evidence events and PASS/PASS/FAIL/PASS cases; the earlier30-event note is superseded. Actual selected-field projections are labelled as such. Reuse of corrected evidence is disclosed and never represented as a new API request.

## Defect closure and handoff

- V1 caption word/WAV timing and negative intervals: fixed and statically rechecked; visible caption progression reviewed.
- V2 caption overprint and V3 opening sans font: fixed; final midpoint frames and actual playback reviewed.
- V4 wrapped synthetic ID: not a secret/security blocker; final native shots accurately allow visible fixture IDs rather than claim masking.
- V5 blank export and V6 blank execute, plus stale optimized-terminal redraw: replaced by actual native pixels; source frames and assembled export/execute views verified.

## Rendered critical-frame check

P5 inspected only P6's actual master-extracted frames at150s and153.8s: **PASS**, no privacy/provenance defect observed. The API frame retains the actual returned response, matching evidence references and explicit simulated-payment/deterministic-verdict labels. The export frame is nonblank and readable, with31events, PASS/PASS/FAIL/PASS, simulated provider and realPayPalVerified:false; it explicitly states export did not call AI or rerun payments. No keys, tokens or personal paths appear in these two frames.

Artifact identification from P6's verification record: `PayProbe-Demo-v1.mp4`, SHA256 `94af5559e653a112b5b3758baf07f1491286c4f5ff3def66e4bf67e6f2213368`. P6 owns the full decode/metadata/audio/contact-sheet verification; P5 did not duplicate it. Main owns GitHub and final handoff. No composition edits or further API calls were needed. Payments remain simulated; this video does not establish PayPal verification or submission readiness.
