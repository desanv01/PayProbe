# Contributions and credits

PayProbe is a solo project by **desan vasu (DV / [desanv01](https://github.com/desanv01))**, submitted to the **PayPal AI Hackathon 2026**. The creator directed the product and scope, reviewed and approved the interface and video, supplied the private DeepSeek access used for verification, and authorized publication and submission. Codex assistance does not represent additional human team members.

## AI assistance and runtime AI

Codex assisted with planning, implementation, interface development, debugging, test/check preparation, documentation, packaging and video production under the creator's direction. Generated work was integrated and checked against recorded behavior. This is an AI-assisted build, not a claim of wholly unaided authorship.

The shipped application's external AI dependency is **DeepSeek**, used for bounded scenario planning and optional evidence-referenced explanations. It uses the rolling `deepseek-flash` alias through the `openai` npm transport explicitly configured for DeepSeek. There is no OpenAI runtime key requirement or fallback provider. Deterministic code assigns scenario verdicts; AI explanations do not create payment evidence or override those verdicts.

Actual CLI planner/explainer calls were verified. Browser fixture checks used a disclosed AI client double. Neither development assistance nor recorded AI output is evidence of real PayPal integration: all current payments are simulated.

## Interface and presentation references

- **[FollowThrough](https://github.com/desanv01/FollowThrough):** reference for PayProbe's interface direction and repository presentation. The approved PayProbe terminal/browser treatment uses graphite, amber, ivory and plum. This credits design inspiration; it is not a blanket claim that FollowThrough code or assets were copied or that its contributors built PayProbe.
- **MajuPilot:** the creator's existing production was the reference for the demonstration's warm paper/navy/teal editorial framing. The film shows the actual PayProbe terminal. Reference-production music and font assets were reused with the notices below; this does not imply reuse of MajuPilot's application code or endorsement by third parties.
- **HyperFrames:** used to author and render the approved 170-second composition. See [the composition source](../../video-production/payprobe-demo/index.html) and [delivery receipt](../../video-production/payprobe-demo/deliverables/DELIVERY-RECEIPT.md).

## Media and software notices

The authoritative asset details and changes are in [media credits](../../video-production/payprobe-demo/assets/MEDIA-CREDITS.md). Retain those credits when redistributing the film.

| Material | Credit and terms |
| --- | --- |
| Music | “New Direction” by Kevin MacLeod (incompetech.com), ISRC USUAN1100677; [original source](https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1100677), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Used as a 170-second excerpt with narration carve/EQ, gain ducking and fades; no endorsement implied. |
| Narration | Standard Microsoft Zira Desktop synthetic English voice, generated locally from the PayProbe script; no voice cloning. |
| Fonts | EB Garamond, Inter and JetBrains Mono, SIL Open Font License 1.1; unmodified local WOFF2 assets with notices in the video font directory. |
| Animation dependency | GSAP vendor banner and license notice retained with the video source. |
| Product footage | Actual PayProbe CLI recordings and explicitly identified saved/replayed session material. Faulty/corrected examples are controlled fixtures; simulated payments remain disclosed. Private raw captures, credentials and databases are excluded from publication. |

PayProbe source is available under the root [MIT license](../../LICENSE), copyright 2026 desan vasu. Runtime/build dependencies retain their respective licenses; installing the `openai` package supplies transport compatibility, not an OpenAI runtime service. Third-party notices continue to govern the corresponding media and dependencies.

## Published result and remaining scope

The [submitted project](https://devpost.com/software/payprobe-wng98r), [public demonstration](https://youtu.be/N5HF1Um5x_U) and [simulated source prerelease](https://github.com/desanv01/PayProbe/releases/tag/v0.1.0-simulated) document the delivered prototype. Real PayPal sandbox integration/validation and optional public hosting remain deferred. A submission receipt establishes submission, not event eligibility or judging acceptance. See [judge access](JUDGE-GUIDE.md) for local setup and the requirement to use your own DeepSeek key for fresh AI calls.
