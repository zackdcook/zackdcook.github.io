# Website reimagining checkpoint

Updated: 2026-10-09 UTC. Status: publishing restored, recovered source published, first experimental preview READY. Paused at protected-preview authorization boundary. Visual overhaul, canonical archives, and browser verification remain incomplete.

## Source and isolation
- Experimental branch: `experiment/immersive-world-2026-10-09`.
- Latest published commit: `c23b479bb21f637dfadc175576ca96e9c12910f4`. All original experimental history and recovered source changes are on GitHub. Use `git log -1` for the commit containing this update.
- Original main baseline: `be6b15d93f2bae259a52e7b80d98a51018edb01d`.
- Tree/test reference: `spring-clean-2026-10` at `cd697eb1b6a756d74b4eee16ac3ec096ce80eb50`.
- Repository: `zackdcook/zackdcook.github.io`; application directory: `next-site`.
- Test Supabase: `qkkgcoejkqvthbjcldcw` (`zackdcook-test`). Organization plan verified free.
- Production Supabase: `belqlsqnbexwkpmnptyy`. Read-only table metadata inspected; never modify.
- Vercel project: `prj_AcuTfmUBydayvETed53KCREnlONa`, account `team_NSAGsSQupndjz84vjnupVkVK`.
- Automatic Vercel builds remain disabled for this experimental branch in `vercel.json` and `next-site/vercel.json` to avoid unnecessary iterative builds. Manual Preview deployment works using the existing test configuration and free account. Other branch settings are unaffected.

## Completed
- Verified remote branch heads and cloned the repository; local branch is based on main.
- Compared all 12 branch differences. Main already incorporates the later production tree visual/control improvements. Selectively port spring-clean test helpers and controls; do not replace main's improved control rail or newer authored bio.
- Installed exact locked dependencies, without lifecycle scripts. Baseline 46 tests, typecheck, and production build pass (43 routes; no backend credentials).
- Current 67 tests, TypeScript, and generated-theme checks pass, including four palette contrast checks, lossless compact stroke round-trips, pagination beyond REST row caps, cancellation/cache bounds, authored-copy/route preservation, and environment isolation.
- Centralized four palettes in `next-site/design/themes.json` and semantic aliases in `design/semantic-roles.css`. `npm run themes:build` generates `app/theme.css`; `themes:check` detects drift. Removed superseded root color declarations; further component art cleanup remains.
- Ported spring-clean test bypass/reset with strict exact-test-project and nonproduction guards. Experimental preview builds fail closed if pointed at another database. Local unconfigured visual builds are allowed.
- Added lossless delta/varint point transport with high-precision legacy fallback, bounded chunk reconstruction, 12-session endpoint pages, and revision-keyed client caches. Canonical database storage and scale benchmarks remain unfinished.
- Inventoried source routes and content hashes in `next-site/docs/reimagining/baseline-manifest.json`.
- Both databases contain the six original Be Brave tables with RLS enabled. Test now also contains Legendary service-only tables; 50 distribution codes remain registered and unredeemed. Preserve the existing 20 completed test carvings.
- Supabase changelog reviewed through 2026-10-08. The new status-page migration does not affect this implementation. Existing code uses Supabase SSR (not deprecated framework adapters).
- Original field-journal hero and semantic SVG swamp landscape are implemented in source; unchanged copy is regression-tested. Browser visual sign-off remains outstanding.
- Spatial GiST viewport lookup is implemented and tested with up to 100,000 rolled-back metadata rows. Actual ledger version is `20261009084443_bebrave_completed_geometry.sql`; compact canonical geometry storage remains the next data milestone.

## Decisions / research
- Preserve exact content from main and existing tree gameplay: 60-second timer, 5-foot growth eligibility, one foot per completed nonempty carving, pity rarity progression, earlier sessions visually above newer sessions, local-only felled timeline.
- Existing stack: Next 16.3.8, React 19.3.0, TypeScript; retain stable systems while decomposing large interaction components.
- Existing viewport sections are 864 world units; five nearby sections load, but endpoint reconstructs raw chunks, can hit REST row caps, and fetches all pages. Add compact canonical completed records and bounded viewport render projections without flattening visitor identity or stroke order.
- Existing cache redemption is configurable multi-use and grants Epic. Replace with globally single-use Legendary rewards, stable IDs, server verifiers, atomic consumption, persistent entitlement and effect mapping; test using disposable fixtures rather than consuming the 50 distribution codes.
- Supabase Free: 500 MB database, 5 GB egress, 1 GB storage, two active projects. Use existing test project, no new paid resources.
- Vercel `git.deploymentEnabled` supports disabling an individual branch (official project-configuration/git-configuration docs).

