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

Implemented in the recovered continuation; browser acceptance is pending publication.

- `PaperChapter` is a server component with a stable semantic section and exactly one real content surface. Its native paper illustration has a softly irregular outline, curled corner and quiet distant ruled marks. No added client bundle, scroll handler, animation dependency or duplicate content.
- Eight separately replaceable registry slots cover the six always-present home sections and the two conditional event/subscription sections. Alternating left/right trajectories combine perspective, depth, roll and a wind-like change of direction. The sheet approaches, opens into its original reading content, then recedes. The opening is fully readable on initial load.
- Named entry/exit keyframes measure the untransformed parent. Arrival completes at entry 55%; the transform is identity through exit 75%, including the full containment range on tall phone sections. No continual rocking of reading text. Focused controls and direct section anchors receive a steady full-size sheet. Existing calendar/dialog controls remain in the browser top layer.
- Existing studio/window/botanical background elements are removed from Home only. Motes, light, photographs, original section order/words, CTA, progress controls, calendar, quote leaf, kitty discovery and navigation remain. The admired About biography/progress treatment is untouched.
- Existing reduced-effects and OS reduced-motion preferences, unsupported browsers and print get stationary complete content. Shadows are restrained; there are no animated blurs, blanket will-change layers or runtime section measurements.
- Source verification: 100 tests PASS (94 TS + six API/controller tests), TypeScript PASS, CTA-enabled optimized build PASS (47 routes), generated artwork/semantic theme checks PASS, exact-copy/route baseline PASS and diff whitespace check PASS. React review: server composition, direct imports, parallel server fetches and live original client controls are retained. Actual browser motion, responsive/keyboard/theme/secret checks follow deployment; no physical-device performance claim.

## Recovered Iteration A delivery

Vercel independently confirms READY immutable `dpl_moFt4cgfysq4CtFaK2AFDutfEmrL`, https://zack-cook-dvwwq0kot-dove-mack0o-3684.vercel.app/, exact a0b56607ff941dceda34660093e64104194af8c5. Reused rather than redeployed on recovery. Desktop Home has no horizontal overflow. Actual About click/Enter toggles both faces with identical 426.99px square bounds; uncropped doodles are visibly rendered. Safari chrome still requires Zack's device.

Observed configuration issue: this file-upload Preview does not show the CTA even though the existing experimental branch flag is true. Resolve branch-scoped configuration through exact Git publication/deployment without altering production or other sandbox scopes. Full signup acceptance is not claimed yet.

Motion reference: CSSWG Scroll-driven Animations, https://drafts.csswg.org/scroll-animations-1/ (named keyframe ranges and untransformed view-timeline subjects). Implementation choices are design judgments, not a claim of uniform browser/device performance.
