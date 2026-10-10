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
| Kitty secret | Original caption/photo/empty window/Brave Yes-No/tree access; user-requested bird-shadow trigger replaces ribbon | Random window-route tests pass; deployed keyboard/mouse/reduced/modal checks pending. Two obsolete ribbon instructions explicitly excepted. |
| Tree introduction | Nothing / Admire / Carve / Chop down, narrative and base cache | Main mechanics retained |
| Carving | anonymous httpOnly cookie, Turnstile, rate limits, tools, hidden rolls, pity, colors, 60 seconds, coalesced pointer samples | Rarity tests pass; actual Legendary mouse/stream/timer/color DB flow passes; ordinary tools/touch QA due |
| Eligibility | five feet since prior completed carving, enforced again at drawing start | Actual post-publication cooldown persists after refresh; create/resume DB gate rejects visitor; start logic retained |
| Publication | streamed chunks, deadline enforcement, overdue finalization, one-foot growth, individual sessions, stable overlap order | 21 originals restored exactly after backfill; actual timed publication 22 automatically archives and renders saved effect; individual records retained |
| Admire | viewport sections, zoom anchor, parallax, completed strokes | Actual archived-carving scroll/zoom/reset and offcamera effect sleep pass; broader responsive/art refinement due |
| Felling | first strike, confirmation, d4 additional strikes, snapshot cutoff, sideways tree, later stump, regret, reset | Actual fd789 browser return-home/persistence/reachable sideways Admire/canonical inspection/Back/stump/regret/preferences reset pass. |
| Lockbox | code entry, server digest, visitor/network limits, color selection | 50 distribution codes remain unused; actual SQL concurrency and disposable browser redemption/refresh/replay/nonempty consumption pass |
| Test infrastructure | spring-clean bypass and reset; test DB | Strict exact-test/Preview guards and READY Preview verified; browser reset restores eligibility and retains carving/identity/reward history |
| Preferences | light/dark, motion/effects, phone tilt, restore timeline/reset, persistence/bootstrap | Existing preference tests pass |
| Material interaction | shared cursor / opt-in tilt, bounded optical pose, tactile press, ribbon layering | Resting cursor light and stable hit bounds browser checked; idle loop stops in source; physical sensor QA unavailable |
| Shoutouts | static curated entries, optional approved database entries | Neither DB currently has `shoutout_suggestions`; source falls back to static list |
| Private tools | login/OAuth/OTP callbacks, owner gate/admin page | Routes retained; provider configuration unknown |
| Distribution | RSS, social image/share routes, metadata, sitemap, robots, privacy | Source retained; endpoint tests pending |
| Optional newsletter | existing configured external link | Source retained; env configuration unknown |

No content or behavior may be silently removed because it is absent from this initial ledger. Update discoveries and record any baseline failures separately from regressions.

## New main addition and revised discovery (2026-10-10)

Source main 64ebf8a: exact book-release invitation and promise; email submission; home-only dismissal; Book Alert menu dialog; accepted subscription hides both entry points; versioned independent choices and cross-tab sync; analytics opt-out retained through appearance/tree reset; exact updated Privacy copy/footer link. Signup remains server-only, normalized/idempotent and rate/challenge protected; it sends no email. Preview uses isolated test storage, gated Cloudflare bypass and disabled analytics. Source checks and actual browser results passed for this milestone; see BROWSER_VERIFICATION.md.

Requested kitty discovery revision: full side-to-side random recurring window crossings; no resting shadow between flights (keyboard/reduced-effects stationary alternative retained); clicking opens original Yes/No indefinitely without backdrop dismissal; changed photograph has no shadow overlay. Caption retains exact original label. No extra site copy.
