# Be Brave refinement v2 — deployed test, visual QA limited

Application `77e339d75dd101534833d99ad588faba75663897` is READY on Vercel Preview `dpl_5SJpuCJhxuWBaHQpRqBJU3Shzqhx`.

- Stable test: https://zack-cook-git-experiment-be-brave-encha-6d0cb7-dove-mack0o-3684.vercel.app/bebrave
- Immutable source deployment: https://zack-cook-c1jeuar5n-dove-mack0o-3684.vercel.app
- The existing experimental alias was moved from `dpl_4WRbaStv9CowGa6Lo9EFGyRjWJP8` to this READY test deployment and rechecked.
- Production remains `dpl_4Uzwt4ELBoYd8ckmEAR1jkQP7PqQ` / main `75de96bb3ef7a4edf138d07ee313519bb3bb212e`.

## Changes

The About menu now has a generated photoreal moss foreground with heavier coverage, transparent openings, miniature stems, and filament texture. The JRPG panel and its text remain underneath. Instagram is spelled out; only `privacy.` is emphasized in the Privacy heading.

Superior and Epic now have a visibly breathing broad aura and traveling bands of energy along the continuous carving path. Epic's motes and sparks are larger, move farther from the bark, curl, twinkle, and fade on varied seeded schedules. SVG particle transforms use their own fill boxes rather than the enormous tree view box. Published effects start running immediately, then the visibility observer pauses offscreen work. Common/Uncommon remain without glow or particles. Reduced-motion/effect choices remain respected.

The live renderer updates the additional aura path and special particle shape, timing, radius, and motion while drawing. Saved renderers use the same versioned effect IDs and existing deterministic anchors. Unknown old IDs still fall back to the original will-o-wisp effect. Blood color is enforced on the owned Legendary session at the color endpoint and in rendering; other rarities retain their chosen colors.

Phone tilt enrollment is installed in the initial head script before hydration. It catches the first trusted pointer release or click anywhere on the page, coalesces permission requests with Settings, respects saved denial/opt-out and reduced motion, and hands a fresh initial pose to the actual light painter. The first valid pose lights immediately; subsequent movement remains smoothed. No sensor readings are persisted or transmitted. Safari's real user-activation requirement remains; this cannot request permission on passive page load. Reference: https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static

Admire lets scenery move fully out of the viewport before starting the long blue → purple → black transition. A full-height tree keeps the original parallax rates; short histories adjust exit timing so night never starts while scenery is still in the camera. Black is reached at the oldest mark.

## Legendary code assignments

These are three **existing, unused distribution codes**, identified by the `identifier` field of the original private code CSV. No plaintext codes were read or printed, and no distribution codes were regenerated or redeemed.

| Identifier | Stored effect ID | Stored description |
| --- | --- | --- |
| `0404b4f9-9f26-4280-b17d-f4f3d1072268` | `hearts-v1` | Enchanted aura with glowing heart particles that lift, flutter, and softly fade. |
| `06a85577-2e49-40c5-a11e-e6e9cfa764e4` | `rainbow-v1` | A flowing rainbow carving and aura with prismatic motes and sparkling energy trails. |
| `07044491-c802-45f6-9160-5503d1b1cb6d` | `blood-v1` | Crimson red strokes with a pulsing black aura and falling dark red blood droplets. |

Assignments are in test Supabase `private.bebrave_legendary_codes.effect_id`; descriptions are in the related `private.bebrave_legendary_effects.description`. The additive catalog migration is `supabase/migrations/20261013022800_bebrave_legendary_effect_catalog.sql`. Code assignment was a separately guarded test-only update of exactly three available rows; it is not an automatic production data migration.

Final checks: all 50 distribution codes remain unused; verifier/redemption digest is unchanged at `f685d14daa3eb8c881df929ecff15505`. Existing 43 archives remain unchanged, digest `263d2f99a34b652ed4f1dead70785779`. The private tables retain RLS and have no anonymous select grants. No production schema, data, secret, protection, or environment was changed.

## Home graphic and browser icons

- Shared original Home/header Z geometry: `lib/brand-mark.ts` (`BRAND_MARK_PATH`). Both actual Home links now reference this exact path.
- Standalone transparent black SVG: `public/images/brand/home-mark.svg`.
- Adaptive black/white browser-tab SVG: `app/icon.svg` and `public/images/brand/tab-mark-v2.svg`. Its own browser media query determines black or white; website theme changes no longer replace it.
- Transparent Home-palette gradient: `public/images/brand/favicon-gradient-v2.svg`, its 32px PNG, `app/favicon.ico`, and `public/images/brand/apple-gradient-v2.png`.
- Generator: `node --import tsx scripts/build-brand-icons.mts`.

The old boxed `app/icon.png` was removed so file-convention metadata cannot reintroduce the bordered icon. PNG output has alpha, with a transparent corner; SVG output contains only the glyph, with no background rectangle or border. The gradient uses the Living Light accent, pink, sunlight, foliage, and chrome palette across the whole Z.

## Verification and publication limits

117 standard tests and 8 module-mock tests pass: **125 total**. Asset checks, theme checks, TypeScript, optimized Next build, and whitespace checks pass. Added coverage tests pre-hydration permission/pose handoff, denial/opt-out, each Legendary's archive round trip and particle identity, correct night-transition timing, and server enforcement of crimson only for an owned blood Legendary.

