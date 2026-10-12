# Two-iteration feedback milestone 5

2026-10-11. Base: d646f693180f0a5928dd80999c35c02a66bf4c59 on experiment/immersive-world-2026-10-09. No production, database, credential, protection or dependency changes. Earlier previews/history remain intact.

## Iteration A — requested fixes

- Home artwork may cross section boundaries inside one page-level horizontal clip. Removed independent section color washes and their moving gradients; one quiet continuous canvas remains.
- Ambient light uses centered closest-side radial gradients with transparent perimeter, fixing the nonzero color at its previous rectangular right edge. Motes retained.
- Header controls remain crisp while a separate glass/blur layer fades to transparent at the top. Safari theme-color follows the semantic background through appearance/timeline changes.
- About portrait is a keyboard/touch/click button with two equal square faces. Every activation flips between headshot and uncropped name doodles. Removed the inline hover/modal overlay and its CSS; exact biography words/paragraphs and approved reading/progress animation preserved. Existing accessible doodle label reused; back-face label uses Zack Cook.
- Zero-progress planned revision has no center accent stroke; progress track, selection edges and actual progress rendering stay intact.
- Automated baseline: 100 tests PASS; type checking PASS; CTA-enabled optimized build PASS. Browser sign-off and exact deployment reference will be appended after publication. Physical Safari chrome/tilt still needs Zack's device review.

## Iteration B — paper concept

Implemented in the recovered continuation and exercised in the protected Chromium Preview. Physical-device and clean-console acceptance remain open below.

- `PaperChapter` is a server component with a stable semantic section and exactly one real content surface. Its native paper illustration has a softly irregular outline, curled corner and quiet distant ruled marks. No added client bundle, scroll handler, animation dependency or duplicate content.
- Eight separately replaceable registry slots cover the six always-present home sections and the two conditional event/subscription sections. Alternating left/right trajectories combine perspective, depth, roll and a wind-like change of direction. The sheet approaches, opens into its original reading content, then recedes. The opening is fully readable on initial load.
- Named entry/exit keyframes measure the untransformed parent. Arrival completes at entry 55%; the transform is identity through exit 75%, including the full containment range on tall phone sections. No continual rocking of reading text. Focused controls and direct section anchors receive a steady full-size sheet. Existing calendar/dialog controls remain in the browser top layer.
- Existing studio/window/botanical background elements are removed from Home only. Motes, light, photographs, original section order/words, CTA, progress controls, calendar, quote leaf, kitty discovery and navigation remain. The admired About biography/progress treatment is untouched.
- Existing reduced-effects and OS reduced-motion preferences, unsupported browsers and print get stationary complete content. Shadows are restrained; there are no animated blurs, blanket will-change layers or runtime section measurements.
- Source verification: 100 tests PASS (94 TS + six API/controller tests), TypeScript PASS, CTA-enabled optimized build PASS (47 routes), generated artwork/semantic theme checks PASS, exact-copy/route baseline PASS and diff whitespace check PASS. React review: server composition, direct imports, parallel server fetches and live original client controls are retained. Actual browser motion, responsive/keyboard/theme/secret checks follow deployment; no physical-device performance claim.

## Recovered Iteration A delivery

Vercel independently confirms READY immutable `dpl_moFt4cgfysq4CtFaK2AFDutfEmrL`, https://zack-cook-dvwwq0kot-dove-mack0o-3684.vercel.app/, exact a0b56607ff941dceda34660093e64104194af8c5. Reused rather than redeployed on recovery. Desktop Home has no horizontal overflow. Actual About click/Enter toggles both faces with identical 426.99px square bounds; uncropped doodles are visibly rendered. Safari chrome still requires Zack's device.

Earlier snapshots were taken before preference hydration and temporarily omitted the CTA. This did not establish a configuration problem; later hydrated Git-backed A/B controls are visible and functional. No real email submission was made during this milestone.

Motion reference: CSSWG Scroll-driven Animations, https://drafts.csswg.org/scroll-animations-1/ (named keyframe ranges and untransformed view-timeline subjects). Implementation choices are design judgments, not a claim of uniform browser/device performance.

## Browser acceptance and navigation refinement

Git-backed A is READY at https://zack-cook-7efdku8ep-dove-mack0o-3684.vercel.app/ (dpl_GcNcBe5wD1k2j8GGDBN5x8m2d867), exact a0b5660. Early snapshots omitted the invitation before client preference hydration; its presence is verified after hydration. The original file-preview configuration diagnosis was not established by that early observation.

B source 6b5b4c1 was exercised at https://zack-cook-lh04c9lyd-dove-mack0o-3684.vercel.app/ (dpl_DS7NhA5sqMFmyxVxsyELFX1zVZEb). Active-route scenery correction 29b2946 was verified at https://zack-cook-i0l42suv6-dove-mack0o-3684.vercel.app/ (dpl_CvbPPKULRy8t5DRGWyRsPjUfpimP). Source 2adb464 adds decorative transition pointer pass-through and 5a92393 isolates the persistent header. Final source e3fa3e6 additionally excludes the document root from snapshots and fixes streamed book hydration. Its Preview https://zack-cook-mo9gfql7g-dove-mack0o-3684.vercel.app/ (dpl_afzChy7QG7WzbLKYQuJB4weAFUXR) is READY and passes final optimized browser acceptance; every prior immutable Preview is retained.

