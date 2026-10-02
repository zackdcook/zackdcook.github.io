# Editing your site

Open [the website folder on GitHub](https://github.com/zackdcook/zackdcook.github.io/tree/main/next-site). Choose a file, click the pencil, edit, and click **Commit changes**. Vercel builds the new version automatically; allow a minute or two. You can also tell ChatGPT exactly what you want changed.

## Where things live

| What to change | File inside `next-site` |
| --- | --- |
| Homepage wording and section order | `app/page.tsx` |
| About Me | `app/about/page.tsx` |
| Active Project and creative works | `app/writing/page.tsx` |
| Word counts, targets, stages, ring colors | `content/progress.json` |
| Event schedule, shoutouts, Inspo links, social/payment links | `content/site.ts` |
| Footer wording | `components/site-footer.tsx` |
| Colors and spacing | `app/globals.css` |
| Tab icon / favicon and the header home icon | `app/icon.png` (the header uses `site.icon` in `content/site.ts`) |
| Shared-link title and description | `site.title` and `site.description` in `content/site.ts` |
| Shared-link picture | `app/opengraph-image.tsx` (1200 × 630) |
| Pictures | `public/images` |

## Add Words of Folly

The homepage displays the newest five real entries. The archive and RSS use the same list.

1. Copy `app/journal/its-not-too-late/page.tsx` into a new folder, such as `app/journal/my-new-entry/page.tsx`.
2. Replace its title, date, summary, and paragraphs with your own. The folder name becomes the last part of its web address.
3. In `content/site.ts`, add an object to `journalPosts` with that folder's `slug`, a `title`, an ISO `date` such as `2026-10-01`, and an `excerpt`. Keep the existing `journalPost` in the list.
4. Commit the changes. The homepage, archive, RSS, and sitemap pick up the new entry automatically. For now, ask ChatGPT to do these steps with your draft so you don't have to edit JSX yourself.

## Add to the Inspo Board

The simplest flow is **Share → Copy link** in Instagram, Threads, Pinterest, or your browser. Paste the link into ChatGPT and add an optional sentence about why you saved it. Ask: “Add this to my Inspo Board.”

To edit it yourself, add an entry to `personalEntries` in `content/site.ts`:

```ts
{
  id: "a-unique-short-name",
  title: "A title in my own words",
  note: "Why I want to keep it",
  category: "inspiration",
  source_url: "https://www.instagram.com/p/POST_ID/",
  creator: "Original creator's name",
  image_url: null,
  created_at: "2026-10-01T12:00:00Z",
},
```

Public Instagram posts/reels and Threads posts get a **Show post** button using the original service's embed frame. No social script or frame loads until the visitor chooses it. Every card also has a link to the original. Private posts and posts with embedding disabled may not display; the original link remains available. Other sources use ordinary link cards. The board does not scrape private accounts, repost a creator's files, or automatically publish your saved posts.

An optional signed-in sharing form exists at `/admin/share`; it is not enabled on the current site. The copy-link-and-ask flow works without creating a database or paid service.

## Social links and caffeine

`site.instagram` and `site.threads` are your supplied profiles, `@zackyc.xyz`. `site.linkedin` points to `linkedin.com/in/zackdcook`. `site.supportUrl` goes to your Cash App, `$zackdcook`.

The Instagram and Threads marks are from Simple Icons. The LinkedIn mark is from Font Awesome (CC BY 4.0); its attribution is included in the SVG. Shoutouts live in `app/shoutouts/page.tsx` and use the same `shoutouts` list in `content/site.ts` as the homepage preview.

## Progress rings and display fonts

`content/progress.json` lists stages from the center outward. Braindump is the filled center, followed by `0th draft`, `1st revision`, and any stages you add. Change `status` to `active` for your current stage. Its ring is selected automatically. The stage buttons sit to the left of the chart. Each stage's `note` appears in the panel on the right, or below the chart on small screens. Hover a ring or stage button, focus a button with the keyboard, or tap to select a stage. `{target}` in a note becomes its target count, and `{currentStep}` becomes the current active stage's label. The rings automatically receive lighter-to-darker shades of `ringColor`; no individual stage colors are needed.

The exact palette colors are in `app/globals.css`: Midnight Violet `#31031F`, Light Coral `#E88F93`, Dark Khaki `#393313`, Floral White `#FFF8ED`, and Olive Leaf `#66693E`. Buttons and navigation use solid colors; the Liquid Glass treatment is turned off.

Headings use a soft version of **Fraunces**, an open-source alternative to MADE Gentle. Gentle's website license is paid, so it has not been purchased or bundled. Body text and buttons use DM Sans for readability. Fraunces is hosted locally through `next/font/local` in `app/layout.tsx`; its static 650-weight, 100-softness, 72-optical-size instance and license are in `public/fonts/Fraunces-Soft-Semibold.ttf` and `public/fonts/Fraunces-OFL.txt`. Source: https://fraunces.undercase.xyz/. If you later provide a licensed Gentle webfont, change the font path in `app/layout.tsx` and `app/opengraph-image.tsx`.

Your palette-matched Z logo is in `app/icon.png`. Replacing that PNG changes the browser icon, header home icon, and logo on the generated share image. Use a square PNG and keep the same filename.

## RSS and sharing

The RSS link opens `/rss`, which explains how to copy `/journal/feed.xml` into a reader. Browsers may display raw XML if you open the feed directly; that is expected. New entries appear in the feed automatically.

The tab icon and shared-link picture are separate. `app/icon.png` sets the tab icon. Link previews use the title/description in `content/site.ts` and the generated picture in `app/opengraph-image.tsx`. Messaging apps can cache old previews for a while after an update.

## Spotify is shelved

The player, polling, and connect prompt have been removed from the pages. The old integration code is kept for a possible future restart; no Spotify account setup or new paid service is part of this update.

## Compare the font and color studies

`/design-preview` contains three full homepage studies. They reuse your actual layout and copy, and do not change the main homepage. They are excluded from search indexing. All study fonts are available through Google Fonts or the existing Fontsource packages; no commercial font was purchased.
