# Book launch signup and aggregate analytics

## Implementation and release

Feature branch: `feature/book-launch-signup`, based exclusively on production
`main` at `be6b15d93f2bae259a52e7b80d98a51018edb01d`. No overhaul branch was merged.
The implementation commit can be found with `git log --oneline -- docs/book-launch.md`.

Production migration `20261010020405_book_launch_subscribers.sql` has already been
applied to Supabase project `belqlsqnbexwkpmnptyy` (zackdcook). Do not apply it again
under another migration timestamp. It creates only the subscriber table, its
separate short-lived rate-limit table/RPC, and a dedicated cleanup job using the
existing pg_cron extension. Existing website tables and records are untouched.
The timestamp matches the production migration history.

Production Vercel project `zack-cook` already has the existing Supabase and
Cloudflare Turnstile configuration. The new rate-limit secret, UI flag, and
PostHog settings are configured for the production environment only. The existing
Turnstile widget is reused with a distinct `book_launch` action and
`interaction-only` appearance; hostname and action are verified server-side.

At the time this commit was prepared, publishing/PR/merge/deployment remained
blocked: the GitHub connector returned HTTP 403 on branch creation, and local Git
had no HTTPS push credential. The production website still runs the pre-feature
commit. No real signup or browser smoke test has been performed. Complete the
release and update this paragraph with the PR, merge commit, deployment URL, and
verification results before treating the feature as live.

## Component and preference contracts

- `BookLaunchProvider` wraps the existing site shell and owns the accessible native
  modal dialog. `BookMenuItem` is inside both desktop and mobile navigation.
- `HomepageBookCTA` follows the homepage introduction. Both placements reuse
  `BookSignupForm`; exact approved copy and consent wording live in
  `lib/book-launch/shared.ts`.
- Existing `SitePreferences` owns three independent literal-boolean local keys:
  `zack.book-launch.dismissed.v1`, `zack.book-launch.subscribed.v1`, and
  `zack.analytics.opt-out.v1`. Never put email or an analytics identifier in them.
- The UI waits for preference initialization before showing signup entry points.
  Viewing, leaving, navigating, and returning never save a dismissal. Explicit
  dismissal hides only the homepage invitation. Confirmed acceptance hides both
  placements. Cross-tab updates are supported. Appearance/timeline reset leaves
  signup and analytics choices intact.
- A failed response leaves signup available. The public server response is
  identical for new, existing active, suppressed, and notified addresses. An
  existing suppressed record is never reactivated. Clearing browser data or
  changing devices may show the invitation again; there is no identity syncing.
- Dialog access is deliberate and uses native modal keyboard/focus semantics,
  Escape, outside-click dismissal, and opener/fallback focus restoration.
- Layout belongs to `app/book-launch.css`; surfaces and buttons reuse the existing
  typography, material lighting, palette, dialog, and reduced-motion architecture.

## Server and database

`POST /api/book-launch` is the only signup endpoint. It enforces an explicit origin
allowlist, rejects cross-site requests, limits JSON bodies to 8 KiB, validates and
normalizes email (trim/lowercase, maximum 254 characters), checks the honeypot,
and verifies Turnstile before inserting through the existing server-only
`serviceSupabase()` helper. Unique email plus `ON CONFLICT DO NOTHING` makes
concurrent/duplicate submissions idempotent without modifying original consent,
status, or attribution. Signup sends no email and uses no delivery provider.

Both new tables enable RLS and revoke all public, anon, and authenticated-role
access. There are deliberately no public RLS policies. Only the server service
role and privileged authenticated project administrators can access the records.
The security-invoker rate RPC is executable only by the service role.

Rate limiting allows six requests per ten-minute keyed network bucket. The
trusted Vercel forwarding header exists only in request memory. A separate HMAC
secret and window salt produce the stored bucket; no raw IP or subscriber linkage
is retained. Bucket expiry is ten minutes, with lazy and scheduled cleanup.
Missing credentials/network headers or unavailable security services fail closed.
Diagnostics log sanitized categories only, never request bodies/emails/tokens/IPs.

Subscriber columns cover UUID, normalized email, created/consent timestamps,
the exact versioned consent wording, public source page/placement, sanitized
referral/campaign fields, optional trusted coarse country, active/suppressed/
notified status, and future notification timestamp. No browser identity, analytics
ID, IP, fingerprint, browsing history, or precise location is stored.

## Owner operations (no SQL)

