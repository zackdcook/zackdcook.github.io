# Be Brave tool confirmation and infusion revision — v8

## Final test acceptance

Final application `ee8819142421825840bbf0769c3e57c8e4330df0` is normally pushed to the existing experimental ref. READY Preview `dpl_9uuBrhtEBH5hJYuBFUxvsHUcU3bL` serves the stable test URL: https://zack-cook-git-experiment-be-brave-encha-6d0cb7-dove-mack0o-3684.vercel.app/bebrave . This acceptance supersedes the intermediate pending-publication notes below.

- 390×844: all four caption frames are 84.5×56px at y=502 with exactly 8px gaps. Closed/open cache geometry is identical: x=264.953125, y=382.953125, width/height=111.046875. Knife/cache gap is 12px; cache/caption gap is 8px. All four items remain fully visible. No body/document overflow.
- 320×568: all captions are 67×56px at y=286 with 8px gaps. Closed/open cache remains x=218, y=190, 88×88px, with the knife 12px above. All four remain visible, without page overflow. Artwork proportions retain the earlier relationship and scale together to fit the available height.
- Actual game: preview leaves the server tool choice uncommitted; Unleash reveals rarity. The cache action visibly reads Enter / a code on two lines. The ordinary reveal uses the exact before-fading narration, retains four tools, and has one normal Continue. Unified native code input/Back/Enter and the selected warning tool also pass.
- Final optimized CSS preserves separate scale/translate/rotate resets, eliminating inherited caption enlargement and movement. 160 tests, typecheck, assets/themes, whitespace and the 49-page build pass; only CSS changed after the test run.
- Both own ordinary QA sessions were cancelled, each with zero archive/reward rows. The agent redeemed no distribution code. Final original code-identity/reward/archive digests still match. Concurrent user testing used one ordinary code after the reset (61 usable); that later activity remains intact.

Saved proof shows the synthetic Legendary layout. Its Tools/Back are harness controls; the actual game uses the verified single Continue. No production, protection or infrastructure changes. After publishing these notes, stop the existing cautious-trout Codespace and close its editor. Documentation needs no new application build. Physical-device Safari selection and two-finger pinch remain actual-device checks.

Continues local v7 checkpoint `b6d3bf5585aecb3c167adf67e4ba8e18378ba100` and remote experimental head `2e3c7791c3243c8d6adc09a803d6468afc27869b`. Target remains `experiment/be-brave-enchantments-2026-10-12`; no main merge or production release is authorized.

## User flow

Clicking any ground item previews its description without choosing a server result. Back clears that preview; Unleash its potential commits an ordinary tool and reveals its rarity. Other item names/rarities stay visible, with the revised “The other items speak their names before fading away…” narration and one normal-sized Continue action. All four item labels share a compact, evenly spaced four-column row with separate gaps. Artwork retains the previous arrowhead/nail/key/cache proportions independently of caption widths. Unlocking swaps the cache sprite in its existing display frame; a separate knife display floats directly above that frame, without overlap with its caption. The corrected tool prompt is preserved verbatim in the shared presentation copy.

The lockbox previews in the same scene, with its description and Back / Enter a code (the action breaks after Enter). Code entry has its native alphanumeric field and Back on the left / Enter on the right in the same panel. Successful unlocking restores the exact cache-opening/pocket-knife narration. The timer warning shows the selected, rarity-styled tool in front of the existing trunk scene.

Aura and Infusion are both enabled and visible from the initial workshop. Either may be chosen first. Confirming still requires an explicit aura and infusion. The live X preview uses a centered 2× camera zoom and matching SVG fallback, preserving the compact panel footprint. Its negative compositor offset keeps the X intersection centered in the actual canvas, with a regression test covering phone and desktop surfaces.

| Aura order | Pigment |
| --- | --- |
| Fuchsia | #FF2BD6 |
| Vermillion | #FF7A00 |
| Saffron | #FFF44F |
| Viridian | #39FF14 |
| Celadon | #00F5FF |
| Cerulean | #3D7BFF |

| Infusion row | Left to right |
| --- | --- |
| 1 | Club, Diamond, Heart, Spade, Music note, Music notes |
| 2 | Portleaf, Sun, Flower, Sprout, Clover, Starboardleaf |
| 3 | Lightning, Sparkle, Sparkles, Hydrogendianion, Death, Star |

