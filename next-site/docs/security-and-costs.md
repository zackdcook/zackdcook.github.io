# Security and cost checkpoint

The site is designed to stay within the existing Vercel and Supabase setup. Do not enable paid upgrades or new billable services without an explicit decision.

Server-only Supabase credentials, Turnstile secrets, and Be Brave HMAC keys belong in deployment environment variables, never client code or Git. Public browser code receives only publishable/public values.

Be Brave uses an HTTP-only random visitor identifier, HMAC-derived privacy-conscious hashes, Cloudflare Turnstile, server-side rate limiting, and a server-authoritative 28-day cooldown. Raw client IP addresses are not stored by the Be Brave application. Database tables use RLS and privileged writes stay server-side.

Before a production release, run the typecheck, tests, and production build; review dependency advisories in an environment with registry access; and test the Vercel Preview on desktop and mobile before merging to `main`.