The browser's upload request hung, and its subsequent documentation/recovery/reset calls timed out. Fresh deployed visual QA, real iPhone/Safari motion behavior, and live drawing/publication of the new Legendary variants could not be completed. The earlier v1 screenshots are not proof of these revised visuals. The guarded `/test-bebrave` harness now has an Enchantments scenario to review Superior, Epic, hearts, rainbow, and blood without database writes once browser control is available.

Publication was completed through Vercel's supported source-file API using all 343 tracked source files from application `77e339d` (11,125,561 bytes), not by rebuilding the older GitHub branch. The deployment is READY and the stable test alias resolves to it. The source listing's 181 visible file hashes match the supplied snapshot, including both carving renderers, phone-tilt startup code, and `app/icon.svg`; the connector truncates deeper directory listings for the other 162 files. Protected HTTP access redirects to Vercel SSO, and the connector cannot obtain its temporary access link (403 on the aliases endpoint). Protection was kept intact.

GitHub synchronization is **unfinished**: the integration rejects Git-object writes with 403, and the native authenticated browser path is unavailable. Remote experimental branch still points to `b74c0d5`; local application commit is `77e339d`. The deployed Vercel source snapshot is the current tested application. Do not rebuild the remote branch as though it already contains v2.

The resumed cautious-trout Codespace's final stopped state could not be verified through the failed browser service. No local preview server was started. Before resuming native Git work, inspect `/workspaces/zackdcook.github.io/next-site/enchantments-v2.bundle`: the stalled upload may have left this one untracked bundle. Move only that verified bundle outside the original checkout, preserving all other work.

## Continuation checks — 2026-10-13 10:13 UTC

The requested continuation rechecked the existing artifacts without changing application code, deployments, database rows, or production configuration.

- Vercel reports `dpl_5SJpuCJhxuWBaHQpRqBJU3Shzqhx` READY. The stable experimental alias still resolves to this exact deployment and its application snapshot `77e339d`.
- Remote main is still `75de96bb3ef7a4edf138d07ee313519bb3bb212e`; the latest production deployment remains READY `dpl_4Uzwt4ELBoYd8ckmEAR1jkQP7PqQ`. Remote experimental Git remains `b74c0d5`.
- All three assigned Legendary codes are available, with the expected versioned IDs and stored descriptions. All 50 distribution codes are still unused.
- The test archive now contains 44 completed carvings. Sequence 44 is a cyan (`#00F5FF`) Superior, archived at `2026-10-13T10:02:52.414954Z`, with 444 points in 12 chunks and a retained effect seed. It was already present when this continuation inspected the database; no carving or test fixture was created by these checks. The previous 43 archived sessions are still present. Every one of the 44 compressed payloads matches its stored SHA-256 checksum. These database checks establish saved geometry and publication, not visual animation or refresh behavior.
- The existing logs confirm 117 standard and 8 module-mock tests passed for the unchanged application. They were not rerun because no application source changed.
- Browser documentation recovery again timed out after 300 seconds. No fresh screenshots, live browser assertions, or Codespace state could be obtained; the visual acceptance and shutdown items remain open.
- The connected GitHub plugin reports no installed app accounts or installations. Repository metadata reports the owner's push permission, but that does not establish the connector's write scope. The earlier Git-object writes returned 403; no denied mutation was retried through another endpoint, and no credential was extracted. Local Git has no configured credential helper.
- The incremental recovery bundle was verified against its prerequisite `b74c0d5`. It is refreshed after this documentation commit and includes the complete local descendant history. Import and push it normally through the existing authenticated mirror when native browser access returns. Do not reset or overwrite the original Codespace checkout or concurrent remote work.

## Next steps

1. Review the READY test on the actual iPhone, including animated Superior/Epic and the Enchantments fixture. Check reduced-effects/device-motion settings if motion is intentionally resting.
2. Restore browser control, synchronize the local commits normally through the existing Git mirror, preserve any concurrent changes, confirm the original checkout, and stop the resumed Codespace.
3. After Zack's test acceptance, integrate reviewed source into main, apply the additive effect catalog in production, and explicitly transfer these three effect assignments only after verifying the corresponding production identifiers. Keep production Turnstile and production Supabase; build a new production-configured artifact rather than promoting this test artifact.

## Moss asset provenance

Project asset: `public/images/about-moss-real-v2.webp`, 1200 × 600, alpha retained. Created with the built-in image-generation tool, then resized/encoded for delivery without changing its artwork. The selected generated PNG is retained in the session's `generated_images` directory.

Final prompt:

> Use case: photorealistic-natural. Asset: transparent foreground moss overlay for a horizontal website game-menu button. One horizontal 2:1 cutout of extremely realistic cushion moss and tiny feather moss, intricate miniature stems and dense velvet filament tips, damp olive green, deep forest green and restrained golden-green highlights. Irregular growth covers about 65 percent of the rectangle: a thick rounded mound from upper-left reaches into central-left; a larger lopsided bank from the right covers most of the right half diagonally; thinner lower and upper edge growths connect the masses. Leave irregular transparent openings through center-left and lower-left for glimpses of underlying menu lettering. Like real moss reclaiming a neglected object, not leaves, ivy, vines, a wreath, or tidy frame. Natural organic edge spill, realistic depth, soft light from upper-left, tiny natural contact shadows. Truly transparent background and holes. No object, bark, rocks, menu, lettering, border, graphic frame, white/black backdrop, watermark, or visible checkerboard. Photographed real moss to juxtapose against a stylized menu when composited.