## Remaining access / verification limits
- GitHub connector writes still fail and the Work shell has no configured Git credentials. Authorized publishing now succeeds through the existing repository Codespace's native Git connection; see the recovery procedure below. No credential extraction or new credential was required.
- Vercel project and preview environment reads work when omitting explicit teamId/slug. Preview creation is verified by the real READY experimental deployment below. Neither Work nor the existing Codespace has a Vercel CLI connection.
- Verified existing Preview URL, project reference, and `true` test mode point to `qkkgcoejkqvthbjcldcw`; authenticated account billing reports active Hobby. Build fails closed outside isolated test storage. No production secrets/settings were read or changed.
- BLOCKING browser QA: `get_access_to_vercel_url` returned 403 with omitted team (read_protection_bypass) and with the actual owning team (lookup_deployment). Browser reaches Vercel sign-in; no normal CLI fallback is configured. Do not retry unchanged, disable Deployment Protection, broaden Trusted Sources, or extract credentials. Ask user to authorize secure browser sign-in as a fallback, or repair the Vercel connection's protected-deployment/team permission. Preview exists but is NOT functionally or visually signed off.
- Cloudflare plugin discovery returned no usable connector. Dashboard fallback requires user approval if resolving an available plugin's failure.
- No exact Work usage counter is exposed. Save coherent milestones; no background continuation between sessions.
- Cloud browser can inspect reference sites but cannot reach the workspace's localhost server (connection refused). Local HTTP and build verification are possible; changed-site browser/visual QA awaits a reachable preview.

## Next tasks (ordered)
1. Resolve protected-preview browser authorization with the user's direction, then verify the real browser → Next.js → test Supabase flow.
2. Complete compact canonical storage/projections, bounded rendering, and meaningful geometry/network/render scale tests (not just metadata lookup).
3. Finish cohesive site/tree art direction and component cleanup; keep exact authored wording and every inventory feature.
4. Publish coherent milestones via the verified Codespace bundle method; deploy this branch only with the existing free/test configuration.
5. Check all inventory features, desktop/mobile input and preferences, four timelines/themes, accessibility, security, performance, and visual refinement. Update the functionality ledger with evidence.
6. Deliver the working preview, branch/SHA, accurate tested/incomplete report and existing private code file. Never regenerate the 50 codes.

## Legendary milestone (before applying the migration)
- Latest foundation commit: `1bffa64` (full SHA in Git). Recovery bundle has been saved privately because GitHub writes are blocked.
- Implemented source for one-time Legendary verifiers, bounded lockbox input, service-only atomic redemption, persistent reward records, future code/effect mapping, and default `will-o-wisp-v1` live/published SVG treatment. These are NOT yet database/browser verified.
- Migration: `next-site/supabase/migrations/20261009080906_bebrave_legendary_unlocks.sql`. Existing Epic cache codes remain supported. Legendary is never an ordinary tool roll.
- Reward semantics: redemption is permanently consumed; reward is attached to the anonymous visitor, retained through empty/cancelled attempts, and spent only by the next completed nonempty carving. Normal 5-foot eligibility is retained. Test reset now preserves identity and historical records using an eligibility watermark.
- Discovered baseline SQL tier thresholds were 50/30/15/5 while TypeScript intended 42/35/18/5. The test migration aligns SQL with the intended distribution.
- Existing lockbox narrative is preserved verbatim, including its numeric-keypad description; keyboard/touch input now also accepts the required alphanumeric codes.

## Verified backend milestone
- Latest committed source: `5911625`; subsequent tests/cache/copy-guard changes may still be uncommitted. Check `git status`.
- Legendary migration applied ONLY to the isolated test database. Rollback integration tests passed under service_role, including ownership, publication, cooldown, rate limits and entitlement restoration.
- True simultaneous redemption passed using two self-removing test cron jobs. Started within 0.654 ms; one succeeded, one waited 8,011 ms and failed. Zero jobs remain. Details in `next-site/docs/reimagining/LEGENDARY.md`.
- EXACTLY 50 distribution codes are REGISTERED in campaign `immersive-world-2026-10-09`. All 50 were verified with rollback redemption/reuse tests and remain unredeemed. DO NOT REGENERATE.
- Private file: `zackdcook-legendary-codes-private.csv`, saved file ID `libfile_a4526eee5f2c8191821e94729fc943bf`. Local path outside repo: `/workspace/scratch/01235e4bd732/private-legendary/zackdcook-legendary-codes-private.csv`. No plaintext codes in Git, database, logs or frontend assets.
- Fixture cleanup: connector deletion attempts returned `Invalid or expired requestState`; six fixture sessions were cancelled instead. Three consumed fixture verifiers remain in separate fixture campaigns. Original user records were preserved.
- Supabase security advisor has no warning/error findings; only intentional INFO notices for RLS enabled with no browser policies on service-only tables.
- Source now also has a baseline wording/content/route guard and bounded, cancellable viewport cache. Their latest checks are running.

