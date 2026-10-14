# Be Brave tool confirmation and infusion revision — v8

Continues local v7 checkpoint `b6d3bf5585aecb3c167adf67e4ba8e18378ba100` and remote experimental head `2e3c7791c3243c8d6adc09a803d6468afc27869b`. Target remains `experiment/be-brave-enchantments-2026-10-12`; no main merge or production release is authorized.

## User flow

Clicking any ground item previews its description without choosing a server result. Back clears that preview; Unleash its potential commits an ordinary tool and reveals its rarity. Other item names/rarities remain briefly visible and fade away, with the requested farewell narration and one normal-sized Continue action. All four item labels share a fixed-height, evenly spaced four-column row. The corrected tool prompt is preserved verbatim in the shared presentation copy.

The lockbox previews in the same scene, with its description and Back / Enter a code. Code entry has its native alphanumeric field and Back on the left / Enter on the right in the same panel. Successful unlocking restores the exact cache-opening/pocket-knife narration. The timer warning shows the selected, rarity-styled tool in front of the existing trunk scene.

Aura and Infusion are both enabled and visible from the initial workshop. Either may be chosen first. Confirming still requires an explicit aura and infusion. The live X preview uses a centered 2× camera zoom and matching SVG fallback, preserving the compact panel footprint.

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

Zack explicitly requested resetting every Legendary code. An atomic operation on test project `qkkgcoejkqvthbjcldcw` cleared the used marker and owner for the 16 redeemed rows. All 62 existing codes are now available, retaining their original IDs, private verifiers, campaign/effect assignments and creation metadata. There were no disabled codes. Ordinary codes remain single-use after their next redemption; the one existing personal reusable setting remains enabled.

This administrative data reset is deliberately not a deployment migration. No production data/schema/configuration was changed, no distribution CSV or plaintext code was accessed, and old reward rows were retained.

Before/after invariants:

- 62 code identities: `547ef40d2892bc9ea5399f627f339f35` (full rows excluding redemption/disable fields).
- 17 reward rows: `a565221b7d23579bdb3a358c027146db` (complete row digest).
- 53 carving archives: `094afa0c59aa2dc46c54740a2e7a763c` (complete row digest).

Digests use `md5(string_agg(to_jsonb(row)::text, '|' order by primary_key))`, with `id` for codes/rewards and `session_id` for archives. The transaction locked these records for the before/after checks. `tests/legendary-reset.integration.sql` passed in a rolled-back fixture: the same code works again after clearing redemption, the previous reward is unchanged, a separate reward is created for the new session, and the ordinary code becomes single-use again. Browser/foreign-role verifier access remains restricted.

## Verification and publication

145 standard tests plus 12 API/module-mock tests pass (157 total), including initial enabled pickers, requested order with stable archive seeding, particle scaling/radial emission, and existing preservation/security checks. TypeScript, art/themes, optimized Next.js build and whitespace checks pass. React review confirms client-side preview only, guarded confirmation requests, retained busy/ownership checks, accessible names/pressed states, keyboard menu handling, and existing animation cleanup.

Security advisors show only the preexisting service-only RLS-without-policy INFO notices; no new security warning. Reference: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy .

Browser control recovered. The existing Codespace was stopped with a clean `spring-clean-2026-10` checkout before resuming. Native preflight independently confirmed the original checkout is clean, the old failed-upload file is absent, the isolated mirror and remote experimental ref are both `2e3c779`, and main is still `75de96bb3ef7a4edf138d07ee313519bb3bb212e`. Publish this descendant normally through the existing mirror, update only the test preview, record the result, and stop/close the Codespace afterward.

Rendered acceptance and final deployment details follow after publication. Physical iPhone Safari selection/pinch still needs actual-device confirmation.
