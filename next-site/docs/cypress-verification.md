# Living cypress verification

This is the isolated `feature/living-cypress` preview and draft PR #8, not a production promotion. The published baseline remains `main` at `e76fe250853b4e77fb78bd46a3a0a4f7b5eff46d`.

## Local verification on October 2, 2026

- `npm test`: 28 passed, 0 failed. The migration ran in real PostgreSQL with PGlite, rather than a mocked database.
- Concurrent overlapping reservation requests secure only one footprint. A different browser identity cannot finalize a hold.
- Approval preserves a valid originally reserved location after growth advances the writable frontier. Approval is idempotent; guest numbers and growth are monotonic.
- Rejection and expiry release reserved bark without publishing an entry. Anonymous/authenticated roles cannot read private queues/security tables or call placement RPCs. All seven new tables have RLS enabled.
- Email notifications have a transactional cap of 20 per day. Repeated notification attempts do not spend additional quota.
- Numeric ink masks preserve thin lines and dots and leave empty spaces available. Oversized and executable vector input is rejected.
- A frozen guest-number cutoff excludes later approvals without changing the earlier carving's coordinates or geometry.
- Local timeline tests cover all four possible strike counts, an unfinished roll surviving reload, reset, invalid persisted values, a frozen final cutoff, and rigid standing-to-fallen coordinate conversion.
- `npm run build`: succeeded with TypeScript, Next.js 16.3.8 Cache Components, Partial Prefetching, and 48 prerendered routes. The final visual corrections also passed a production build.
- Production HTTP checks: `/tree`, `/api/tree?snapshot=1`, `/api/tree?cutoff=0&section=0`, and `/tree/entries?cutoff=0` returned successfully. Invalid cutoffs and attempts to place in a frozen snapshot returned 400.
- Bark, knots and scars depend on permanent section IDs, not mounted sibling order, guest totals or viewport position. Horizontal exploration rotates the same world rather than generating another layout.

## Deployed browser checks

The complete addendum was checked at runtime commit `92f8db02822ef2895d5204d23a4ac5b9e4ea0384`. Final runtime commit `847f91d1b10cc12ae63c9b0a0195d0d3bf825ccc` was reported Ready by Vercel and checked again in the deployed browser. Follow-up corrections place cut-base artwork behind the original bark/carvings, remove the inapplicable empty-tree invitation from the fallen scene, extend reflection to remaining controls, and put preferences on its own footer row.

- All six homepage section headers resolve to the same 600-weight, 11px DM Sans treatment and letter spacing.
- Main portrait: 8px Dark Khaki border. Cat portrait: 8px Light Coral border. The kitty ribbon has the exact requested text and Light Coral lettering.
- Sustained native keyboard arrow input on the ribbon revealed the cats' escape invitation. No dismissed the invitation and stayed on Home; Yes navigated to `/tree`. The future empty-window photo is explicitly labeled as a placeholder, not simulated as a supplied photograph.
- Explicit Home navigation settled at scroll Y=0. Browser Back returned to the Creative Works scroll position, Y=936, after restoration completed.
- Changing writing stages preserved identical SVG document coordinates and dimensions (253.328125px square in the desktop check). Dots are fixed circle geometry, not dashed SVG strokes. The revision note ends with the requested period and identifies the current zeroth draft.
- `/tree` displayed the exact living introduction and four choices. Nothing removed the tree interaction controls and left the base. The ordinary website navigation remains available.
- The first strike displayed exactly one hack mark and the requested Continue/Stop confirmation. Stop left a passive living base. Reload preserved the mark and restored the living choices.
- A native chopping sequence completed after four additional strikes. The immediate aftermath used a native horizontal scroll region and the frozen guest-number cutoff. No public save/placement control appeared in this scene.
- Horizontal scrolling changed scrollLeft to 444 in the browser check. Search/readable-list requests are bounded by the same frozen cutoff.
- In the final fallen scene, bark is clipped to the exact permanent tree height (1440px for the empty tree), so section overscan does not cover the stump. Carvings and their details remain outside this bark-only clip. The stump, severed base and horizontal trunk are visible together.
- The preferences row begins below the support link (1441.4375px versus the support row's 1405.4375px bottom in the final desktop check). It remains above copyright.
- A later reload displayed the exact dead-timeline introduction, two choices, and stump. Regret your decisions removed both choices and left the stump.
- The fallen palette persisted. Dark mode used Dark Coffee `#432818` for paper and Light Apricot `#FFE6A7` for ink. Reduce Effects and larger text persisted through a real reload.
- Reset closed the dialog, focused `#main`, returned scroll Y to zero, cleared the local hack, restored the living palette/default settings, and displayed all four living choices. It does not delete communal entries or the server's abuse/ownership cookie.
- The carving choice opened the signature workflow. A typed name/note in Handlee survived visitor-selected keyboard placement; no spot was automatically claimed. The final confirmation honestly described a preview and offered no save action while the services are unconfigured.
- The semantic readable guest list opened at `/tree/entries`. Older `/guestbook` bookmarks redirect to `/tree`.
- No application console errors appeared during the final chopping/reset check. Browser-extension metadata errors were excluded from application results.

Earlier foundation verification also covered literal pointer drawing and Undo, bundled handwriting outlines, compact/project-description preferences, per-project canonical/share metadata, generated Open Graph PNGs, preview noindex, and the long-hover copyright easter egg. No test carving was published.

## Remaining verification and setup

Physical iPhone/Safari, touch/stylus and assistive-technology testing remain to be completed. Structural fixes and desktop browser checks do not substitute for reproducing the two reported bugs on an actual iPhone.

No remote Supabase migration has been applied. The connected Supabase account lists no projects, and the existing Vercel project has no variables matching `SUPABASE`. Turnstile and Resend are not configured. Therefore hosted submission, email delivery, owner sign-in and moderation have not been verified. Saving fails closed; previewing a signature and choosing bark remain available.

The empty-window cat photograph is still awaiting Zack's supplied image. See `cypress-setup.md` for service activation and the content field for that image. Do not open public submissions or promote this preview until the real hosted flow is verified.
