# Website reimagining checkpoint

Updated: 2026-10-09 UTC. The overhaul is IN PROGRESS. Archive milestone is published; 21 completed test carvings restored byte-for-byte after persistent canonical backfill. A real browser Legendary carving completed its full timer, published and archived automatically. Reset/cooldown/refresh/replay verified. Visual sign-off and full inventory remain incomplete.

## Branch and isolation

- Branch: `experiment/immersive-world-2026-10-09`; repository `zackdcook/zackdcook.github.io`; app `next-site`.
- Last verified published SHA: `19f7f99eec5dfd84619ce7a14488b3f9ffb13758`. Use `git log -1` for the verification checkpoint containing this file.
- Main baseline: `be6b15d93f2bae259a52e7b80d98a51018edb01d`; spring-clean tree/test reference: `cd697eb1b6a756d74b4eee16ac3ec096ce80eb50`, branch `spring-clean-2026-10`.
- Latest verified READY Preview: `dpl_FcspzTvrJH4sN6JFTmSUTNCxemJb`, https://zack-cook-dtuhqgj0j-dove-mack0o-3684.vercel.app/ , exact 19f SHA, target null (Preview). All history preserved; main unchanged; native publishing Codespace stopped after push.
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
- Shared bounded viewport cache/cancellable section requests; lossless delta/varint transport with high-precision fallback; 12-session pages; GiST viewport lookup tested with 100,000 rolled-back metadata rows. Canonical gzip originals + separate simplified projections + preserved original-path rare anchors implemented; anonymous table/RPC access denied. Failed source/payload/projection, success and idempotence verified. After compatible Preview READY, all 21 preexisting test completions were persistently archived and restored byte-for-byte; session/visitor/tree ledger hashes unchanged. Real browser publication 22 automatically archived; original 20 remain intact.
- Synthetic full 2,400-point geometry round trips / real React SVG generation tested with 100/1k/10k/100k metadata populations: fixed five-section window held 19 records, 2,964 render points and ~199–200 KB worst-case all-Legendary JSON. Local Node measurements, not browser FPS. Dense simultaneous same-zone populations and physical DB savings are not claimed verified. See SCALABLE_CARVINGS.md and carving-scale-results.json.
- Legendary server-only one-way verifiers, stable IDs, code-to-effect mapping, atomic single-use reward, anonymous entitlement persistence and default will-o-wisp-v1 implemented. 50 distribution codes registered and remain unredeemed; original 20 completed test carvings preserved.
- Actual SQL simultaneous-redemption fixture passed: two scheduled requests started .654 ms apart; one won, second waited ~8 s then failed. No cron jobs remain. Three consumed fixture verifiers in separate campaigns and six cancelled fixture sessions retained after MCP delete approval-state failures; do not delete original records.
- Existing browser sign-in securely authorized and completed. Preview protection remains intact. Prior browser checks: desktop home light/dark, progress click/arrow, calendar choices, preferences, ribbon keyboard secret, tree entry/Admire/82% zoom.
- Test-only /test-viewport?width=390&path=/ supports same-origin CSS viewport QA under strict preview/test and nine-document allowlist. APIs/admin/ordinary/production framing remains blocked. Iframe tests do not verify physical touch or orientation.
- CURRENT ARTWORK MILESTONE: central design/art-assets.json, generated CSS and validated local paths, Artwork/ArtworkImage renderers, replaceable controls/scenery/photo variants, optional clipped leaf/ribbon skins. Removed bird and rejected default scenery. Corrected 320px progress columns. Shared light holds under resting mouse and stops scheduling frames after settling; bounded inner pose does not move hit bounds. Reduced effects and established opt-in tilt/recenter retained.
- CURRENT LOCAL REFINEMENT: replaced detached paper tree HUD with themed smoked glass, unified control rail, larger phone choices, direct access to existing preferences, subtle cut-edge stroke depth and cursor/tilt-lit environment. Added centralized world-glass/world-ink colors to all four palettes and worst-white-background contrast assertions. 77 tests, TypeScript and production build pass; deployed visual verification of this refinement is next.

## Tests and verification status

