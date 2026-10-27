# Owner-requested site revision — October 26, 2026

Source: production main `1855b5657263a3457bef612532027707e8c685e2`.

- Restored the original Book Alert form with one optional, unchecked newsletter
  checkbox. Success has no follow-up promotion. Returning subscribers retain
  menu access; duplicate submissions add only the requested small footnote.
- Added `book_launch_subscribers.ongoing_newsletter` as a synchronized owner-visible
  active-consent summary. Existing records and consent remain intact.
- Replaced the signature with a spline-traced SVG from IMG_2812.jpeg. A CSS mask
  uses the exact same `--color-accent` as the About heading in every theme.
- Replaced favicon, phone icons, manifest and share-card marks with the supplied
  red geode. New asset names refresh caches. These remain static assets.
- Removed all leaf shadow paths, blur filters, dynamic shadow CSS and their
  per-frame updates. Touch brush impulse is 45% of the mouse impulse; direct
  displacement is 30% of gesture travel before contact weighting. Mouse tuning,
  full-layer stirring, scroll containment and gesture cleanup remain.
- Both loading boundaries use a plain Loading label with CSS-animated dots and
  a stable accessible status. Reduced-motion users see static dots.
- Updated homepage, Guestbook and privacy metadata to current visible content.
  Removed Guestbook’s obsolete public noindex override. Private/admin/test and
  unsubscribe pages retain exclusions; previews remain unindexed.

Validation: see test/build/browser results from this release. No production
synthetic subscribers are inserted; database scenarios use rolled-back test
transactions. Newsletter sending remains a future integration, not an added
service or cost.

Email notices: current production table grants already explicitly permit the
service role, and no anonymous subscriber reads are allowed. New migration
maintains that model. Vercel reports zackyc.xyz and www.zackyc.xyz still point to
Porkbun parking. Its actual required records are apex A 76.76.21.21 and www CNAME
cname.vercel-dns.com; change those at Porkbun, preserving mail/TXT records.
Registrar authentication is required before DNS can be corrected.

## Release evidence

- All 175 tests passed (153 TS + 22 route/render tests), TypeScript and optimized
  production build passed. No runtime dependency or environment changes.
- Chromium desktop and touch/mobile: original form, unchecked newsletter,
  duplicate footnote, reload suppression and menu reopening passed. All eight
  leaves responded to a drag with no page scrolling or console errors. The
  signature’s computed ink exactly matched the heading’s accent.
- WebKit browser verification could not run in this environment because its
  native system libraries are unavailable. Physical iPhone Safari was not tested.
- Rolled-back test DB transactions verified the column on opt-in, unsubscribe
  and repeats. Production migration added the column with all nine original
  book records unchanged (original-column fingerprint
  `ae2e1da79eb6539273895abff70a42be`), zero implicit opt-ins and no anonymous reads.
- Supabase’s production security advisor reports only the existing informational
  service-only RLS notices, with no warnings.
