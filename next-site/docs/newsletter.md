# Book Alert and optional newsletters

The homepage and **Book Alert** menu use the original book-launch invitation,
email field and **Count me in** button. Entering an email always requests the
one-time launch announcement. The single optional checkbox,
**Subscribe to ongoing future newsletters**, starts unchecked. There is no
book-only checkbox, newsletter-only form or follow-up newsletter promotion.

After acceptance, the browser remembers the signup and hides the homepage
invitation on future visits. **Book Alert** remains available in the menu,
including to people who already signed up. It always opens the original form.
The original homepage dismissal key is preserved; no email is stored locally.

## Confirmation and duplicates

The success message remains “You’re on the list! I’ll email you when the book
drops.” A repeated book signup adds only the small line
“(you were already successfully subscribed, be tee dubs)”. This is an on-page
receipt. No confirmation-email sender has been introduced.

Normalized email has a unique constraint. A duplicate preserves the original
row, timestamp, consent, suppression status and attribution. An existing book
subscriber may explicitly select the newsletter checkbox later; this records
only their new newsletter consent and does not duplicate their book signup.
An unchecked checkbox never opts anyone in or removes a previous opt-in.

## View and manage

In the **zackdcook** Supabase project, open **Table Editor →
book_launch_subscribers**. The new **ongoing_newsletter** column is true only
for active, explicit newsletter consent. Existing book-only subscribers stay
false. This is a synchronized summary of the private newsletter consent and
status records; it updates when someone unsubscribes.

For newsletter removal, set the corresponding **newsletter_subscribers** row’s
status to `unsubscribed` and `unsubscribed_at` to the current time. For mail
suppression, use `suppressed`. Do not reactivate a record without fresh consent.
The private **newsletter_consent_events** table preserves opt-in and removal
history. Existing data and the book-announcement promise are preserved.

The private **email_subscription_audience** view has one row per email, the
independent book/newsletter states and a personal newsletter unsubscribe URL.
Its 256-bit random token is in the URL fragment. The static unsubscribe page
only posts after the visitor confirms, and changes only newsletter status.

## Sending and cost

This feature collects subscriptions; there is no automatic sending provider.
Every newsletter sent later must include the per-recipient unsubscribe link.
Use the audience view to select active newsletters, or the union of pending
book announcements and active newsletters for the debut announcement, with
one copy per address. The **email_campaign_deliveries** unique `(campaign,email)`
key can claim each delivery before sending, preventing list-overlap duplicates.
Recheck active/suppressed status immediately before delivery and use provider
idempotency keys for retries. Do not send newsletters to book-only subscribers.

One existing `/api/book-launch` endpoint handles signups and unsubscribe.
Turnstile, origin checks, request bounds, honeypot and rate limits remain.
There is no new Function endpoint, background task, status polling, service or
paid dependency. Supabase writes use one existing atomic registration RPC.
Table and function grants are explicit and service-only, compatible with the
October 30 Data API default-privilege change; public access stays revoked.