- Current archive source: 77/77 tests PASS, TypeScript PASS, art/theme generated checks PASS, production build PASS (all original routes, harness, selective canonical-detail API), including the final observer refinement. No lint command exists; do not claim lint passed.
- Source checks cover original authored copy/routes, four contrast palettes, codec fidelity, pagination/cache bounds, test isolation, Legendary mapping, artwork paths/variants and bounded pose.
- Actual 5e4 preview verifies removed bird, cleaner desktop hero, 320px layout with no overflow, native mobile menu/Escape, visible small manuscript progress, and resting cursor light at strength 1 with bounded pose and unchanged outer photo geometry. Photos remain responsive. Full 390/768/1024 and all-palette QA is still due.
- Prior 390px harness found decorative bio/menu overflow and source fixes were committed; deployed recheck is still due.
- Persistent backfill and actual mouse timed Legendary publication/archive, saved effect, cooldown/reset, lockbox refresh/replay pass; see BROWSER_VERIFICATION.md. Ordinary effect variants, complete living/felled states, all routes/hidden features, broader responsive/reduced states and physical mobile tilt remain incomplete.
- Supabase security advisor previously had only intentional INFO (RLS enabled with no browser policies on service-only tables); no warning/error.
- No exact Work usage counter is exposed. Save milestones; no work runs between sessions.

## Relevant files

- Design: next-site/docs/reimagining/ART_DIRECTION.md, ARTWORK_SYSTEM.md, ART_ASSETS.md, functionality inventory / baseline-manifest.json; next-site/design/themes.json, art-assets.json.
- Presentation: components/field-journal-hero*, active-project*, progress-rings*, site-header*, artwork.tsx, pointer-light.tsx, editorial-kitties.tsx, quote-leaf.tsx; app/{globals,materials,artwork,art-assets,theme,folly,bebrave}.css.
- Tree: components/bebrave-experience.tsx, bebrave-tree.tsx, bebrave-stroke.tsx; lib/bebrave-server.ts, lib/bebrave/{archive-codec,completed-storage,completed-strokes,effect-anchors}; app/api/bebrave; scripts/{prepare-carving-archives,benchmark-carvings}.ts.
- Applied experimental migrations: 20261009080906_bebrave_legendary_unlocks.sql, 20261009084443_bebrave_completed_geometry.sql, 20261009190308_bebrave_canonical_archives.sql. Latest created with pinned CLI 2.120.0 and filename reconciled to actual applied ledger; schema is applied only to test. Original 20 complete carvings and all 50 distribution codes remain intact/unredeemed. Test now has 22 completed sessions/archives including two fixtures. Test export/prepared/restored verification files remain private outside Git in scratch; canonical copies reside in the test DB.
- Canonical archive architecture is implemented as above. Client camera pauses offscreen rare effects via one observer, while live drawing remains unchanged. The canonical detail endpoint is server-only at the DB boundary and exposes only already published artwork metadata, never visitor/reward identity.

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

1. Archive milestone is published and backfilled/verified. Save/publish this verification checkpoint with the next coherent refinement. See BROWSER_VERIFICATION.md: 22 completed archives now include the real timed Legendary fixture; distribution 50 untouched.
2. Complete browser 390/768/1024 and desktop/four-palette QA, camera texture/art polish and resting/reduced light. Source / scale checks are complete but full browser input / timing / actual performance are not.
3. Real browser → Next.js → test DB → timed Legendary publication/archive, zoom, cooldown/reset, reward refresh/replay now pass. Continue ordinary tools/rarities and both timelines. Use disposable fixtures, never 50 distribution codes.
4. Verify remaining inventory/routes/secrets, desktop/tablet/mobile keyboard/touch/reduced states, performance and visual craft. Physical sensor testing must be disclosed if unavailable.
5. Final refined preview + private codes + test report + palette/architecture summary. The project is not done until end-to-end/browser polish is verified.

Exact next action: publish the local glass/engraving refinement + verification checkpoints from remote 19f via the established mirror, deploy one Preview, then continue four-theme / 390–1024px visual and full original-inventory browser QA. First-strike Chop → Stop already passed; continue complete felling/stump/regret persistence. Canonical backfill and timed Legendary browser checks are complete; do not repeat unnecessarily. No blockers require user input presently. Never regenerate or test with distribution codes.
