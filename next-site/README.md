For everyday changes, start with [the simple editing guide](docs/editing.md). Spotify is currently shelved; the integration setup below is retained for future reference, not part of the live site.

# Zack Cook — author site

This is Zack Cook's Next.js author website. The production build is live at https://zackdcook.com/; https://www.zackdcook.com/ redirects to it. The Vercel fallback is https://zack-cook.vercel.app/. The original GitHub Pages site is preserved in the repository root, Git history, and `archive/pre-nextjs-2026-10-01`. Vercel also has `zackyc.xyz` and `www.zackyc.xyz` configured as permanent 308 redirects to `zackdcook.com`; those two addresses still need Porkbun DNS changes. The database schema and account integrations are prepared but have not been activated.

## How hosting works

Think of the services as four different jobs:

| Service  | Its job                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Porkbun  | Keeps your domain registered and points it toward the website.                                         |
| GitHub   | Stores the website's source files and their history.                                                   |
| Vercel   | Builds Next.js, serves the pages, and runs the private server code for sign-in, comments, and Spotify. |
| Supabase | Stores your Commonplace links, comments, likes, account records, and encrypted Spotify authorization.  |

Next.js includes React. Most of this site is prebuilt so it loads quickly. The private tools and integrations run on Vercel when someone uses them; there is no computer at home you need to keep running.

The Vercel project uses **Root Directory `next-site`**. Production uses `SITE_URL=https://zackdcook.com` and `SITE_LIVE=true`; Preview environments keep `SITE_LIVE=false`. Zack updated the main domain's website DNS, and Vercel now reports Valid Configuration for both `zackdcook.com` and `www.zackdcook.com`. Public HTTPS loading and the www redirect were verified. The pending alias records are A at the root of `zackyc.xyz` to `216.198.79.1`, and CNAME `www` to `d439eccb731bf84e.vercel-dns-017.com.`. Porkbun uses a blank Host field for the root. Preserve email and unrelated DNS records, and recheck the exact values in Vercel before editing. Keep the original site history available rather than deleting the old repository.

