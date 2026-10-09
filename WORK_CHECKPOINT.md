# Website reimagining checkpoint

Updated: 2026-10-09 UTC. The overhaul is IN PROGRESS. The published preview is an intermediate design, not final visual sign-off. Current milestone removes the rejected bird/decorations, makes artwork replaceable, and refines shared cursor/tilt material lighting.

## Branch and isolation

- Branch: `experiment/immersive-world-2026-10-09`; repository `zackdcook/zackdcook.github.io`; app `next-site`.
- Last verified published SHA: `cfa38bd4ef4ccb019fe3c043f7fcd65df293af3e`. Use `git log -1` for the artwork-system milestone containing this checkpoint.
- Main baseline: `be6b15d93f2bae259a52e7b80d98a51018edb01d`; spring-clean tree/test reference: `cd697eb1b6a756d74b4eee16ac3ec096ce80eb50`, branch `spring-clean-2026-10`.
- Latest verified READY Preview: `dpl_GP1f6P4GScHzxs8NZAqKuCAVGQWL`, https://zack-cook-ohaxqm30r-dove-mack0o-3684.vercel.app/ , exact cfa SHA, target null (Preview).
- Existing Vercel project: `zack-cook`, `prj_AcuTfmUBydayvETed53KCREnlONa`. Omit teamId/slug. Preview API omits target; literal preview is rejected.
- Test Supabase: `qkkgcoejkqvthbjcldcw`. Production `belqlsqnbexwkpmnptyy` is read-only and must NEVER be modified.
- Preview/test guards fail closed outside the exact test project and nonproduction configuration. Test-only Cloudflare bypass, responsive harness and personal carve reset are preserved.
- Git auto-builds disabled only for this experimental branch in both vercel.json files. Use deliberate preview deployments. Do not merge, promote, change production settings or activate charges.
- Previously verified Vercel Hobby and Supabase Free (500 MB DB, 5 GB egress, 1 GB Storage, two existing active projects). Existing GitHub Free Codespaces account has a $0 product budget with Stop usage enabled. No paid resource created.

## User direction and decisions

- Preserve Zack's exact authored words and functional intent, including hidden content. Boxes, menus, layout, artwork and the whole presentation are meant to change substantially. The rejected mobile screenshot and user's disappointment with preview polish are explicit guidance.
- Do NOT use the origami bird. All graphics must be modular and replaceable with Zack's chosen designs. Retain four-theme color behavior and desktop cursor / opt-in mobile tilt lighting inspired by responsive glass.
- Current defaults remove provisional decorative scenery; original photo, functional leaf/ribbon/progress geometry and game art remain. Artwork slots support image/mask/native/none and four theme variants. Source bird stays archived but is not imported or rendered.
- Native scroll, precise restrained movement, semantic lighting, clean editorial spreads and immersive swamp/tree form one system. References inform craftsmanship, not copied layouts. Design research is already in ART_DIRECTION.md; do not repeat the audit.
- Main words remain authoritative. Main already includes later production tree control improvements; selectively integrated spring-clean test helpers instead of merging the branch.
- Stack: locked Next 16.3.8, React 19.3.0, TypeScript. Read relevant installed Next docs before framework changes (AGENTS.md).
- Original gameplay: 60-second timed drawing, no undo, one foot per completed nonempty carving, five-foot personal care cooldown, server eligibility, local-only felling, earlier sessions painted above newer sessions. Legend unlocks do not bypass cooldown.

## Completed milestones

