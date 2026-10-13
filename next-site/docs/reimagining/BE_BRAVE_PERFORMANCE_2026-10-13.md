# Be Brave performance and symbol revision

Continues `fabc5a8` on `experiment/be-brave-enchantments-2026-10-12`; test infrastructure only.

## Rendering and loading

Standing carvings now paint into fixed viewport canvases, including their engraving. The full-tree SVG is removed while Canvas is active. The filtered bark and reduced/fallen SVG fallback are cropped to an overscanned camera band. This removes full-height filtered surfaces and invisible particle nodes from the animated tree. Live Canvas drawing skips construction of unused SVG path strings.

Glow shading and engraving are cached until geometry/camera bands change. Buffer dimensions remain fixed throughout scrolling, capped at approximately 900,000 pixels each and DPR 1.5; all four backing stores and prepared paths are explicitly released on teardown. Static-only views sleep. Dynamic auras, symbol particles and rainbow color still animate.

The entry page preloads nearby history. A bounded snapshot cache shares those results with Admire, renders each fetched page immediately, decodes a carving once, retains a small surrounding region and limits outstanding requests to two. A viewport request batches overlapping sections into one public query; sealed projections pass through without server decoding/re-encoding. Snapshot responses use immutable HTTP caching. Existing geometry and archive checksums are unchanged.

Parallax uses time-based easing and compositor transforms. Default Admire width decreases from 68%/640px to 60%/570px. A native two-touch pinch changes that default by 0.5–1.5, keeping the world point beneath the fingers anchored; normal single-finger scrolling remains. There are no visible zoom controls.

## Visuals and copy

Particles use seeded random glyphs from Zack's exact 18-symbol set. Their monochrome vector outlines cannot be replaced by Apple emoji. Hearts keep the dedicated heart effect; red/black `blood-v1` uses U+273E. Energy tails are filled, curved, tapered ribbons with fading color rather than line segments. DejaVu outline licensing is retained under `licenses/DejaVu-symbols.txt`; U+2728 is an authored three-spark path.

The living entry order is Carve something new, Admire old carvings, Chop that bitch down, Leave. Leave links Home. About Me ends with `-Zack`, italic `Wait. Where‘s Brave?`, and a `Look for the cat.` link using the Home discovery choice style. Its moss panel is removed.

## Personal Legendary code

TEST ONLY migration `20261013142618_bebrave_personal_legendary_reuse.sql` adds an explicit reusable flag and separate reward identifiers, preserving every prior reward. Only existing red code identifier `07044491-c802-45f6-9160-5503d1b1cb6d` is reusable. Its original verifier/code is unchanged. Possession of that private high-entropy code permits reuse across the holder's browsers; normal owned-session checks, growth eligibility and abuse limits remain. The other 49 distribution codes stay single-use. Its effect description is updated in the private catalog.

A rolled-back database test passed first/repeated personal redemption, distinct reward history, completion consumption, foreign-session rejection and ordinary single-use. No QA rows persisted. Other49 row digest excluding the added flag remains `e185efc7985d3f39d2619b3163406be9`; prior reward digest excluding the added ID remains `22586bcf9acb150b702dc6c0b27c3da8`. Security advisors report only the existing service-only RLS INFO notices; grants remain restricted.

## Checks and release

141 tests pass (131 standard, 10 module mocks), including progressive loading, request/memory bounds, glyph identity, fixed buffer sizes, cached shading, curved tails, viewport API bounds, pinch limits/anchoring and smooth convergence. TypeScript, art/theme validation, whitespace and optimized build pass. Deployed browser checks follow publication; physical iPhone/Safari and pinch behavior need device QA. No new comparison video is produced.

Production remains main `75de96b` and `dpl_4Uzwt4ELBoYd8ckmEAR1jkQP7PqQ`. Production cutover must apply the reviewed personal-code migration and transfer the existing code assignment into production, then build with production configuration; do not promote the test-storage Preview.