Picker ordering is separate from the existing seeded-particle array, so changing this presentation does not change older carvings' randomly selected symbols. Stored pigments, symbols, seeds and geometry are retained.

Personal Crimson continues to alternate feather U+1FAB6 and dagger U+1F5E1, now at 1.33× particle radius with seeded radial emission in every quadrant. Every skull U+2620 particle also uses 1.33× radius, including the Canvas painter and monochrome SVG fallback. Particle counts, quality budgets, animation teardown and reduced-effects behavior retain their existing limits.

## One-time test code reset

Zack explicitly requested resetting every Legendary code. An atomic operation on test project `qkkgcoejkqvthbjcldcw` cleared the used marker and owner for the 16 redeemed rows. All 62 existing codes were available immediately after the reset, retaining their original IDs, private verifiers, campaign/effect assignments and creation metadata. There were no disabled codes. Ordinary codes remain single-use after their next redemption; the one existing personal reusable setting remains enabled.

This administrative data reset is deliberately not a deployment migration. No production data/schema/configuration was changed, no distribution CSV or plaintext code was accessed, and old reward rows were retained.

Before/after invariants:

- 62 code identities: `547ef40d2892bc9ea5399f627f339f35` (full rows excluding redemption/disable fields).
- 17 reward rows: `a565221b7d23579bdb3a358c027146db` (complete row digest).
- 53 carving archives: `094afa0c59aa2dc46c54740a2e7a763c` (complete row digest).

Digests use `md5(string_agg(to_jsonb(row)::text, '|' order by primary_key))`, with `id` for codes/rewards and `session_id` for archives. The transaction locked these records for the before/after checks. `tests/legendary-reset.integration.sql` passed in a rolled-back fixture: the same code works again after clearing redemption, the previous reward is unchanged, a separate reward is created for the new session, and the ordinary code becomes single-use again. Browser/foreign-role verifier access remains restricted.

## Verification and publication

146 standard tests plus 14 API/module-mock tests pass (160 total), including opened-cache replacement, separate knife placement, retained item names/rarities, revised narration, centered 2× compositing, initial enabled pickers, requested order with stable archive seeding, particle scaling/radial emission, and existing preservation/security checks. TypeScript, art/themes, optimized Next.js build and whitespace checks pass. React review confirms client-side preview only, guarded confirmation requests, retained busy/ownership checks, accessible names/pressed states, keyboard menu handling, and existing animation cleanup.

Security advisors show only the preexisting service-only RLS-without-policy INFO notices; no new security warning. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy .

Browser control recovered. The existing Codespace was stopped with a clean `spring-clean-2026-10` checkout before resuming. Native preflight independently confirmed the original checkout is clean, the old failed-upload file is absent, the isolated mirror and remote experimental ref are both `2e3c779`, and main is still `75de96bb3ef7a4edf138d07ee313519bb3bb212e`. Publish this descendant normally through the existing mirror, update only the test preview, record the result, and stop/close the Codespace afterward.

Rendered acceptance and final deployment details follow after publication. Physical iPhone Safari selection/pinch still needs actual-device confirmation.

## Latest phone feedback — incorporated before acceptance

Zack’s follow-up keeps the other tools visible instead of animating a fade. The caption row no longer controls artwork sizes, and has explicit 8–16px gaps. The closed/open cache use the same size and position; the knife occupies a separate slot above it. The cache action says Enter / a code on two lines. The synthetic Tools fixture now shares the actual narration so the Legendary composition can be reviewed without redeeming a distribution code.

The preceding v8 live browser review passed description-only preview (session stays tool_select), unified native code input (qa-123 → QA123), Back-left/Enter-right in a 44px-high action row, normal 130×44px Continue, and the selected tool at the timer warning. The unstarted QA session d9a3e3cf-3aff-4218-8478-30aba8ba994b was cancelled, with zero archives/rewards. Workshops at 390×844 and 320×568 exposed all 24 choices with no body/document overflow and Infusion-first selection. The centered X is visibly correct.

Concurrent user testing subsequently added four archives and three rewards and spent one ordinary code. Latest read-only totals are 57 archives, 20 rewards and 61 usable codes; all original 53 archive rows and 17 reward rows retain the before-reset full-row digests above, and all 62 code identities are unchanged. Do not undo the user’s testing or reset codes a second time merely to restore the intermediate count.
