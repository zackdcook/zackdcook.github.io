# Website reimagining checkpoint

Updated: 2026-10-09 UTC. Status: audit and baseline in progress, no redesign completion claimed.

## Source and isolation
- Experimental branch: `experiment/immersive-world-2026-10-09`.
- Latest relevant commit / original main baseline: `be6b15d93f2bae259a52e7b80d98a51018edb01d`.
- Tree/test reference: `spring-clean-2026-10` at `cd697eb1b6a756d74b4eee16ac3ec096ce80eb50`.
- Repository: `zackdcook/zackdcook.github.io`; application directory: `next-site`.
- Test Supabase: `qkkgcoejkqvthbjcldcw` (`zackdcook-test`). Organization plan verified free.
- Production Supabase: `belqlsqnbexwkpmnptyy`. Read-only table metadata inspected; never modify.
- Vercel project: `prj_AcuTfmUBydayvETed53KCREnlONa`, account `team_NSAGsSQupndjz84vjnupVkVK`.
- Automatic Vercel builds are disabled for this experimental branch in `vercel.json` and `next-site/vercel.json` until preview environment isolation and free plan are verified. Other branch settings are unaffected.

## Completed
- Verified remote branch heads and cloned the repository; local branch is based on main.
- Compared all 12 branch differences. Main already incorporates the later production tree visual/control improvements. Selectively port spring-clean test helpers and controls; do not replace main's improved control rail or newer authored bio.
- Installed exact locked dependencies, without lifecycle scripts. Baseline 46 tests pass. Typecheck/build underway.
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
- Vercel plugin lists the project but project/env/team inspection returns HTTP 403: not authorized under scope `dove-mack0o-3684`. No local Vercel CLI/token/auth file exists. Do not retry unchanged, create substitute resources, deploy blindly, or read production secrets.
- Vercel plan, preview env scoping/values, test HMAC settings, and Cloudflare dashboard settings remain unverified. Existing source bypass may be ported with strict test-project guards. A connection with access to the actual project is needed for preview configuration and deployment.
- Cloudflare plugin discovery returned no usable connector. Dashboard fallback requires user approval if resolving an available plugin's failure.
- No exact Work usage counter is exposed. Save coherent milestones; no background continuation between sessions.

## Next tasks (ordered)
1. Complete audit, run baseline build, commit this checkpoint to experimental branch safely with builds disabled.
2. Observe inspiration-site scrolling/navigation; record focused art, color, motion and architecture decisions.
3. Integrate strict test isolation and reset controls without reverting production tree refinements.
4. Implement cohesive four-theme site redesign, preserving wording and every inventoried feature.
5. Implement and test compact strokes, bounded loading/rendering, and atomic Legendary redemption.
6. Register exactly 50 secure codes only when verifier configuration is durable and usable; deliver privately, never in this repository.
7. Browser QA across devices/preferences, security and performance verification; resolve Vercel access and configure branch-only test envs before enabling preview builds.

Exact next action: finish the baseline checks and persist the first checkpoint; then continue source audit and integration. Research and changes remain incomplete. No database mutations or production changes have been made.
