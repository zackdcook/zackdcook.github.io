# Living cypress verification

This is an isolated branch preview, not a production promotion.
Live baseline: main at e76fe250853b4e77fb78bd46a3a0a4f7b5eff46d.

## Verified locally on October 2, 2026

- `npm test`: 23 tests passed, 0 failed. The migration was executed in real PostgreSQL with PGlite, not replaced by a mocked database.
- Concurrency: overlapping reservation requests secure only one footprint.
- Ownership: another browser identity cannot finalize the hold.
- Frontier: approval preserves a valid originally reserved location after tree growth advances the current writable zone.
- Approval is idempotent; guest numbers and tree growth are monotonic.
- Rejection and expiry release reserved bark without publishing an entry.
- Anonymous/authenticated roles cannot read queues or private security tables or execute placement RPCs. All seven new tables have RLS enabled.
- Email notifications are transactionally capped at 20 per day; repeated notification attempts do not spend more quota.
- Actual numeric ink masks retain thin lines and dots; empty spaces remain available. Oversized or executable vector input is rejected.
- `npm run build`: succeeded with TypeScript checking, Cache Components, Partial Prefetching and 46 prerendered routes.
- Production HTTP checks: route-specific Open Graph URLs appear in rendered HTML; generated guestbook social card returns PNG; preview pages are noindex.
- Bark material variants depend on the permanent section number, not the mounted sibling order. Virtualization must not change old landmarks or bark.

## Verified in the deployed browser preview

Runtime commit: 03b0ed7e93279e6127a006ceaf73c96f6c7ce0b0. Vercel reports Ready for the branch deployment. The subsequent documentation commit does not change runtime behavior.

- The homepage retains Zack's palette, folder tabs, portrait frame, personal copy, existing sections, and working navigation. Guestbook navigation immediately shows the shared leaf loading boundary, then the tree.
- The current Guestbook folder has aria-current=page. Preview HTML has noindex, nofollow.
- The tree opens near the newest bark using normal document scrolling. Oldest/Newest controls and the minimap remain available.
- Typed name/note and the actual bundled handwriting outlines render in the carved preview. Placement starts without an automatically selected location; an explicit keyboard direction selects and moves it.
- Keyboard placement: Right selected X=192, Y=80; Down moved Y to 92 while X stayed 192. Editing the mark and returning to placement retained the name/note.
- Native pointer drawing produced three literal Z strokes; Undo removed one. Switching Type to Draw retained the remaining two strokes. No test entry was published.
- Dark theme, Reduce Effects, compact spacing, and collapsed project descriptions updated the document and persisted after a real reload. Preferences were reset through the UI afterward.
- Saving is visibly disabled when the database/human-check/notification configuration is absent. A chosen patch is described as a preview, not falsely claimed as reserved.
- No application console errors were observed. Browser-extension metadata warnings were separate from the application's runtime.

Physical phone/stylus testing and an assistive-technology audit remain to be completed. Responsive styles, keyboard placement, semantic entry/list markup, and touch handlers are implemented; that does not substitute for device testing.

## Account setup not completed

No remote Supabase project/migration has been created/applied. Turnstile and Resend credentials are not configured. No real guestbook submission, delivery, owner sign-in or approval has therefore been tested against those hosted services. Public saving fails closed. Drawing and choosing a spot remain available to review.

See cypress-setup.md for exact activation steps. Do not open public submissions or promote this preview before the real hosted flow is verified.