- Baseline route/function/word audit; content and route regression guard; latest committed sources verified. Baseline 46 tests and production build passed.
- Four centralized semantic palettes in design/themes.json + semantic-roles.css, generated app/theme.css, contrast checks.
- Architectural presentation cleanup: over 3,500 obsolete CSS lines removed; module-based editorial homepage, typographic events, biography/photos, Folly leaves, directory shoutouts, slim header and native mobile navigation dialog. Authored text remains.
- Kitty ribbon physics/keyboard secret, Folly leaf physics/reading, stage progress keyboard/click, calendar dialog and preferences preserved; previous desktop browser checks passed. Full inventory remains pending.
- Original cypress-world art: three versioned WebPs, under 0.9 MB total, unified tree CSS/HUD, responsive full-width world, mist/fireflies and shared live/published seeded effects. No gameplay/world-coordinate changes. Texture seam and input/art polish still need browser sign-off.
- Shared bounded viewport cache/cancellable section requests; lossless delta/varint transport with high-precision fallback; 12-session endpoint pages; indexed GiST viewport lookup tested with 100,000 rolled-back metadata rows. Canonical compressed archive and full-population rendering benchmarks are NOT finished.
- Legendary server-only one-way verifiers, stable IDs, code-to-effect mapping, atomic single-use reward, anonymous entitlement persistence and default will-o-wisp-v1 implemented. 50 distribution codes registered and remain unredeemed; original 20 completed test carvings preserved.
- Actual SQL simultaneous-redemption fixture passed: two scheduled requests started .654 ms apart; one won, second waited ~8 s then failed. No cron jobs remain. Three consumed fixture verifiers in separate campaigns and six cancelled fixture sessions retained after MCP delete approval-state failures; do not delete original records.
- Existing browser sign-in securely authorized and completed. Preview protection remains intact. Prior browser checks: desktop home light/dark, progress click/arrow, calendar choices, preferences, ribbon keyboard secret, tree entry/Admire/82% zoom.
- Test-only /test-viewport?width=390&path=/ supports same-origin CSS viewport QA under strict preview/test and nine-document allowlist. APIs/admin/ordinary/production framing remains blocked. Iframe tests do not verify physical touch or orientation.
- CURRENT ARTWORK MILESTONE: central design/art-assets.json, generated CSS and validated local paths, Artwork/ArtworkImage renderers, replaceable controls/scenery/photo variants, optional clipped leaf/ribbon skins. Removed bird and rejected default scenery. Corrected 320px progress columns. Shared light holds under resting mouse and stops scheduling frames after settling; bounded inner pose does not move hit bounds. Reduced effects and established opt-in tilt/recenter retained.

## Tests and verification status

- Current source milestone: 73/73 tests PASS, TypeScript PASS, art/theme generated checks PASS, production build PASS (all original routes plus test-only harness). No lint command exists; do not claim lint passed.
- Source checks cover original authored copy/routes, four contrast palettes, codec fidelity, pagination/cache bounds, test isolation, Legendary mapping, artwork paths/variants and bounded pose.
- Actual new artwork browser appearance and shared light resting/settling are NOT verified yet. Latest READY preview still runs cfa, before these changes.
- Prior 390px harness found decorative bio/menu overflow and source fixes were committed; deployed recheck is still due.
- Canonical completed archives, full geometry/network/render scale tests, mouse/touch drawing+publication, all effects, cooldown/reset, lockbox entitlement+refresh, complete living/felled states, all routes/hidden features and physical mobile tilt remain incomplete.
- Supabase security advisor previously had only intentional INFO (RLS enabled with no browser policies on service-only tables); no warning/error.
- No exact Work usage counter is exposed. Save milestones; no work runs between sessions.

## Relevant files