| Actual viewport | CTA bottom | Horizontal overflow |
| --- | ---: | --- |
| 1348×936 desktop | 912.03px | None |
| 320×568 | 557.45px | None |
| 375×667 | 598.88px | None |
| 390×844 | 699.75px | None |
| 768×1024 | 862.66px | None |
| 1024×667 | 642.53px | None |

- Real computed animation shows a tilted/depth arrival with intermediate opacity, identity transform/opacity 1 through reading, and a receding distant sheet. A phone section taller than its viewport remains stationary while reading. Reduced effects makes every paper complete and static. Four living/felled light/dark surfaces were exercised through existing UI.
- Calendar and signup menu dialogs, Escape/focus return, leaf Enter/ArrowLeft/Escape, kitty keyboard discovery and original tree entry/reset-control visibility pass. No new carve, personal-limit reset, code redemption or email subscription was submitted.
- Cached Next routes remain hidden in the DOM. The previous page-art :has selector therefore re-enabled the old window on Home after visiting Folly. The existing header now exposes its active normalized route, and scenery uses that explicit route. Actual Folly → Home test shows retained hidden Folly, Home route / and scenery none.
- A fast return click was swallowed by document-wide snapshot hit testing. Pointer pass-through alone was insufficient. The document root now has view-transition-name:none and the persistent header uses ViewTransition default=none; the page sheet retains its named animation. Real rapid mouse return now passes in private development diagnostics. Reference: CSSWG rendering/hit-testing semantics and the original implementation guidance from Chrome DevRel, https://www.bram.us/2025/01/29/view-transitions-page-interactivity/. Final optimized regression PASS: rapid Folly → Home mouse return works, with the active route / and old scenery none.
- Hydration diagnosis: a precise development diff identified BookMenuItem becoming enabled before its streamed header hydrated, because the parent preference effect had already mounted. Shared useBookLaunch now gates each consumer with use-client-ready.ts; React reads its false server snapshot during hydration, then the true client snapshot afterward. HomepageBookCTA uses that same gate. PointerLight also stopped unused DOM classification attributes and eager inline zero styles before hydration. Fresh default, persisted dark/reduced-effects and dismissed-invitation loads show no application errors/warnings in development. No suppression or framework upgrade. Reference: https://react.dev/reference/react/useSyncExternalStore#adding-support-for-server-rendering. Final optimized Preview confirmation PASS on default and saved dark/reduced-effects hard loads, and the 390×844 viewport frame: no application errors or warnings. Browser-extension metadata errors are separate from application diagnostics. Physical Safari, touch/tilt, GPU/FPS and prior crash/deceleration acceptance remain open.

Exact source history is published on experiment/immersive-world-2026-10-09 through e3fa3e6, without rewriting descendants. Main remains 64ebf8a. Prior unique previews remain available. The branch shortcut is preserved at dpl_CviyK3XWLsh7UhZxcgsx1FqXQh6j after automatic Git deployment attachment. No production/database/security/secret/dependency/plan change; private Legendary files remain untouched.

Final source checks PASS: 101 automated tests (95 TS + six API/controller tests), TypeScript, optimized CTA-enabled 47-route build, generated art/theme, exact-copy/route baseline and whitespace. Added regression coverage for delayed book consumers and untouched streamed surface attributes/styles. Diagnostics ran in a separate detached worktree with private forwarding and no copied credentials. No new carve/reset/redemption/email submission. Final phone frame remains 375px client/scroll width inside 390×844, CTA bottom 699.75px. Phone Menu → Book Alert opens the original dialog; Escape returns focus to Menu with both dialogs closed. Desktop Book Alert and Add to calendar similarly open by Enter and restore their respective opener on Escape. The private diagnostic server was stopped after acceptance; stop the existing Codespace immediately after publishing this documentation descendant and verify stopped state before delivery.

Final delivery: exact application e3fa3e66812a9639ad8035ad5a0a73b376166b72; READY dpl_afzChy7QG7WzbLKYQuJB4weAFUXR; https://zack-cook-mo9gfql7g-dove-mack0o-3684.vercel.app/. Preserved A is READY dpl_GcNcBe5wD1k2j8GGDBN5x8m2d867 at https://zack-cook-7efdku8ep-dove-mack0o-3684.vercel.app/. Independent alias read after final build confirms the original dpl_CviyK3XWLsh7UhZxcgsx1FqXQh6j target. No overall-overhaul, physical-device or GPU/FPS completion claim. Next work is Zack's visual review and physical crash/scroll/tilt acceptance; tree and separate-chat integrations remain deferred.
