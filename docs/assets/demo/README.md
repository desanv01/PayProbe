# PayProbe presentation captures

These images show the actual implemented PayProbe interface. They are not design mockups. No recoloring, invented output or new model request was used to make them.

| Asset | Source and extraction | Meaning |
|---|---|---|
| [terminal.png](terminal.png) | native-corrected-overview.mp4, frame at 2 seconds | CORRECTED-B, actual terminal ledger; four simulated checks PASS |
| [faulty.png](faulty.png) | native-faulty-overview.mp4, frame at 2 seconds | FAULTY-A, deliberately faulty sample; S3 FAIL |
| [evidence.png](evidence.png) | native-faulty-evidence.mp4, frame at 7 seconds | FAULTY-A, simulated completed capture and two entitlements |
| [deepseek.png](deepseek.png) | native-api.mp4, frame at 13 seconds | Readable inspection of the just-returned real DeepSeek explanation, not raw provider wire output |
| [readiness.png](readiness.png) | Exact copy of initial-wide.png from runtime-check | Actual local browser readiness screen; no model request |
| [browser.png](browser.png) | Exact copy of fixture-results-wide.png from runtime-check | Actual browser/routes/simulator under a disclosed planner client double; PASS/PASS/FAIL/PASS |

Source clips are preserved under [the video's CLI assets](../../../video-production/payprobe-demo/assets/cli), with [native recording provenance](../../../video-production/payprobe-demo/assets/cli/NATIVE-PROVENANCE.json). Their existing actual-pixel crops are retained. Browser checks and their fixture boundary are documented in [the runtime record](../../design/runtime-check/README.md).

All payment observations are simulated. The browser fixture does not establish a fresh browser-to-DeepSeek journey. Native console captures include genuine DeepSeek API use. Faulty and corrected records are separate runs. Visible UUIDs identify synthetic sample runs, not credentials or real customer payments. No private key, database or raw private prompt is included.

Repository structure is inspired by the owner's [FollowThrough README](https://github.com/desanv01/FollowThrough), inspected on 10 November 2026: centered introduction, badges/navigation, terminal hero, feature table, demo gallery, setup, model/execution details, results, architecture, contributions and documentation. Copy describes PayProbe's own implementation and uses its original approved screenshots. FollowThrough screenshots were not copied into this gallery.

The film was made for **PayPal AI Hackathon 2026**. [Watch the approved final video](https://youtu.be/N5HF1Um5x_U). [Music, fonts and narration credits](../../../video-production/payprobe-demo/assets/MEDIA-CREDITS.md) remain with the source.
