# Preservation inventory

Source commits and complete route paths are in `baseline-manifest.json`. This is a verification ledger, not a claim that unchanged source has passed end-to-end testing.

| Feature | Source / behavior | Verification status |
| --- | --- | --- |
| Home and authored copy | `app/page.tsx`, `content/editorial.json`, main bio | Automated original-word/copy guard passes; desktop and 320px presentation checked |
| Navigation and legacy URLs | `site-header`, `content/navigation`, Next redirects/rewrites | Routes retained; desktop and native 320px menu/Escape checked; full legacy traversal due |
| Creative Works | active project, progress rings, stage details, project pages | Baseline retained |
| Events | writing group, recurring calendar download, Google Calendar, upcoming events | Calendar tests pass |
| About Me | full authored biography, Zacky C image modal | Baseline retained |
| Words of Folly | physical leaves, brushing, grabbing, reading, feed, copy-feed | Physics/reader tests pass; browser verification pending |
| Kitty secret | editorial photo, ribbon physics, escape confirmation, empty window, tree access | Physics tests and prior desktop keyboard secret flow pass; optional skins preserve geometry |
| Tree introduction | Nothing / Admire / Carve / Chop down, narrative and base cache | Main mechanics retained |
| Carving | anonymous httpOnly cookie, Turnstile, rate limits, tools, hidden rolls, pity, colors, 60 seconds, coalesced pointer samples | Unit rarity tests pass; full DB flow pending |
| Eligibility | five feet since prior completed carving, enforced again at drawing start | SQL source identified; integration tests pending |
| Publication | streamed chunks, deadline enforcement, overdue finalization, one-foot growth, individual sessions, stable overlap order | Source preserved; lossless archive/atomic DB replacement and original-path anchors pass; actual timed publication pending |
| Admire | viewport sections, zoom anchor, parallax, completed strokes | Row-cap-safe pages, bounded cache and archive projections implemented; prior desktop zoom checked; new art / full browser QA due |
| Felling | first strike, confirmation, d4 additional strikes, snapshot cutoff, sideways tree, later stump, regret, reset | Local state retained; browser verification pending |
| Lockbox | code entry, server digest, visitor/network limits, color selection | Legacy Epic retained plus 50 secure one-use Legendary codes and persistent entitlements; real SQL concurrency passes; browser unlock refresh/replay due |
| Test infrastructure | spring-clean bypass and reset; test DB | Strict exact-test/Preview guards and READY Vercel preview verified; real reset interaction due |
| Preferences | light/dark, motion/effects, phone tilt, restore timeline/reset, persistence/bootstrap | Existing preference tests pass |
| Material interaction | shared cursor / opt-in tilt, bounded optical pose, tactile press, ribbon layering | Resting cursor light and stable hit bounds browser checked; idle loop stops in source; physical sensor QA unavailable |
| Shoutouts | static curated entries, optional approved database entries | Neither DB currently has `shoutout_suggestions`; source falls back to static list |
| Private tools | login/OAuth/OTP callbacks, owner gate/admin page | Routes retained; provider configuration unknown |
| Distribution | RSS, social image/share routes, metadata, sitemap, robots, privacy | Source retained; endpoint tests pending |
| Optional newsletter | existing configured external link | Source retained; env configuration unknown |

No content or behavior may be silently removed because it is absent from this initial ledger. Update discoveries and record any baseline failures separately from regressions.
