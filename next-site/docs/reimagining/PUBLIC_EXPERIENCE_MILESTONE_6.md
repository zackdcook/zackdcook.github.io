# Public experience milestone 6 — falling-paper feedback

Date: 2026-10-11. Branch: `experiment/immersive-world-2026-10-09`. Continue `936cf1c` / application `e3fa3e6`; preserve all earlier work.

## Result

The rejected enclosing paper-card composition is replaced by loose, curved decorative sheets that fall down the viewport as native page scrolling advances. Each sheet flexes through matching Bézier shapes and flutters sideways, rolls, changes foreshortening and varies scale. Original content remains in normal document flow and moves gently on the prior chapter plane; the main name recedes and the Folly leaf drifts independently. Motes stay. There is no continuous animation timer or new client script for these papers.

The Home opening is left aligned. Four specified feature headings use the existing Home Swampass title's exact responsive family, weight, size, line-height and letter spacing. The main Zack Cook. title retains its own treatment. The writing-group selector is restricted to its authored title, preserving the calendar dialog typography. Optional upcoming-event/subscription callouts retain shell gutters.

The supplied Safari recording shows letter fragments behind the masked transparent header top. The header backdrop now starts opaque and gradually becomes glass lower down, with content above that paint layer. The installed Next 16 guide also requires an explicit `data-scroll-behavior="smooth"` declaration to override smooth scrolling when restoring routes; it is now present.

The progress dial has no permanent center or ornamental circular outline. Graduation marks, tracks, progress arcs, hit areas, current selection/hover outlines, percentages and original stage text remain.

## Source

- `components/paper-chapter.tsx`: server component, one decorative SVG per existing modular paper slot, stable content wrapper.
- `components/paper-chapter.module.css`: view timeline fall, independent flutter/depth, animated SVG curvature, static unsupported-browser silhouette, reduced-effects/motion/print fallbacks.
- `app/home.module.css`: shared Home feature typography; original spacing, chapter rise and leaf drift.
- `components/field-journal-hero*`: left-aligned opening and restored name recede; old unused desk/window planes removed.
- `components/site-header.module.css`: solid top-edge backdrop.
- `components/progress-rings*`: permanent circle strokes removed.
- `app/page.tsx`, `app/layout.tsx`: original sections/copy, conditional gutters, Next scroll declaration.
- `DEPLOYMENT_STORAGE_REVIEW.md`: observed account usage and exact proposed eight-preview cleanup.

No package change, database migration, new website copy, secret, plaintext code, canonical carving mutation or production change.

## Verified privately

- ScrollY 0 → 515: opening section top 87 → -428, its paper y 444.58 → 937.52 (down); project paper y -118.25 → 192.91. SVG curvature and 3D transform change with scroll.
- Five requested headings match at desktop (63.356px, 650, line-height 68.4245px, spacing -3.1678px) and 390×844 iframe (40.125px, 650, line-height 43.335px, spacing -2.00625px).
- Home name left at phone gutter 20px; root client/scroll width both 375px in the 390px QA iframe.
- Reverse scrolling: header y=0, height 87px, mask none.
- Progress keyboard Home/ArrowRight/End and clicks update state; center stroke none, hidden highlights opacity 0 and current highlights .45.
- Phone menu/book dialog/Escape restores Menu and closed state; calendar Enter/click/Escape restores opener and retains 29px dialog title.
- Reduced effects: six papers hidden, all section shell copy opacity 1 and translate none. Light/dark living palette rendering verified through ordinary controls.
- Current hydration/navigation source independently hash-verified in the isolated checkout; root view transition none and route-based scenery correct on settled Home.
- TypeScript, all 101 automated tests (95 TS plus 6 API/controller), final optimized CTA-enabled build (47 routes), generated theme/art and original-copy/route assertions, and whitespace checks pass.

## Final optimized Preview acceptance

- https://zack-cook-da7jbra30-dove-mack0o-3684.vercel.app/ — dpl_5t1bScRe3FbMF8DhkLeeEpM3cSjj, source f34b5c78b45f4391590c7b2282ae80cae013780f, READY Preview/target null. One new Vercel deployment only. Main and the prior branch shortcut remain unchanged.
- Fresh first-visit invitation present. CTA bottom: desktop 898.03px / height 936; 320×568 515.86px; 375×667 556.88px; 390×844 687.75px; 768×1024 848.66px; 1024×667 612.53px. Settled root clientWidth equals scrollWidth at all five QA sizes. Input 46px, dismiss 44px, submit 48px (44px shortest phone).
- Requested headings share exact font on the deployed 390×844 viewport; Home heading starts at the 20px phone gutter.
- Opening paper y 351.40 → 793.46 while scrolling 0 → 562, then y 484.94 when scrolling back to 187. SVG shape and depth change with scroll, and the paper remains fixed while idle. Fourteen motes remain.
- Default and saved dark/reduced-effects optimized reloads have no application console warnings/errors. Browser-extension diagnostics are excluded. Reduced effects hides all six papers and keeps section text opacity 1/translate none; CTA remains visible.
- Desktop Book Alert/Escape restores Book Alert. Fresh phone menu→book→Escape closes dialogs, expanded=false, and returns to the visible wordmark; private QA returned Menu. These are safe visible header fallbacks, not identical outcomes. Calendar click/Enter/Escape and current source hydration/navigation were already verified privately.
- Refreshed detailed Vercel view still displays 8.18 GB, Updated just now. No deletion or storage savings claimed. Eight-target cleanup remains pending action-time confirmation.
- Source/checkpoint published exactly by ordinary fast-forward; final documentation publication and Codespace stop are the only delivery housekeeping steps. The own private server was stopped after private QA.

Limits: physical Safari browser chrome and touchscreen/sensor behavior are not certified by Chromium/iframe tests. Real device GPU/frame-rate and crash reproduction remain pending. OS reduced-motion, unsupported-browser and print fallbacks exist in source, with reduced effects exercised in the browser. Tree backend and Legendary acceptance reuse prior verified work and were not resubmitted in this UI milestone.

Storage cleanup is prepared, not executed. Do not claim freed storage until exact targets are confirmed, deleted and usage is measured.
