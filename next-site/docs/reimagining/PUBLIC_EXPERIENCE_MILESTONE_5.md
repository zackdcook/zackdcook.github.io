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

Not implemented yet. Publish and preserve A first. Then replace decorative home studio graphics with modular papers, one for each actual section, using bounded parallax/depth and a continuous transition into the reading surface. Preserve authored text, opening CTA, photos, motes, navigation, game discovery and reduced-effects readability. No scroll trapping or duplicate content. Record implementation/verification before claiming completion.
