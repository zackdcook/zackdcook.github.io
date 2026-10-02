# The cypress preview: editing, activation, and rollback

The live baseline is main at e76fe250853b4e77fb78bd46a3a0a4f7b5eff46d.
This work belongs to feature/living-cypress. Review the Vercel branch preview;
do not promote it or change either domain until Zack chooses to do so.

## Edit the content

Open the repository on GitHub, choose this branch, and open next-site/content.
Click a file, then the pencil. Change the words between quotation marks, keep
the punctuation around the JSON records, and commit to this branch.

| File | What it controls |
| --- | --- |
| editorial.json | Homepage paragraphs, the cats' editorial label, and about copy |
| projects.json | Projects, descriptions, statuses, and social-card text |
| progress.json | Writing counts and stage notes |
| shoutouts.json | Zack's curated recommendations |
| site.ts | Events, the writing group, public identity, social links, email, and journal records |
| navigation.ts | Menu names and route order |
| ../app/cypress.css | Tree materials, carving treatment, and signing layout |

Public suggestions never edit these files or publish themselves. Approved
shoutout suggestions are added to the rendered list from the database.
The existing private inspiration intake remains available after its own setup.

## What is configured now

Vercel hosting and GitHub source already exist. The connected Supabase account
currently has no project. No database migration has been applied to a remote
database, and Turnstile/notification credentials have not been supplied.
Drawing and placement work as a preview; saving deliberately stays closed.
No paid service, plan upgrade, SMS, storage bucket, scheduled job, or analytics
subscription is introduced by this branch.

## Turn on the real guestbook

1. Confirm the Supabase organization and its actual project price in the
   connected account. Use a Free project only. If the account proposes a paid
   project or requires a payment change, stop. Creating a project is separate
   from connecting the plugin.
2. Apply the existing db/schema.sql foundation, then the additive
   supabase/migrations/20261002133511_living_cypress_guestbook.sql.
   Use the Supabase advisors to check security/performance before opening forms.
   Tables have RLS and no anonymous/authenticated grants; new invoker functions
   can be called only with the server service role. Never expose private schema
   tables or enable anonymous writes to fix a permission error.
3. Configure owner auth with Zack's confirmed email. Register the existing owner
   record for the inspiration editor. Verify a non-owner cannot access the review
   desk and that the owner can sign in through the configured provider.
4. Create a Cloudflare Turnstile widget for the chosen preview hostname and later
   the two public hostnames. Select the free offering. Use the widget site key
   as NEXT_PUBLIC_TURNSTILE_SITE_KEY and its secret only on the server.
5. Configure a free Resend sender and authenticated sending domain. Keep existing
   iCloud MX/SPF/DKIM records; choose a separate sending subdomain and add only
   the exact new records Resend supplies. Do not replace existing email records.
   The sender and recipient live in SUBMISSION_EMAIL_FROM/ZACK_ADMIN_EMAIL.
   Email links lead to an authenticated desk, never approve/reject bearer URLs.
6. In Vercel's **Preview** environment only, set the nonempty variables in
   .env.example. Never paste credentials into chat or commit them. The preferred
   server database key is SUPABASE_SECRET_KEY; the legacy service-role key is
   accepted for compatibility. Generate SUBMISSION_HMAC_KEY randomly.
7. Keep SITE_LIVE=false for preview. Set PUBLIC_SUBMISSIONS_ENABLED=true only
   after the schema, sign-in, real human check, and notifications work. Missing
   any required setting closes submissions. A locally bypassed CAPTCHA is not a
   production-ready test.
8. Test a real typed and drawn mark: choose bark, reserve, submit, receive the
   email, sign in, inspect neighboring context, approve, and find the exact mark.
   Test rejection, expired holds, duplicate attempts, and a second browser
   choosing the same patch. Pending names/drawings must never be visible publicly.
9. Review the preview on a phone and with Reduce Effects. Only after approval,
   merge the branch and configure the same verified settings for Production.

The SQL notification budget is 20 messages/day, comfortably below the free
sender's account limits at implementation time; verify the current provider
limits during setup. No paid fallback is enabled. Hosting and database account
quotas remain the account owner's limits; the application cannot override them.

## World invariants

World width: 720 units. One foot: 288 units. Initial tree: 1,440 units.
Every two approvals append 288 units. The newest 1,440 units are writable.
Never rescale existing X/Y, change these constants, renumber guests, or mutate
historical section geometry after the first approval. Historical neighbors
and landmarks must remain in the same place.

Reservations last 20 minutes before submission, seven days awaiting review.
An unexpired pending mark may be approved above today's frontier because its
server-recorded original frontier is authoritative. An expired mark cannot be
silently moved or published; the visitor chooses a fresh location.

Pending ink geometry is never sent to public clients. Anonymous temporary
occupancy covers conceal the signature itself; final server collision checks
still use exact ink footprints. Public search reads only approved names.
Find My Carving stores a public ID, not an authorization token.

## Verification and rollback

npm test runs the existing security/calendar tests and real PostgreSQL tests
using PGlite: overlapping reservations, cookie ownership, original-zone
approval, stable coordinates, expiry, monotonic numbering, RLS denial, and email
quotas. npm run build performs TypeScript and Next rendering checks.

Main and Production remain untouched during this review. To discard the preview,
leave main selected. After a future merge, revert its merge commit or promote
the baseline Vercel deployment. Additive guestbook tables do not prevent the old
site from running; deleting a database is unnecessary for rollback.

## Visual assets

The fixed bark/environment/Spanish-moss assets were made with the built-in
image-generation tool. The prompt requested a close photographic mature Florida
bald cypress, sharp irregular reddish-gray ridged bark, blurred quiet wetland,
natural daylight and sparse foreground Spanish moss; no text, people, fantasy
glow, cartoon treatment, or haunted imagery. See public/images/cypress-* and
spanish-moss.webp. Assets are optimized WebP; no image is generated per signer.
Handwriting fonts are locally bundled OFL fonts. scripts/build-signature-fonts.py
builds their numeric outlines and WOFF2 assets with fontTools/Brotli. Runtime
preview/render/collision use those same outlines.


### Kitty discovery photograph and reset

When the empty-window photograph is ready, upload it under `public/images/` and set `home.emptyCatPhoto` in `content/editorial.json` to its `/images/...` path. Until then, the ribbon secret works but uses an explicit photo placeholder. Keep the original cat photo.

The footer Accessibility & preferences button works on every page. Reset timeline and website preferences restores the living palette and entrance, resets the local hack/roll and safe browser bookmark, and restores display defaults. It never deletes public carvings or security identity cookies. Chopping requires no additional provider, paid service, schema, cron or email.