References: [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [GitHub Pages limitations](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages), [Vercel plans](https://vercel.com/docs/plans). Review current plan eligibility and pricing before enabling commercial features or choosing a paid plan.

Zack requires **no new spending**. The current Vercel project is on Hobby; no paid upgrades or new database resources have been enabled. Keep existing domain renewals separate from new hosting costs. Read [the security and cost checkpoint](docs/security-and-costs.md) before enabling sign-in, comments, Spotify, or another service. No site can be guaranteed hack-proof, and the dependency advisory scan remains incomplete because this workspace could not reach the audit registry.

## Personalizing the site

| Edit                                                         | File                    |
| ------------------------------------------------------------ | ----------------------- |
| Writing stages, word counts, goals, update date, ring colors | `content/progress.json` |
| Commonplace photo captions, public contact address, events   | `content/site.ts`       |
| Homepage introduction and section copy                       | `app/page.tsx`          |
| Bio and profile information                                  | `app/aboutme/page.tsx`    |
| Writing description and future works                         | `app/creativeworks/page.tsx`  |
| Colors, typography, spacing                                  | `app/globals.css`       |
| Photos                                                       | `public/images/`        |

The braindump value, **35,834 words**, comes from the counter published on the original homepage. It is not a new word count of a manuscript. The draft is **27,250 / 50,000**. Revision has no invented target. Add more stages to the JSON to create more rings.

Words of Folly now contains short writing reminders in `content/folly.json`; run `npm run add:folly -- "Your new note" YYYY-MM-DD` to update the leaf pile, latest-leaf homepage preview, and RSS. The command randomly chooses one of four vector leaf shapes and saves its `shape` value with the entry; retain that value when editing the note. Direct additions to the JSON should also include a randomly chosen `shape` from 0 through 4. The former essay was removed and remains recoverable in Git history. Other first-person copy and photo captions are proposed drafts: review them for accuracy, voice, contact details, and what you want public. Add only actual profile links to the bio's `sameAs` list. Search metadata helps identify you; no search position can be guaranteed.

Navigation is Home, Creative Works, Events, About Me, Words of Folly, and Shoutouts. The Inspo Board is shelved; its original page, homepage section, menu entry, and sharing metadata are saved in [archive/inspo-board](archive/inspo-board/README.md). The standing Write On, Lakeland! group appears on the homepage and Find Me At… page: Thursdays, 4–6 p.m. Eastern at Pressed Books & Coffee. Change its details in `content/site.ts`. Additional appearances show when dated entries are added. A newsletter button appears only if `NEXT_PUBLIC_SUBSCRIBE_URL` is a real subscription URL. No donation or payment service is connected.

## Local preview

Use Node.js 22 or newer:

```sh
npm ci
npm run build
npm start
```

Open `http://127.0.0.1:3000`. Without credentials, the public pages use your local photos and copy; private actions show clear setup errors. `SITE_LIVE` defaults to false, so the preview requests no search indexing. Noindex is not password protection.

Checks: `npm run typecheck` and `npm test`.

## Cloud setup, still to complete

Vercel, GitHub, and Supabase are connected in ChatGPT. Vercel's legacy deployment tool returned “tool not found,” so project import uses the Vercel dashboard. Supabase has no existing project; its creation and live account setup remain separate from publishing the public pages.

1. Create or select a dedicated Supabase project after reviewing any costs. Inspect it before applying `db/schema.sql`; this is a schema draft, not an applied migration. Run Supabase's security advisors afterward.
2. Add the project's URL and publishable key, plus the server-only service role key, to Vercel environment variables using `.env.example` as the checklist. Never paste secret keys into site content or commit `.env.local`.
3. Set `ZACK_ADMIN_EMAIL` to the confirmed email of the account Zack will use to sign in. This grants private editor access only after Supabase verifies that email. Public commenters do not get editor access.
4. Configure Google and/or Facebook in Supabase and add the preview's `/auth/callback` URL to the allowlist. Add the provider's Supabase callback URL to its developer app. Enable the corresponding environment flags only when each provider is ready. Production gets its own allowed callback URL at launch.
5. Email codes are optional and disabled by default. Before enabling `EMAIL_OTP_ENABLED`, configure a real email sender and a confirmation template containing the OTP, not just a magic-link URL. The code supports 6–8 digits. Review the project's current email limits and template settings.
6. Set `SITE_URL` to the exact site origin. Keep `SITE_LIVE=false` for previews. Test the complete signed-in owner and commenter flows before enabling the login providers publicly.

Google/Facebook sign-in is for journal likes and comments as well as the private editor. Comments require approval in `/admin/comments`. Readers can share a journal URL without signing in. Native account, moderation, and database flows still need live integration testing.

References: [Supabase server-side auth](https://supabase.com/docs/guides/auth/server-side/nextjs), [social login](https://supabase.com/docs/guides/auth/social-login), [row level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless).

## Spotify authorization

A ChatGPT connection does not authorize your website to read Spotify. Your website needs a Spotify developer application, followed by your own Spotify consent screen.

1. Create a Web API application in the [Spotify developer dashboard](https://developer.spotify.com/dashboard). Review Spotify's current developer access rules; Zack's Premium account is the intended app owner and listening account.
2. Add the exact redirect URI `https://YOUR-PREVIEW-ORIGIN/api/spotify/callback`. Local testing uses `http://127.0.0.1:3000/api/spotify/callback`; Spotify does not accept `localhost` as a loopback redirect hostname. Add the eventual main-domain callback separately at launch.
3. Put the app's Client ID in `SPOTIFY_CLIENT_ID` and the matching URI in `SPOTIFY_REDIRECT_URI`. This implementation uses PKCE, so a Spotify Client Secret is not needed.
4. Generate a random 32-byte encryption key and save its 64-character hexadecimal value as the server-only `INTEGRATION_ENCRYPTION_KEY`. Treat it as a secret; changing it makes existing sealed tokens unreadable and requires reconnecting Spotify.
5. Sign in as Zack at `/admin`, choose **Connect Spotify**, and approve `user-read-currently-playing`. The site does not ask for Spotify's password or permissions to modify playlists.
6. Play a track and check **Currently vibing to…** beneath the homepage portrait. A valid live track gets an official Spotify player. Pause playback and check the quiet fallback. Confirm there are no tokens in public API responses or browser storage.

The public API returns track title, artist, artwork, and the original Spotify URL. Tokens remain encrypted in a table accessible only to the server. Paused playback and setup failures do not display a made-up song. Visitors do not authorize Spotify themselves.

References: [PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow), [redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri), [currently playing](https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track), [quota modes](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).

## Share a post to Commonplace from your phone

The personal Instagram account does not need to become a business account. This saves an original link with an optional note and credit. It does not copy protected Instagram photos or import everything you post.

Once sign-in and storage work, create an iPhone Shortcut named **Add to Commonplace**:

1. Enable **Show in Share Sheet** and accept URLs and text.
2. Add **Get URLs from Input**, using Shortcut Input. Get the first item from that list.
3. If there is no URL, ask for a URL; otherwise use the first URL. This handles apps that share a caption alongside the link.
4. Add **URL Encode** for that URL, then a Text action: `https://YOUR-PREVIEW-ORIGIN/admin/share?url=` followed by the encoded URL.
5. Add **Open URLs** for that text. Open it in the browser where you sign in to the site.

From Instagram, Threads, Pinterest, Spotify, or Safari: **Share → Add to Commonplace**. The form opens with the original URL and a starter title. Add a note or credit if you want, then tap **Add to Commonplace**. It appears immediately after saving; other cached views refresh within a minute. Bookmark `/admin/share` as the copy-and-paste fallback. At launch, update the Shortcut to the final domain.

## Launch verification

Zack approved publishing on October 1, 2026. Verify the production build, domain, canonical URLs, legacy redirects, and indexable sitemap after deployment. Activate authentication, moderation, phone sharing, and live Spotify only after their account configuration and integration checks pass. Search Console submission requires Zack's Google account and domain verification.
