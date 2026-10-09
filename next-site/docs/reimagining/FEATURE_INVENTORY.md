# Preservation inventory

Source commits and complete route paths are in `baseline-manifest.json`. This is a verification ledger, not a claim that unchanged source has passed end-to-end testing.

| Feature | Source / behavior | Verification status |
| --- | --- | --- |
| Home and authored copy | `app/page.tsx`, `content/editorial.json`, main bio | Baseline retained; automated copy guard planned |
| Navigation and legacy URLs | `site-header`, `content/navigation`, Next redirects/rewrites | Baseline retained |
| Creative Works | active project, progress rings, stage details, project pages | Baseline retained |
| Events | writing group, recurring calendar download, Google Calendar, upcoming events | Calendar tests pass |
| About Me | full authored biography, Zacky C image modal | Baseline retained |
| Words of Folly | physical leaves, brushing, grabbing, reading, feed, copy-feed | Physics/reader tests pass; browser verification pending |
| Kitty secret | editorial photo, ribbon physics, escape confirmation, empty window, tree access | Physics tests pass; secret flow pending |
| Tree introduction | Nothing / Admire / Carve / Chop down, narrative and base cache | Main mechanics retained |
| Carving | anonymous httpOnly cookie, Turnstile, rate limits, tools, hidden rolls, pity, colors, 60 seconds, coalesced pointer samples | Unit rarity tests pass; full DB flow pending |
| Eligibility | five feet since prior completed carving, enforced again at drawing start | SQL source identified; integration tests pending |
| Publication | streamed chunks, early finish, overdue finalization, one-foot growth, individual sessions, stable overlap order | Audit in progress |
| Admire | viewport sections, zoom anchor, parallax, completed strokes | Audit in progress; raw-chunk row-cap risk identified |
| Felling | first strike, confirmation, d4 additional strikes, snapshot cutoff, sideways tree, later stump, regret, reset | Local state retained; browser verification pending |
| Lockbox | code entry, server digest, visitor/network limits, color selection | Existing multi-use Epic system to evolve into requested Legendary system |
| Test infrastructure | spring-clean bypass and reset; test DB | Test DB confirmed, env access blocked |
| Preferences | light/dark, motion/effects, phone tilt, restore timeline/reset, persistence/bootstrap | Existing preference tests pass |
| Material interaction | pointer light, idle fade, tactile hover/press, tilt, ribbon layering | Existing tests pass |
| Shoutouts | static curated entries, optional approved database entries | Neither DB currently has `shoutout_suggestions`; source falls back to static list |
| Private tools | login/OAuth/OTP callbacks, owner gate/admin page | Routes retained; provider configuration unknown |
| Distribution | RSS, social image/share routes, metadata, sitemap, robots, privacy | Source retained; endpoint tests pending |
| Optional newsletter | existing configured external link | Source retained; env configuration unknown |

No content or behavior may be silently removed because it is absent from this initial ledger. Update discoveries and record any baseline failures separately from regressions.
