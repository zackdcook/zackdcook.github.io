# Public experience — feedback milestone 4

Started 2026-10-11 from local 038d0fa8e651990babca47b464e67930f7319f7a / UI bc7a3cf. All previous history and recovery artifacts remain intact. This is a bounded refinement milestone for Zack's feedback, not final acceptance of the overhaul.

## Evidence and scope

The supplied 34-second recording and three popup screenshots are accessible and were inspected locally. They show strong cursor wash, dark light-mode particles, abrupt section backgrounds, and unsolicited focus rings on initial dialog focus. The recording includes briefly empty content during navigation/scrolling but no explicit application error. The reported occasional crash is not reproduced or diagnosed yet. Do not certify crash resolution merely from source changes.

The homepage animates the same elements whose anonymous view timelines drive their motion. Move those animations to stable parent section timelines; preserve substantial depth, avoid whole-section scale, and preserve the About reading progression Zack explicitly approved. Reduce ambient layer area/blending and inherited style writes. All decorative work should rest under modal dialogs and reduced effects. Keep the supplied bird GIF and its repeat/scale/speed behavior.

Other acceptance points: soften and animate homepage joins; let the three requested titles fit one line on wide screens without shrinking mobile body text; give Settings one consistent control treatment; remove the explicitly rejected Reset Brave discovery control; focus dialog titles deliberately without an unsolicited outline, retain keyboard focus visibility on interactive controls; turn the permanent Brave message and sole Follow him. action into a distinct JRPG dialogue with selected arrow and reduced-motion fallback.

## Research and copy

Reuse the focused W3C / NN/g / Tuch review in PUBLIC_EXPERIENCE_MILESTONE_3.md. Provide concrete hierarchy and wording recommendations to Zack with this milestone. Recommendations are design judgments informed by the research, not proven conversion effects. Keep Greetings, fellow person! as a modest 21–22px welcome below the signup invitation; the name and invitation have stronger emphasis. Retain all authored prose and original routes. No further copy rewrite is authorized or needed in this pass.

## Verification

Implemented and automated checks pass. Browser service responds again, but protected Vercel sign-in first rejected the submitted code, then reported an expired session. A fresh login was opened for manual control. Zack reported cloud-browser input lag and explicitly deferred further sign-in. Respect that decision: no more authentication attempts until requested. No deployment-protection setting has been altered. Actual Preview/device verification remains pending, including the reported crash and deceleration jitter.

| Area | Implemented / automated evidence | Remaining verification |
| --- | --- | --- |
| Shared lighting | Bounded static gradient plane moves by transform; no blend surface or root lighting-property writes; only changed local styles written | Actual pointer/tilt visual refinement |
| Rendering work | Actual controller exercised with 1,000 simulated surfaces: only 26 visible surfaces measured per scroll, zero stationary-event writes, modal work culled to its one fixture surface, idle frames stop and cleanup removes listeners/observers | Real Safari GPU/FPS and crash reproduction |
| Homepage depth | Stable parent section timelines, readable entrance opacity, no whole-shell scale; existing substantial opposing plane movement retained | Momentum/deceleration on physical iPad/iPhone |
| Section transitions | Continuous base background, transparent gradient joins and section-light crossfades; no top border at manuscript transition | Actual appearance across the four themes |
| Motes / underlines | Pale ivory sparkles in light mode; warm dots retained in dark; fewer phone motes; decorative field rests under dialogs; text-action shimmer removed | Visual balance and touch hardware |
| Display titles | Required line breaks become optional at wide sizes; About/Events/Creative Works widths and sizes scoped | Wide desktop and zoom/phone layouts |
| About reading | Biography CSS, paragraph rhythm, progress and scroll choreography left intact; only requested title break changes | Recheck after shared effects change |
| Settings / popups | Rounded consistent appearance/check controls; rejected discovery-reset control removed; quiet shared close icons; neutral initial title focus, visible keyboard cues retained; menu signup no longer autofocuses email/opens mobile keyboard | Actual Tab/Shift-Tab/Escape, pointer and screen-reader flows |
| Brave discovery | Persistent JRPG frame, full original message, sole Follow him. action with selected blinking arrow; animations rest under site/OS reduced motion; no dismissal or returning bird shadows | Click/tap, revisit, reduced effects and navigation in actual Preview |
| Content / isolation | Baseline routes, authored files/JSX, hidden wording, all four themes and eligibility/bypass guards pass existing tests | Full original overhaul inventory remains broader than this milestone |

Final source checks: 94 TypeScript tests and six explicit-TAP API/controller tests pass (100 total); TypeScript and CTA-enabled optimized build pass (47 generated routes); generated artwork/theme checks and git diff --check pass. New dialogue text/selection/focus contrast checks pass. There is no lint script. No database, migration, environment, production configuration or dependency change. The original darker common carving color and rounded-square portrait remain intact. All earlier commits and bundles are preserved.

Concrete editorial recommendations are in TYPOGRAPHY_AND_COPY_RECOMMENDATIONS.md. No optional copy suggestion was applied. The existing RSS/calendar exceptions remain recorded in milestone 3.

Implementation is committed as 29a20c93db592be9380902cd1dbec8e4760ea0bd, following 10bd538 and all preserved milestone-3 commits. Local Git push dry-run failed with “could not read Username … terminal prompts disabled”; no remote ref was written. Last independent remote read still shows experimental 89b13f010c790455cf4c7c6d5178549650caedc1 and main 64ebf8a4773889eb8278901512b30dd9aa34c071.

Vercel file-upload Preview is READY: https://zack-cook-prm77m3yu-dove-mack0o-3684.vercel.app — dpl_F136jvTHhPWd1aPdFh94bFeXLAAJ. Deployment metadata confirms source commit 29a20c93db592be9380902cd1dbec8e4760ea0bd and exact experimental branch; target is null (Preview). The full 278-file manifest comes from that committed tree, with environment templates excluded. Thirty changed source digests were uploaded and unchanged previously uploaded digests reused. No Git source was asserted as published. Existing project, Node 24.x and next-site root were retained; no environment/security/production setting changed, no paid build machine requested, and no alias assigned. Previous previews and stable alias remain intact.

This verifies a successful optimized deployment, not end-to-end browser behavior. Zack explicitly deferred sign-in. No browser screenshot, sensor/FPS certificate or claim that the crash is fixed accompanies this delivery. Full private recovery bundle: website-public-experience-milestone4-recovery.bundle, including final documentation and every ancestor commit; no plaintext reward codes or credentials are included. All earlier bundles and the existing private distribution-code file remain accessible and unchanged.

## Next action

Pause for Zack's feedback on the protected Preview. When he requests login again, use a fresh secure Vercel sign-in and complete actual mobile/tablet/wide-screen, pointer, keyboard, discovery, four-theme and reduced-motion checks. Prioritize reproducing the crash and deceleration jitter. Inspect/stop the existing publishing Codespace before native Git publication; its last state remains unverified and no new Codespace was created. Publish the preserved descendant history only by fast-forward on the experimental branch. Do not update main, change protection, assign an unverified shared alias, reread distribution codes or resume tree/sandbox development. Reuse the research and saved source rather than restarting the audit.
