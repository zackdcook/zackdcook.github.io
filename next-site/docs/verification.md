# Preview verification — October 1, 2026

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
- Vercel protected preview deployment, domain connection, and eventual search indexing.

At this verification checkpoint, Vercel sign-in is complete and publishing is authorized. GitHub's connected app rejected branch creation with HTTP 403 (Resource not accessible by integration); its installation list is empty. The Vercel-to-GitHub browser connection is waiting for GitHub Mobile device verification. No source upload, Vercel project creation, or domain change has succeeded. No Supabase database was created and no cloud schema was applied.

The database schema and integration code are prepared for the next setup stage; their presence is not proof of a working live integration. See the project README for setup steps.