- Design: next-site/docs/reimagining/ART_DIRECTION.md, ARTWORK_SYSTEM.md, ART_ASSETS.md, functionality inventory / baseline-manifest.json; next-site/design/themes.json, art-assets.json.
- Presentation: components/field-journal-hero*, active-project*, progress-rings*, site-header*, artwork.tsx, pointer-light.tsx, editorial-kitties.tsx, quote-leaf.tsx; app/{globals,materials,artwork,art-assets,theme,folly,bebrave}.css.
- Tree: components/bebrave-experience.tsx, bebrave-tree*, bebrave-stroke*; lib/bebrave*, lib/server/bebrave*; app/api/bebrave.
- Existing applied migrations: 20261009080906_bebrave_legendary_unlocks.sql and 20261009084443_bebrave_completed_geometry.sql. Confirm ledger before creating any new migration.
- Next data architecture: retain visitor/session/cooldown/effect records; archive ALL original chunk fields in a checksummed lossless gzip container; replace completed raw chunks only atomically after round-trip verification. Row-lock against concurrent publication. Legacy-compatible reads. Render simplification must not change canonical artwork or seeded effect anchors.

## Publishing and recovery

- GitHub connector writes still 403; Work shell has no Git authentication. Publishing is restored via the existing authorized Codespace's native Git. Do not extract cookies/tokens, mint credentials or keep retrying unchanged connector writes.
- Codespace: cautious-trout-wrq56q47v6j4c94x6, https://cautious-trout-wrq56q47v6j4c94x6.github.dev/ .
- Separate persistent bare mirror: /workspaces/zack-experimental-publish.y2QMu0/repository.git. Original /workspaces/zackdcook.github.io stays on spring-clean and clean; never reset/switch/change it.
- Create incremental Git bundle outside repo from last pushed SHA to experimental branch. Upload through supported VS Code chooser to next-site, immediately move temporary bundle into separate mirror directory, bundle verify, fetch exact experimental ref and normal fast-forward push only that branch.
- Verify remote exact SHA, unchanged main baseline and clean original Codespace worktree. No force push, squash, amend, alternate branch or history rewrite. Stop the existing Codespace after publishing.
- Earlier complete recovery bundle remains at /workspace/scratch/01235e4bd732/website-reimagining-checkpoint.bundle; private saved file ID libfile_e8cf0dc5d8d08191b77ff9f158631473. Preserve it and prior incremental bundles.
- Private 50-code CSV remains outside Git at /workspace/scratch/01235e4bd732/private-legendary/zackdcook-legendary-codes-private.csv; private saved file ID libfile_a4526eee5f2c8191821e94729fc943bf. NEVER regenerate, expose in logs/source/builds or consume distribution codes for tests.
- Vercel project/preview calls work WITHOUT explicit teamId/slug. Existing Git-connected manual preview API is the verified deployment route; CLI not authenticated.
- Protected-preview MCP returns 403; unchanged retry inappropriate. Authorized existing browser session works. Never weaken protection, broaden trusted sources or extract credentials.
- Cloud browser cannot reach Work localhost. Source/local HTTP verification works; visual QA uses isolated real Preview. Cloudflare connector absent; no unrelated infrastructure investigation.

## Remaining tasks in priority order

1. Publish current artwork milestone preserving exact history. Deploy Preview at its verified SHA; inspect 320/390/768/1024 and desktop, all palettes, home/menu/progress layout, optional art variants and cursor/rest/reduced lighting. Refine visible failures.
2. Complete lossless canonical carving archives and meaningful full-geometry/population performance benchmarks; verify backwards compatibility, source fidelity, visitor/cooldown separation, atomic publication/cache updates.
3. Test full browser → Next.js → isolated test Supabase → publication flow, 60-second drawing, zoom/pan/input, tools/rarities/live-vs-saved effects, personal reset/cooldown, Legendary redemption/refresh/replay and both timelines. Use disposable fixtures, never 50 distribution codes.
4. Verify remaining inventory/routes/secrets, desktop/tablet/mobile keyboard/touch/reduced states, performance and visual craft. Physical sensor testing must be disclosed if unavailable.
5. Final refined preview + private codes + test report + palette/architecture summary. The project is not done until end-to-end/browser polish is verified.

Exact next action: publish the tested artwork-system milestone from cfa through the authorized native Codespace Git mirror, create one isolated Preview at the exact SHA, and perform actual browser responsive/lighting checks. No blockers require user input presently.
