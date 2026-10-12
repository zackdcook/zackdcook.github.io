# Public refinements and live release — 12 October 2026

The requested changes are live at https://zackdcook.com/.

## Release identity

- Production/main and release/immersive-world-2026-10-12: `7e89bb5ab8b8bf2dc14e876318affa5ac7da7487`.
- Application refinement commit: `c5bb37d17c91e08ebc2904370ca350c53da23e4f`; readiness documentation: `d90819140817ab48c443ef6f1322222520d4b742`.
- The release retains both main64ebf8a and the experimental history. Production's book-alert signup, privacy, and analytics implementation had already been incorporated and its subsequent hydration/focus fixes are retained.
- Vercel: `dpl_8fM8MBGvYbsiiYGMmqAgcxidfzhy`, READY, production, built once from main. https://zack-cook-a3izowikb-dove-mack0o-3684.vercel.app/ is the immutable deployment URL.
- The build was staged with automatic domain assignment disabled, checked, then promoted without rebuilding. All seven production aliases now point to this deployment, including the existing redirects. Auto-assignment was restored to its originally enabled value. Protection, credentials, plans and production branch tracking were not changed.
- Rollback remains `dpl_2Tb8ougoNyBk2sRviPGRmukq6MQK` (old main64ebf8a).

## Requested presentation changes

| Request | Implemented behavior |
| --- | --- |
| Shared buttons | Named controls use the Count me in filled-pill material. Dark hover is #25352D living / #302731 felled, darker than the default fill and lighter than the background. |
| Collection labels | Short brass rule restored for Engineer ⇌ Author, Find me at…, BIO1990, Words of Folly and Cool peeps. |
| Heading width | Wide desktop feature/page title rows use the full reading area, with bounded paragraph measures. Named About/Events/Creative Works page titles fit one line on phones; desktop Events introduction uses full width. |
| Cat photograph | Straight, with the opening portrait's radius, light rim and cast-shadow treatment. Kitty discovery is retained. |
| Book Alert | Same navigation underline on hover/focus as ordinary tabs. Dropdown-to-book-dialog focus is retained. |
| Manuscript note | Plain transparent text area, border-left0, padding24px0; all existing stage text/selection preserved. |
| Mobile navigation | Native anchored nonmodal popover: click-away/Escape, 48px rows, bounded scrolling, current-route state, Settings and Book Alert handoffs. |
| Arrival and atmosphere | Home sections match the About paragraph's scroll arrival. All three mote planes have z-index0; page foreground is z-index1 and header is30. No scenery/paper experiment restored. |
| JRPG discovery | Light mode keeps only the inset rim, with the hard offset shadow removed. |
| About flip | No outer rim/shadow; the inactive face is explicitly hidden, including its reflected edge. Doodles keep their natural3:4 shape; Zacky C is regular weight. |
| Authorized copy | The whole pile renamed Pile of leaves; recorded in copy-exceptions.json. Other wording preserved. |

## Verification

- PASS:102 automated tests (96 TypeScript +6 API/controller), authored-copy/routes, typecheck, generated art/themes, whitespace and optimized47-route build. A second local build with the production public origin/main branch/test flags absent also passed. No dependency changes.
- Private Chrome review: desktop plus320×568,390×844 and768×1024 iframe layouts, single-line titles, no horizontal overflow, label rules, native dropdown/Escape/opener focus, Settings/Book Alert handoffs, regular/flipped portrait, keyboard kitty discovery, light/dark and reduced effects.
-320 phone:265px reading area, manuscript title text245.1px; header controls fit20px gutters with48px targets.
-390 dropdown:335×433px, top80px; no fullscreen takeover.
- Live Home photos have identical30px radius and26px/65px cast shadow, rotation none. All mote layers are beneath the foreground.
- Live dark hovered theme control measured RGB37,53,45, default fill #2E4036, background RGB20,31,28.
- Live About: outer pseudo content none / shadow none, hidden front visibility hidden; back330.8×440.6px; name weight400.
- Live revision selection displays the original narwhals wording on a transparent area without the left border.
- Public HTTP checks: tree state200/enabled=true; compact section lookup200/empty legitimate history; QA viewport404; POST test reset404; invalid empty book-signup request400. Staged tree entry/Admire rendered without an application error. No real signup/carving/code consumption was performed.
- Existing production records' aggregate digests and counts match before/after the migration and after live checks. No subscriber, visitor, session, tree-state or stroke changes.
- Physical Safari/touch/low-end GPU acceptance and the original project's complete feature-inventory sign-off remain distinct outstanding work. The explicit inactive-face fix is implemented and Chrome-tested; physical Safari is not claimed tested.

## Production compatibility

Migration `20261012005500 immersive_tree_production_release` is recorded in the production ledger. Exact SQL is `supabase/production/20261012005500_immersive_tree_production_release.sql`, apart from the test migration history.

The additive migration installs service-only Legendary verifiers/rewards, completed-section indexing, and lossless canonical archives. It preserves the existing production create/start cooldown function definitions exactly. It installs no test-reset RPC and constrains the reset watermark to0. Anonymous/authenticated access to privileged operations and archive records is revoked; RLS remains enabled. Security advisors report only intentional service-only RLS-without-policy INFO, with no warning/error.

Production storage remains belqlsqnbexwkpmnptyy; Preview remains qkkgcoejkqvthbjcldcw. Production rejects test flags and any unknown/missing source branch. No environment secrets were pulled or changed.

The previously issued50 Legendary codes remain an isolated test campaign. No new production issuance or test-data copy was performed; production's code registry is empty. Their private plaintext delivery file was not regenerated or read. A future production distribution needs its own explicitly reviewed registration/retirement plan.

Only one Vercel production build was created. No paid settings/resources or extra experimental Preview. Held historical deletion remains untouched. The independent listening/reading worktree remains deferred.
