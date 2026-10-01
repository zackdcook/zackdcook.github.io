# Security and zero-new-cost checkpoint — October 1, 2026

Zack's requirement is **no new spending**. Do not upgrade plans, start paid trials, buy credits, install paid integrations, or create billable resources. Recheck current eligibility and pricing before activating another service. This checkpoint does not cancel existing domain renewals or Spotify Premium.

## What is live

The Vercel dashboard confirms the Hobby plan. The project firewall is active and System Mitigations are Active, with no active alerts at this check. Automatic DDoS mitigation is included. There are no system bypass rules, custom rules, or manually denied IPs. Optional Bot Protection remains Off and AI Bots remains Allow; these are not the same as the always-on DDoS protections.

All application paths receive MIME-sniffing protection, clickjacking protection, a cross-origin referrer policy, and restrictions on camera, microphone, location, payment, and USB browser access. The baseline Content Security Policy disallows object embeds, outside form destinations, and other sites framing the site. It does **not** implement a full script-src policy and is not a claim of complete XSS protection. Vercel handles HTTPS; the application does not weaken its TLS or HSTS configuration.

No Supabase project or database has been created, and no Spotify credentials or login providers have been configured. Unconfigured sign-in and link-saving return setup errors; anonymous comments are rejected. The private editor requires a server-verified, confirmed owner email once account setup is complete. Prepared database policies have not yet been tested in a real cloud project. Spotify stops refreshing during a visit when the endpoint reports not-connected.

The GitHub App is scoped to this repository only. Secret integration values belong in server-only environment variables, never in this public repository or site content.

## Cost boundaries

Hobby is free for personal, noncommercial use. Vercel says usage over its included limits generally requires waiting for the usage window to reset; it is not a guarantee of unlimited availability. Valid requests, including bot traffic not recognized as an attack, still consume the free allowance. Blocked DDoS/WAF traffic is not billed. Paid OWASP rulesets, analytics upgrades, additional services, and paid hosting upgrades were not enabled.

Before this site sells books, processes payments, or becomes a commercial service, review Hobby eligibility again. Do not silently move to a paid plan. Supabase, email sending, Spotify developer setup, comments, and public sign-in remain separate, pending free-plan/security verification and Zack's approval where required.

## Sensible next protections

Enable two-factor authentication on GitHub, Vercel, Porkbun, and the associated email account. Keep registrar domain-transfer locking enabled. Credential changes and account recovery should be performed by Zack, not by placing passwords or one-time codes into chat. These account settings have not been independently verified here.

Before enabling public write features, consider these initial **log-only** per-IP limits; they are proposals, not active rules:

| Endpoint and method | Initial observation threshold |
| --- | --- |
| POST `/api/commonplace` | 30 requests per 60 seconds |
| POST `/api/journal/*` | 60 requests per 60 seconds |
| POST `/auth/sign-in` or `/auth/verify` | 30 requests per 60 seconds |

These deliberately generous starting values assume normal human use is much lower. Review matching traffic before tightening them. Use a log → preview enforcement → production enforcement rollout, with Zack publishing firewall changes. Treat verified search crawlers and legitimate link-preview bots as useful traffic; do not deny every user agent containing “bot.” Enable additional public API rules only after checking the Hobby allowance and testing their effect on signed-in visitors. Keep DDoS mitigation on and avoid wide system bypasses.

## Limits of this review

Seven application security tests and direct TypeScript checks pass. The production build also passes; it uses the installed TypeScript compiler API rather than a separate CLI process, without turning off type checking. A follow-up local browser check could not start because this workspace denied the local server's port binding. The registry connection for `npm audit --omit=dev` was also blocked, so the dependency advisory scan is **incomplete**, not clean. A passed build or header check is not a penetration test, a completed dependency audit, or a promise of invulnerability.

Porkbun's account-recovery page succeeded, but the domain manager still redirected to login. No registrar DNS changes were made. Connecting the already-owned domain does not require buying another product.

References: [Hobby plan](https://vercel.com/docs/plans/hobby), [DDoS protection](https://vercel.com/docs/vercel-firewall/ddos-mitigation), [Bot Management](https://vercel.com/docs/bot-management), [Next.js headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers).
