# Be Brave performance and symbol revision

Continues `fabc5a8` on `experiment/be-brave-enchantments-2026-10-12`; test infrastructure only.

## Current v5 refinement

Continues the deployed v4 application `2fc24be73101417b8d023ae9b6aad93d52fd98e8` after Zack's physical iPhone feedback. Standing engraving/aura/particle canvases now occupy an absolute, overscanned scene band. Native scrolling moves bark and carving together, independently of the effect animation's 30 fps budget. Screen-sized backing stores stay constant across the entire 0.5–1.5 zoom range and Safari toolbar movement. The scene clips overscan so it cannot extend the page's scroll range.

Pinch changes width, bark transform, spacer height and anchored scroll in one requestAnimationFrame. Cached effect layers receive the matching compositor transform immediately; React commits zoom/scale together only when the gesture ends. Ctrl-wheel trackpad zoom uses the same path. Landscape orientation and resize still remeasure. Background artwork uses stable large-viewport dimensions to avoid Safari toolbar rescaling.

The local adaptive controller monitors effect paint cost and animation-frame delivery. It lowers particle count, glow blur, flow sampling and eventually raster resolution under sustained pressure, starts conservatively on limited devices, and cautiously restores detail during healthy idle periods. Scroll/pinch immediately reduces particle work without repeated buffer resizing. Superior keeps animated radiance at the lowest detail; Epic keeps colored moving glyphs. Hard particle caps are 28/64/120 and raster caps are 450k/700k/900k per surface. These are rendering targets, not a guaranteed frame rate on every device. Hidden/reduced-motion teardown remains intact.

One integer-mixed symbol is selected from the server's already stored random effect seed for each whole carving. Every particle, emitter and later animation cycle keeps that symbol; publication, refresh and archival decoding reconstruct the same result. Separate carvings get independent choices. Dedicated hearts remain hearts and the personal red/black effect remains U+273E. No new database column, archive rewrite or code redemption is needed.

About now uses the actual Home dark-blue/white-border discovery frame, with a specificity-correct yellow choice label, and two additional line-heights of space before the italic Wait invitation. The Carve label and optional growth note share one flex item beside the caret, so the label cannot wrap below it.

147 tests (137 standard and 10 module mocks), TypeScript, optimized build, generated art/themes and whitespace checks pass. Tests exercise archival symbol identity, all zoom buffer sizes, compositor anchoring, hard particle limits, low-detail magical identity, overload backoff and idle recovery. Actual final Preview acceptance follows publication. Physical Safari's new pinch behavior and low-end hardware frame rate require device confirmation; no comparison videos are produced.

## Retained v4 loading and data behavior

V4 introduced camera-sized canvases for standing engraving; v5 replaces their fixed positioning with the synchronized scene band described above. The full-tree SVG is removed while Canvas is active. The filtered bark and reduced/fallen SVG fallback are cropped to an overscanned camera band. This removes full-height filtered surfaces and invisible particle nodes from the animated tree. Live Canvas drawing skips construction of unused SVG path strings.

Glow shading and engraving are cached until geometry/camera bands change. Buffer dimensions remain fixed throughout scrolling, capped at approximately 900,000 pixels each and DPR 1.5; all four backing stores and prepared paths are explicitly released on teardown. Static-only views sleep. Dynamic auras, symbol particles and rainbow color still animate.

The entry page preloads nearby history. A bounded snapshot cache shares those results with Admire, renders each fetched page immediately, decodes a carving once, retains a small surrounding region and limits outstanding requests to two. A viewport request batches overlapping sections into one public query; sealed projections pass through without server decoding/re-encoding. Snapshot responses use immutable HTTP caching. Existing geometry and archive checksums are unchanged.

Parallax uses time-based easing and compositor transforms. Default Admire width decreases from 68%/640px to 60%/570px. A native two-touch pinch changes that default by 0.5–1.5, keeping the world point beneath the fingers anchored; normal single-finger scrolling remains. There are no visible zoom controls.

## Visuals and copy

Each carving uses one seeded random glyph from Zack's exact 18-symbol set (v5 clarifies the original per-emitter implementation). Their monochrome vector outlines cannot be replaced by Apple emoji. Hearts keep the dedicated heart effect; red/black `blood-v1` uses U+273E. Energy tails are filled, curved, tapered ribbons with fading color rather than line segments. DejaVu outline licensing is retained under `licenses/DejaVu-symbols.txt`; U+2728 is an authored three-spark path.

The living entry order is Carve something new, Admire old carvings, Chop that bitch down, Leave. Leave links Home. About Me ends with `-Zack`, italic `Wait. Where‘s Brave?`, and a `Look for the cat.` link using the Home discovery choice style. Its moss panel is removed.

## Personal Legendary code

TEST ONLY migration `20261013142618_bebrave_personal_legendary_reuse.sql` adds an explicit reusable flag and separate reward identifiers, preserving every prior reward. Only existing red code identifier `07044491-c802-45f6-9160-5503d1b1cb6d` is reusable. Its original verifier/code is unchanged. Possession of that private high-entropy code permits reuse across the holder's browsers; normal owned-session checks, growth eligibility and abuse limits remain. The other 49 distribution codes stay single-use. Its effect description is updated in the private catalog.

A rolled-back database test passed first/repeated personal redemption, distinct reward history, completion consumption, foreign-session rejection and ordinary single-use. No QA rows persisted. Other49 row digest excluding the added flag remains `e185efc7985d3f39d2619b3163406be9`; prior reward digest excluding the added ID remains `22586bcf9acb150b702dc6c0b27c3da8`. Security advisors report only the existing service-only RLS INFO notices; grants remain restricted.

## Checks and release

The v4 baseline passed 141 tests (131 standard, 10 module mocks), including progressive loading, request/memory bounds, glyph identity, fixed buffer sizes, cached shading, curved tails, viewport API bounds, pinch limits/anchoring and smooth convergence. TypeScript, art/theme validation, whitespace and optimized build pass. Deployed browser checks follow publication; physical iPhone/Safari and pinch behavior need device QA. No new comparison video is produced.

Production remains main `75de96b` and `dpl_4Uzwt4ELBoYd8ckmEAR1jkQP7PqQ`. Production cutover must apply the reviewed personal-code migration and transfer the existing code assignment into production, then build with production configuration; do not promote the test-storage Preview.
