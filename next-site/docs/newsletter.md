# Book announcements and newsletters

The homepage and Book Alert menu share one form. The book announcement starts
selected; “Subscribe to future newsletters, too” always starts unchecked.
Uncheck the book option for newsletter-only signup. The email field and one
human check submit both choices together. No email address is kept in browser
storage. Each subscription has its own local completion flag; the remaining
list stays available in the menu and after a success message. The existing
homepage dismissal key is retained.

## View and manage

Open the **zackdcook** Supabase project → **Table Editor** →
**newsletter_subscribers**. Filter `status = active` for the mailing list.
The existing `book_launch_subscribers` table remains the one-time list.
`newsletter_consent_events` records newsletter signup, unsubscribe and
suppression changes. Each table is private to the backend and project owner.

To honor a removal request, set only the newsletter row’s `status` to
`unsubscribed` and `unsubscribed_at` to the current time. To block mail to a
problem address, use `suppressed`. Do not set an address back to active without
new consent. Repeated public signup submissions never reactivate an unsubscribed
or suppressed record. Delete a subscriber only for an intentional erasure
request; deleting a newsletter row also erases its consent history.

The **email_subscription_audience** view is an owner-only combined list, with
one row per normalized email and independent book/newsletter flags. The
newsletter unsubscribe URL is included per subscriber. It uses a random
256-bit token in the URL fragment, so it is not sent in page URLs, referrers or
page-request logs. The static unsubscribe page only makes a request after the
reader confirms. It affects the newsletter only, and still works with new
signups disabled.

## Preparing mail without duplicates

No email provider or automatic sending has been added. This feature collects
consent and provides unsubscribe handling on the existing free infrastructure.
A future sending integration must include the per-recipient unsubscribe link
in every newsletter and use the delivery ledger below. Exporting a list and
sending it through an unrelated tool cannot enforce these guarantees by itself.

For a regular newsletter, export only rows where `newsletter_active = true`.
For the debut announcement, use `book_announcement_pending = true OR
newsletter_active = true` to send one copy to overlapping subscribers. Record
the announcement as sent for the book list when delivered, keeping the
newsletter active. Never include book-only subscribers in a regular newsletter.

The `email_campaign_deliveries` table has a unique `(campaign,email)` key. A
sender must insert a campaign claim **before** sending, with `ON CONFLICT DO
NOTHING`, and send only the returned rows. Set `sent_at` after delivery; handle
uncertain deliveries explicitly instead of blindly retrying them. Reuse the
same campaign ID for retries. This prevents a list overlap or retry from
creating a second send. Check active/suppressed status again immediately before
actual delivery. A provider's idempotency key should also use campaign + email.

## Costs and preservation

One existing `/api/book-launch` endpoint handles signup and unsubscribe. There
are no subscription status polls, per-visitor page queries or new services.
Both selections use one atomic database RPC; existing network limits,
Turnstile, honeypot, origin checks and request bounds are retained. Newsletter
fields are explicitly boolean. Older clients can only request the original
one-time book list. Consent evidence is independent and existing consent/status
is never overwritten by a duplicate.

The SQL is additive. Before the production change, the one-time list contained
9 records. Compare its count and fingerprint immediately after the migration.
Tests use isolated storage and rolled-back transactions, not live subscribers.

## Images and gesture changes

The supplied group photo replaces the About Me Gator graduation photo. The
signature SVG traces the photographed ink centerline and removes the ruled
lines and other writing; strokes use consistent width with round joins.
Favicons, Apple touch icon, manifest and share-card marks use the supplied stone
Z. Images are sized at build time, with no new image optimization endpoint.
Descriptive alternatives, image structured data and an image sitemap help
search engines discover the actual photos. Decorative artwork keeps empty
alternatives where appropriate; indexing and ranking remain Google's choice.

Folly uses immediate Pointer Events and capture for mouse, pen and touch.
`touch-action:none` applies only to the interactive pile. A swept brush reaches
all stacked blades, including when starting on a blade. Up, cancel, lost
capture, window blur, hidden tabs, resizing and reduced-motion changes clear
interaction state. Taps and keyboard leaf navigation remain available.
Lightweight SVG relief, veins, a central fold and shared cursor/tilt reflection
provide depth without introducing WebGL or a canvas rendering dependency.

Production migration `20261024022406_independent_newsletter_subscriptions`
completed successfully. The original book list remained 9 rows with unchanged
fingerprint `2dfb529d4730d558c689025c4aed153d`. Newsletter count was zero;
anonymous table reads and RPC execution were denied; the backend role had
RPC access. No one was enrolled by migration, and no email was sent.

## Release validation

- 175 existing and new automated tests passed, including route security,
  independent choices/consent, late-verification cancellation and deduplication.
- Production build and TypeScript checks passed. The unsubscribe page, image
  sitemap, manifest, icons and public pages are static; only the pre-existing
  signup API handles the new actions.
- Chromium and WebKit were checked at desktop and mobile viewport sizes.
  All eight leaves responded; taps opened the reader; interrupted gestures
  recovered without browser errors. Chromium used native CDP touch drags and
  an outside-pile touch swipe to confirm page scrolling. WebKit used its mobile
  engine with touch-pointer handler checks and native taps. Physical iOS Safari
  was not available in this environment and is not claimed as verified.
- Sixteen browser form scenarios covered newsletter-only, both selections,
  returning book subscribers and returning newsletter subscribers in the four
  browser/viewport combinations. Browser requests used local mock responses;
  the actual backend route was separately tested with module mocks, and the
  real database logic with the service role in rolled-back test transactions.
- Additional 320px, 390px and desktop checks passed for menu/Escape behavior,
  persistent dismissal, cursor light response, reduced effects, overflow,
  static assets and image metadata. Photo and signature rendering were
  visually inspected in both engines.
- Database security review found no warnings. The no-policy RLS notices are
  intentional: only the backend service role and project owner can access
  subscriber data.
- No email sending provider was installed and no emails were sent. Future
  campaigns must use the deduplicated audience, delivery ledger and included
  unsubscribe URLs as described above.