Exact next action: obtain the user's direction for protected-preview access, inspect the existing READY preview, then implement/rollback-test canonical archives and continue visual refinement. No production changes or charges. Do not repeat completed research or regenerate codes.

## Preview / next data milestone — 2026-10-09
- Vercel authenticated account reports active `hobby` billing, default team matching the existing project, and one concurrent build. No plan upgrade or paid feature was activated. Team-level `get_team` still returns 403; do not retry unchanged.
- Existing preview configuration is test-only: Supabase origin and project ref match `qkkgcoejkqvthbjcldcw`, test mode is `true`; production variables were not read or changed.
- First experimental preview is READY: `dpl_9vY4XvcuafzafvG7ZdQRz9a5g4pJ`, `https://zack-cook-efctw1pcq-dove-mack0o-3684.vercel.app`, source SHA `c23b479bb21f637dfadc175576ca96e9c12910f4`, target `null` (API default Preview). Preview write access is now verified. Browser testing remains pending.
- Manual Git-connected deployment succeeded with no explicit teamId/slug and no project-setting changes. In this API, omit `target` for Preview; literal `preview` is rejected with 400. Automatic builds remain disabled to avoid unnecessary deployments during development.
- Planned next architecture (NOT implemented): retain each completed session/visitor/cooldown/effect record, archive all original chunk fields in a checksummed lossless gzip container, and replace raw completed chunks only atomically after round-trip validation. Old drawings need a lazy-compatible path. Render-only simplification must retain original geometry and deterministic mote positions; never simplify canonical artwork. Supabase CLI `2.120.0` migration help was verified. Its empty generated migration placeholder was removed before checkpointing; create a new migration with the CLI when implementing. No new database migration or artwork deletion occurred in this continuation.
- Tests in this continuation: 67/67 unit tests, TypeScript and generated theme checks pass. Deployment READY verifies the current source builds under the configured test Preview environment; browser/API/data/render testing remains blocked, not passed. All 50 distribution codes remain unredeemed, and all 20 original completed test carvings remain present. Repository scan found zero plaintext distribution codes.

## Publishing recovery investigation — 2026-10-09
- Source branch still at `5911625de246110c7fac224a73a7655685928885`, with the previously recorded uncommitted implementation intact. Do not recreate or squash its three experimental commits.
- Existing recovery bundle verified: complete history through `5911625`. The additional `website-publishing-transfer.bundle` outside the repository is a 34,524-byte incremental Git bundle requiring main baseline `be6b15d93f2bae259a52e7b80d98a51018edb01d`; it preserves exact commit objects for importing into an authenticated Git workspace.
- GitHub web write previously succeeded on disposable branch `access-check-2026-10-09-7f3c`, commit `6ca2fc857789605290b4ab2e8df02f67698ca972`. The connector still has no installation returned by `list_installations`; local workspace has no configured Git credential helper or GitHub token. Do not extract browser credentials or mint credentials without explicit approval.
- Existing repository Codespace `cautious-trout-wrq56q47v6j4c94x6` is reachable via the authenticated GitHub browser session. Its existing source is on `spring-clean-2026-10` and must remain untouched. Use a separate temporary bare Git mirror for bundle import/push if terminal authorization succeeds.
- Verified GitHub Free account with remaining included Codespaces usage and a product-level $0 Codespaces budget, `Stop usage: Yes`. No billing setting was changed and no new Codespace was created.
- The transient folder-trust prompt cleared as the existing Codespace reconnected; no trust/security setting was approved or changed. Native `gh auth status` identified Zack's existing GitHub connection, and a Git push dry run succeeded without exposing the token.
- Imported the incremental bundle into a separate bare mirror at `/tmp/zack-experimental-publish.o8jDoO/repository.git`, then pushed ONLY the experimental ref. Remote SHA exactly matches `5911625de246110c7fac224a73a7655685928885`; main remains `be6b15d93f2bae259a52e7b80d98a51018edb01d`. The existing spring-clean Codespace worktree remains clean and unchanged.
- Vercel `get_project({idOrName: "zack-cook"})` works without explicit teamId/slug, as verified in the preceding access task. Preview writes and branch-only environment isolation still require verification; do not deploy blindly.
- Repeatable publishing: create a new incremental Git bundle outside the repository from the last pushed SHA to the experimental branch. Upload it through VS Code's supported file chooser to `next-site`, move that temporary upload immediately into the separate mirror directory, fetch the experimental ref from the bundle, and perform a normal fast-forward push. Verify exact remote SHA, unchanged main, and clean original Codespace. Never force-push, squash, rewrite existing history, copy credentials, or publish a different branch.
- Existing private recovery bundle remains accessible at `/workspace/scratch/01235e4bd732/website-reimagining-checkpoint.bundle`, saved file ID `libfile_e8cf0dc5d8d08191b77ff9f158631473`. Preserve it and create a new recovery bundle at later milestones.
