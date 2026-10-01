# Local and production verification — October 1, 2026

The Next.js design preview builds successfully. TypeScript checks and all six security tests pass. Browser checks used a fresh local Chromium session against the production build. The agent-browser CLI could not start in this workspace, so the local verification used Playwright directly.

Verified:

- Homepage, Writing, About, Journal, the preserved journal entry, Commonplace, and Events render meaningful content.
- The original biography URL redirects to About. Profile structured data parses.
- Braindump shows 35,834 words; the active draft shows 27,000 / 60,000 and 45%.
- Requested navigation labels, the square portrait with symmetrical rounded corners, Spotify placement beneath the portrait, and the standing Thursday writing group are present.
- No horizontal overflow at 320, 390, 740, 768, 960, 1024, or 1440 pixels. Phone navigation closes after a link selection and identifies the current page.
- Shared Instagram URLs open with tracking removed. Without account configuration, saving returns an explicit setup error and does not claim success. That expected HTTP 503 is excluded from the unexpected-console-error check.
- The unconnected Spotify endpoint returns an honest not-connected state. Trying to connect without signing in redirects to login.
- Preview metadata and robots instructions request no search indexing.
- No unexpected browser errors or framework error overlays appeared.
- All seven supplied WebP photo exports decode. Desktop and phone screenshots were visually inspected.

Not yet verified against live services:

- Supabase schema execution, security advisors, real RLS policy behavior, and database writes.
- Owner and reader sign-in through Google/Facebook or email.
- Successful Commonplace publication and cache refresh across devices.
- Live comment submission, approval, removal, and like counts.
- Spotify consent, token storage/refresh, currently playing, and paused playback.
- The iPhone Share Sheet Shortcut on Zack's phone.
- Vercel protected preview deployment, custom-domain DNS connection, and eventual search indexing.

Production checkpoint:

- GitHub's connected app rejected writes with HTTP 403 (Resource not accessible by integration). Zack approved GitHub website uploads and the Vercel GitHub App installation scoped only to `zackdcook/zackdcook.github.io`.
- Preserved the original remote main commit `aba5ce5ddea7a71caa0d0564616823b0ad02ca2c` in `archive/pre-nextjs-2026-10-01`.
- Uploaded all 61 application files, including seven photos, on `launch/next-author-site`. Every uploaded blob matched the tested local file; the original root files were unchanged.
- Squash-merged PR #1 into main as `3cce22a76e8bc0c98f24eaed06cc1965246b20bd`.
- Created the Hobby Vercel project `zack-cook` with Root Directory `next-site`, Next.js defaults, and Production-only `SITE_URL=https://zackdcook.com` and `SITE_LIVE=true`.
- Deployment `CxS2SSespf7NtX4qpYHHizeE3YFX` completed with Ready status. The public site at https://zack-cook.vercel.app/ renders the requested navigation, square portrait, Spotify placement, draft rings, original journal entry, photos, and writing-group details. Production canonical metadata points to `https://zackdcook.com` and robots metadata is `index, follow`. Homepage photos load after scrolling, with no horizontal overflow or application error overlay. The browser extension's metadata error is unrelated to the application.
- Attached `zackdcook.com` to Production and `www.zackdcook.com` as a 308 redirect to the primary domain. Vercel currently reports Invalid Configuration until Porkbun DNS is updated: A `@` to `216.198.79.1`; CNAME `www` to `d439eccb731bf84e.vercel-dns-017.com.`. Preserve email and unrelated DNS records.
- Porkbun's login presents a CAPTCHA and terms acceptance. No credentials were collected, no CAPTCHA was attempted, and no registrar DNS changes were made at this checkpoint.
- No Supabase database was created and no cloud schema was applied. Spotify and authentication providers remain unconfigured.

The database schema and integration code are prepared for the next setup stage; their presence is not proof of a working live integration. See the project README for setup steps.