Open the authenticated [production Supabase Table Editor](https://supabase.com/dashboard/project/belqlsqnbexwkpmnptyy/editor)
and select `public.book_launch_subscribers`. Keep project/team access limited to
the owner; never expose the service credential to the browser.

1. Inspect/filter rows and the table's record count. For mailing eligibility,
   filter `status = active`; the complete table count also includes suppressed
   and notified records. Supabase is the source of truth for actual totals.
2. Use the Table Editor CSV export action to export subscriber records. Treat the
   downloaded file as private and delete unneeded copies.
3. To prevent re-enrollment, edit the individual's `status` to `suppressed` and
   retain that record. A later signup returns generic success without reactivation.
4. To remove an individual entirely, select only their row and choose Delete,
   reviewing the row before confirming. The table has no links/cascades to
   unrelated website data. Deletion is intentionally independent of local UI
   flags. Hard deletion permits a later fresh signup; use suppression when that
   is not desired.

## Configuration and pause controls

| Setting | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_BOOK_LAUNCH_ENABLED` | public/build + server | Literal `true` enables entry points and submissions |
| `BOOK_LAUNCH_RATE_LIMIT_KEY` | server secret | Independent random value, at least 32 characters |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public/build | Existing Cloudflare widget |
| `TURNSTILE_SECRET_KEY` | server secret | Existing verification credential |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Existing production project |
| `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | server secret | Existing privileged client credential |
| `NEXT_PUBLIC_POSTHOG_KEY` | public/build | PostHog project token, never a personal API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | public/build | `https://us.i.posthog.com` |
| `BOOK_ANALYTICS_ENABLED` | server | Literal `true` permits the restricted analytics rollout |
| `SITE_URL` | server | Existing canonical origin allowlist entry |

Set `NEXT_PUBLIC_BOOK_LAUNCH_ENABLED=false` and redeploy to pause UI and reject new
submissions without changing subscriber records, consent, or local preferences.
Set `BOOK_ANALYTICS_ENABLED=false` and redeploy to disable collection. Preview
configuration must not silently point a test signup flow at production. No test
subscriber database or artificial subscriber/event dataset was created.

## Analytics and reporting

PostHog project 656387 (zackdcook.com), private
[Book Launch & Website dashboard](https://us.posthog.com/project/656387/dashboard/2193109).
Thirteen native reports cover pageviews/daily visitor estimates, acquisition,
campaigns, stages, new versus duplicate acceptances, placement conversions,
dismissals, device/browser, theme/timeline, errors, coarse engagement, and
aggregate page pairs. Every report was executed successfully against the empty
real event stream; no synthetic events were ingested. The onboarding dashboard
was left untouched.

The SDK uses `cookieless_mode: "always"`, `person_profiles: "never"`, memory-only
configuration, manual events/pageviews, no identify/alias, and no recordings,
heatmaps, autocapture, broad interaction capture, geolocation enrichment,
surveys, or flags requests. PostHog project settings additionally disable these
features, anonymize IPs, and use stateless cookieless hashing. The event payload
allowlist removes broad SDK defaults, URL queries/fragments, emails, subscriber
IDs, and private owner routes. Campaigns are short restricted labels and referral
domains are coarse. Source pages are known public paths; extend the allowlist
when adding public pages, never accept arbitrary paths/query strings.

`/api/analytics/config` is dynamic, private/no-store, checks trusted Vercel country,
and initially permits only US requests. Other/unknown jurisdictions receive no
tracking. GPC, DNT, and the persistent local opt-out independently disable
collection. Privacy and Preferences expose the opt-out; there is no consent
popup. Do not expand jurisdiction coverage without reviewing the collection
model and applicable requirements.

`book_cta_viewed` requires at least 50% visibility for one uninterrupted second,
once per homepage component mount. Menu opening is deliberate. Started/attempted/
failed/dismissed events carry only sanitized context. Schema version 1, CTA
version `book-launch.v1`, and variant `original` provide consistent future-test
dimensions without enabling identity-based experiments.

Only the server emits `book_signup_completed`, after database confirmation, with
`new_record` distinguishing actual inserts from duplicate acceptance. It uses an
independent random per-event ID, never the browser cookieless hash, email, or
subscriber UUID. Person processing and geo enrichment are disabled. The response
does not reveal `new_record`. Delivery failure never prevents signup.

Analytics intentionally cannot provide a subscriber-linked funnel or cross-visit
profile. Daily cookieless visitor estimates are not monthly unique people.
Visible-time buckets and previous/current page pairs use only open-tab memory;
arrival campaigns also survive client navigation only in memory. Aggregate stage
ratios can differ because of retries, blocking, opt-outs, and delivery failures.
Use Supabase counts for the actual list, not PostHog event totals.

## Validation and remaining production verification

`npm test`: 55 tests passed, including existing website tests, preference/copy/
privacy tests, actual-route module tests for idempotency and suppression, origin,
body, email, honeypot, Turnstile hostname/action, rate limiting, and failures.
`npm run build`, `npm run typecheck`, `git diff --check`, and production dependency
audit passed (zero known vulnerabilities). Production RLS/grants/RPC permissions
were inspected; the real rate limiter's six/seventh boundary was verified in a
rolled-back transaction. No subscriber was inserted. Database advisors found no
warning/error; their deny-all/no-policy notices are intentional.

After publishing the feature branch, review the PR, confirm the base still
contains only production changes, merge only this feature, and await a successful
Vercel production build. Verify desktop/mobile layout, both themes/timelines,
reduced motion, deliberate menu opening, keyboard/Escape/outside/focus behavior,
return navigation, explicit dismissal across sessions, failed submissions, local
opt-out, and absence of sensitive analytics payloads. Check the production
endpoint's generic origin/security failures without inserting subscribers.

For a real acceptance smoke test, obtain an explicitly authorized address; submit
it once, confirm one row and hidden entry points, repeat from a fresh browser
state to verify one row remains, and remove only that record using the owner
Table Editor deletion flow. Never use guessed/public account addresses or create
artificial subscriber fixtures in production. Verify real PostHog ingestion and
new/duplicate classification, without artificially populating the reports.

## Overhaul handoff

Fetch production main after this feature is merged and integrate its commit;
do not replace it with the old preview code. Preserve the live Supabase schema,
migration timestamp, records, single endpoint, shared form/copy, versioned local
keys, menu accessibility, privacy gates, opt-out, event property contract, and
independent completion events. Move `HomepageBookCTA` to the redesigned intro
and retain `BookMenuItem` inside both navigation variants. Adapt the existing
signup CSS in one place instead of introducing competing styles or endpoints.
Resolve appearance/layout conflicts while retaining these behaviors. Never reset
subscriber data to accommodate a redesign. Record the eventual PR/merge reference
here before the overhaul integrates the feature.

Future email delivery, domain authentication, one-time sending approvals,
duplicate-send protection, required sender/opt-out information, and optional
separate newsletter enrollment remain explicitly unimplemented.
