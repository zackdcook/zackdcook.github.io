# Blade enchantment — test revision v6

Continues application v5 on `experiment/be-brave-enchantments-2026-10-12`. Production cutover is still pending Zack's review.

The cache prompt presents No, then Yes. The idle keypad sentence and successful-cache story are removed. The brief knife reveal has an orange aura and 23 independently timed sparkles versus Epic's five.

The next screen is a single blade workshop: “Enchant the blade.”, an animated X against bark, editable color swatches, then monochrome symbol choices. Back and Enchant stay below the selection area. It shares the real carving renderer, adaptive budgets and motion preferences. Personal Crimson uses a fixed dagger; other cache rewards offer 13 colors and the original 18 symbols. Hearts default to hearts unless explicitly changed; rainbow keeps its prismatic treatment.

TEST migration `20261013173514_bebrave_blade_enchantment.sql` adds nullable `chosen_symbol`, an owned-session atomic selection RPC and a compatible section reader. The API and public/detail payloads preserve the selection after publishing and refreshing. Both new functions are restricted to service_role; session RLS is retained. The original 50 distribution codes still contain one reusable personal code. Its effect catalog now describes monochrome U+1F5E1 daggers. No existing verifier or archive was rewritten.

Common is #F3E7CB at render time, including old Common carvings. Purple/Violet is excluded from new rolls and workshop choices. All six Uncommon pigments exceed 3:1 against sampled median bark and 10.8:1 against their continuous dark engraved edge; the paired light/dark edge preserves separation across textured patches. Exact audit: `qa/blade-v6-palette.json`. This is a texture audit, not a blanket accessibility certification.

Drawing alone disables selection and WebKit long-press callouts throughout its containing page, clears stray selection and cancels selection/context-menu events. Cleanup restores normal browsing. Real iPhone Safari still needs physical-device confirmation.

Verification before deployment: 141 standard tests, 11 API/module-mock tests, TypeScript, generated art/themes, optimized build and whitespace checks passed. `tests/blade-enchantment.integration.sql` passed in a rolled-back service-role transaction: selection/reselection, ownership, unavailable purple/symbol rejection, personal dagger enforcement, ordinary-tool rejection and drawing/completed immutability. Security advisors reported only existing service-only RLS-without-policy INFO notices: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy . All 48 preexisting archives retain digest `6d1707310b63f1e995636b013b250ad3`.

Deployment and actual-browser acceptance are recorded below after the review build is available. No comparison videos are created.
