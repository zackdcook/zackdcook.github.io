# Website reimagining checkpoint

Updated: 2026-10-09 UTC. Status: first source implementation milestone; visual overhaul and backend integration incomplete.

## Source and isolation
- Experimental branch: `experiment/immersive-world-2026-10-09`.
- Latest recorded checkpoint commit: `90de8430d6fddfde61858817350164d483d62b9a`. Use `git log -1` for the commit containing this update.
- Original main baseline: `be6b15d93f2bae259a52e7b80d98a51018edb01d`.
- Tree/test reference: `spring-clean-2026-10` at `cd697eb1b6a756d74b4eee16ac3ec096ce80eb50`.
- Repository: `zackdcook/zackdcook.github.io`; application directory: `next-site`.
- Test Supabase: `qkkgcoejkqvthbjcldcw` (`zackdcook-test`). Organization plan verified free.
- Production Supabase: `belqlsqnbexwkpmnptyy`. Read-only table metadata inspected; never modify.
- Vercel project: `prj_AcuTfmUBydayvETed53KCREnlONa`, account `team_NSAGsSQupndjz84vjnupVkVK`.
- Automatic Vercel builds are disabled for this experimental branch in `vercel.json` and `next-site/vercel.json` until preview environment isolation and free plan are verified. Other branch settings are unaffected.

## Completed
- Verified remote branch heads and cloned the repository; local branch is based on main.
- Compared all 12 branch differences. Main already incorporates the later production tree visual/control improvements. Selectively port spring-clean test helpers and controls; do not replace main's improved control rail or newer authored bio.
- Installed exact locked dependencies, without lifecycle scripts. Baseline 46 tests, typecheck, and production build pass (43 routes; no backend credentials).
- Current 60 tests pass, including four palette contrast checks, compact stroke round-trips, pagination beyond REST row caps, and environment isolation.
- Centralized four palettes in `next-site/design/themes.json` and semantic aliases in `design/semantic-roles.css`. `npm run themes:build` generates `app/theme.css`; `themes:check` detects drift. Removed superseded root color declarations; further component art cleanup remains.
- Ported spring-clean test bypass/reset with strict exact-test-project and nonproduction guards. Experimental preview builds fail closed if pointed at another database. Local unconfigured visual builds are allowed.
- Added lossless delta/varint point transport with high-precision legacy fallback, bounded chunk reconstruction, 12-session endpoint pages, and revision-keyed client caches. Canonical database storage and scale benchmarks remain unfinished.
- Inventoried source routes and content hashes in `next-site/docs/reimagining/baseline-manifest.json`.
- Both databases contain the six Be Brave tables with RLS enabled. Test has existing sessions/carvings to preserve; no code records currently registered.
- Supabase changelog reviewed through 2026-10-06. Existing code uses Supabase SSR (not deprecated framework adapters).

## Decisions / research
- Preserve exact content from main and existing tree gameplay: 60-second timer, 5-foot growth eligibility, one foot per completed nonempty carving, pity rarity progression, earlier sessions visually above newer sessions, local-only felled timeline.
- Existing stack: Next 16.3.8, React 19.3.0, TypeScript; retain stable systems while decomposing large interaction components.
- Existing viewport sections are 864 world units; five nearby sections load, but endpoint reconstructs raw chunks, can hit REST row caps, and fetches all pages. Add compact canonical completed records and bounded viewport render projections without flattening visitor identity or stroke order.
- Existing cache redemption is configurable multi-use and grants Epic. Replace with globally single-use Legendary rewards, stable IDs, server verifiers, atomic consumption, persistent entitlement and effect mapping; test using disposable fixtures rather than consuming the 50 distribution codes.
- Supabase Free: 500 MB database, 5 GB egress, 1 GB storage, two active projects. Use existing test project, no new paid resources.
- Vercel `git.deploymentEnabled` supports disabling an individual branch (official project-configuration/git-configuration docs).

## Blockers
- GitHub read access works, but connector `github_create_tree` returns HTTP 403 (resource not accessible by integration). Local git push has no credentials. Experimental branch and commits are LOCAL ONLY until write access is repaired. Save a private recovery bundle as an interim durable checkpoint.
- Vercel plugin lists the project but project/env/team inspection returns HTTP 403: not authorized under scope `dove-mack0o-3684`. No local Vercel CLI/token/auth file exists. Do not retry unchanged, create substitute resources, deploy blindly, or read production secrets.
- Vercel plan, preview env scoping/values, test HMAC settings, and Cloudflare dashboard settings remain unverified. Existing source bypass may be ported with strict test-project guards. A connection with access to the actual project is needed for preview configuration and deployment.
- Cloudflare plugin discovery returned no usable connector. Dashboard fallback requires user approval if resolving an available plugin's failure.
- No exact Work usage counter is exposed. Save coherent milestones; no background continuation between sessions.
- Cloud browser can inspect reference sites but cannot reach the workspace's localhost server (connection refused). Local HTTP and build verification are possible; changed-site browser/visual QA awaits a reachable preview.

## Next tasks (ordered)
1. Save this source milestone and recovery bundle; finish current typecheck and generated-token check.
2. Implement additive Legendary schema/functions in the TEST database, persistent one-use entitlements and secure code verifiers; test rollback fixtures and concurrency before issuing 50 codes.
3. Complete compact canonical storage and spatial indexing, bounded cache behavior and meaningful scale tests.
4. Record design/reference research and implement cohesive site/tree art direction; preserve all authored wording with a regression guard.
5. Check all original features and new systems; complete production build and visual refinement.
6. Register exactly 50 secure codes only when verifier configuration is durable and usable; deliver privately, never in this repository.
7. Browser QA across devices/preferences, security and performance verification; resolve Vercel access and configure branch-only test envs before enabling preview builds.

## Legendary milestone (before applying the migration)
- Latest foundation commit: `1bffa64` (full SHA in Git). Recovery bundle has been saved privately because GitHub writes are blocked.
- Implemented source for one-time Legendary verifiers, bounded lockbox input, service-only atomic redemption, persistent reward records, future code/effect mapping, and default `will-o-wisp-v1` live/published SVG treatment. These are NOT yet database/browser verified.
- Migration: `next-site/supabase/migrations/20261009030640_bebrave_legendary_unlocks.sql`. Existing Epic cache codes remain supported. Legendary is never an ordinary tool roll.
- Reward semantics: redemption is permanently consumed; reward is attached to the anonymous visitor, retained through empty/cancelled attempts, and spent only by the next completed nonempty carving. Normal 5-foot eligibility is retained. Test reset now preserves identity and historical records using an eligibility watermark.
- Discovered baseline SQL tier thresholds were 50/30/15/5 while TypeScript intended 42/35/18/5. The test migration aligns SQL with the intended distribution.
- Existing lockbox narrative is preserved verbatim, including its numeric-keypad description; keyboard/touch input now also accepts the required alphanumeric codes.

Exact next action: apply and verify the Legendary migration ONLY in `qkkgcoejkqvthbjcldcw`, then run rollback integration tests and concurrent redemption fixtures. No database mutations or production changes have been made at this checkpoint. No distribution codes have been generated or registered, no remote branch exists yet, and no working preview has been deployed. Continue from this state rather than repeating the audit.
