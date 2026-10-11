# Public experience milestone 7 — reading flow and mote-only atmosphere

Date: 2026-10-11. Branch: `experiment/immersive-world-2026-10-09`. Application parent: `9a5f927536fb8869f1b53ef51c523bcf66764059` (prior application `f34b5c7`). Pre-paper composition reference: `a0b5660`. Original main/tree sources and completed backend work remain unchanged. Final source and immutable Preview will be recorded after publication.

## Layout analysis after removing the papers

The paper wrappers constrained an already narrow desktop opening to a vertical column. Several fixed 7/10ch heading limits forced unnatural breaks after the later heading-size correction, and the leaf destination remained centered while adjacent text was left-aligned. Adjacent sections stacked large vertical paddings; the About biography additionally combined an 80px margin with a full section padding. Repeated label/link/card/footer rules made ordinary sections feel compartmentalized. The portrait border and shadow belonged to the stationary square button, causing the outline to remain during its flip.

Home now has a common shell and feature type scale matching Swampass. Its opening pairs a left reading column with the portrait on desktop, retaining the established stacked order on phones. Community, biography, leaf and shoutout columns share proportions and gutters; titles wrap naturally, body measures remain bounded, and links align with their associated content column. Regular section padding replaces the oversized doubled gaps; compact spacing uses 32px. Gentle native content/leaf transitions remain, with a smaller name movement anchored to the left edge.

All public background scene mounts are removed, including window/desk/reeds/pages, event decoration, navigation scenery and About marginalia. The deleted PaperChapter and StudioArtwork implementations/CSS are no longer shipped; their configurable decorative slots are disabled. Portrait/cat photographs, icons, functional quote leaves and the hidden tree world's artwork remain.

## Atmosphere, portrait and manuscript

Three fixed mote planes reuse the existing PointerLight loop and bounded wrapping calculation. Far/middle/near depths are respectively .10–.20 / .28–.38 / .52–.62; size and intensity also differ. Population remains 14 desktop and 8 mobile; randomness occurs once after hydration, with no per-frame React work or network request. Reduced effects/OS reduced motion hide the planes; modal dialogs pause/hide them. Active-route detection prevents a cached hidden tree route from suppressing a public page's atmosphere.

The About button reserves the original square footprint and has no border, shadow or tactile pseudo-elements. Rotating faces own those treatments. Its back is 75% as wide as it is tall, showing the full 1200×1600 doodle image; no padded square backing remains. Keyboard focus follows the visible face, and reduced motion flips without a transition. The biography retains its vertical reading-progress track and paragraph transitions with a shorter, compact-aware opening gap.

Generic collection-heading lines, link underlines, shoutout/card/book/footer/menu separators and the Folly playground's bottom line are removed. Inline prose links, form controls, selected navigation/stage markers and the dedicated Creative Works drafting dividers remain. The progress dial's cast shadow is removed; material lighting and selection-only highlights remain.

A dev-only instant-navigation diagnostic on Shoutouts led to moving its cached data list behind a page-level Suspense boundary. The original heading can render immediately; the same list/copy/cache/data source is preserved. The 23:05 diagnostic predates this change; reload and settled Home→Shoutouts navigation did not produce a new instance.

## Verification

- Automated: 95 TypeScript tests plus 6 API/controller tests passed (101 total). Exact baseline route/content/wording/hidden-dialogue checks passed. TypeScript, optimized 47-route build, generated theme/art checks and whitespace checks passed. No lint script exists in this repository.
- Private Chrome desktop: Home, Creative Works, Events, About Me, Words of Folly and Shoutouts visually reviewed in the mote-only environment; client width and scroll width both 1348px. Feature headings share 63.356px at this size. Text columns and line lengths were measured, with no paper or scenery slot mounted.
- Responsive: Home at 320×568, 390×844, 768×1024 and 1024×667, plus all six public routes at phone widths. Client/scroll widths matched 305/305, 375/375, 753/753 and 1009/1009 respectively (Chrome's reserved scrollbar occupies 15px). Home feature headings remain equal at 38px / 40.125px / 42.921px / 47.423px respectively. Events' mobile directions/calendar controls wrap with 46px heights. Shoutouts and Folly checked at 375×667, client/scroll width 360/360; text starts at the same 20px gutter.
- Motion: 421px native scroll moved representative far/middle/near motes 73.94/157.08/234.38px, matching their depths; 14 desktop/8 mobile population confirmed. Header stayed at top 0px on downward/upward scroll with its opaque backdrop. Full/reduced/compact states were checked through normal settings controls, then restored.
- Portrait: desktop front 425.453×425.453px, back 319.109×425.453px; stable outer bounds before/after. Phone front 251.25px square, back 188.438×251.25px. Stationary outer border 0, shadow none, pseudo content none. Click, Enter and Space toggled both ways; visible-face keyboard outline confirmed.
- Manuscript: dial computed shadow none on desktop/mobile; keyboard revision selection shows 0% and the original note. Permanent center outline remains absent. Intended stage/drafting dividers retained.
- Preserved UI flows: calendar opens and Escape returns focus to its trigger; Folly opens via click/Enter, ArrowLeft selects leaf 7 of 8, Escape closes; Book Alert renders the original form/dialog; mobile menu hands off to settings. Private source is guarded by file hashes and uses the isolated test project reference with analytics disabled; port visibility is Private.

These are rendered Chrome/iframe checks, not physical Safari/touch/tilt or measured low-end GPU acceptance. No new database rows, canonical tree carvings, Legendary redemptions or signup submissions were made for this visual milestone; previously recorded backend acceptance remains the source of truth. This does not declare the entire original overhaul complete.

## Publication and continuation

Publish one final Preview from the reviewed source, test its fresh-origin homepage CTA at short-phone widths, record its exact commit/deployment/URL, and stop the isolated QA server/Codespace. Do not move the shared branch shortcut or production, upgrade a plan, delete the held eighth artifact, or merge the separate listening/reading worktree. Ask for feedback on the resulting layout, then continue the earlier physical-device and original-inventory verification work from the durable checkpoint.
