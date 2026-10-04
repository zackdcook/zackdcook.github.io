# Inspo Board archive

Shelved on October 4, 2026 at Zack's request. The homepage section, public `/commonplace` page, and navigation button have been removed. The page is also absent from the sitemap and share-image registry.

These are unchanged source snapshots from production commit `21a739128394142a4f9b63af71c814852a5209f8`:

- `page.tsx.txt`: the former `app/commonplace/page.tsx` route.
- `homepage-section.tsx.txt`: the entire former homepage section.
- `navigation-entry.ts.txt`: the former desktop/mobile menu entry.
- `share-record.ts.txt`: the former share metadata and sitemap record.
- `share-form.tsx.txt`: the original private sharing form, including its public-board link.

The `.txt` suffix keeps these snapshots out of the app's compiled routes. Existing supporting code and storage are retained: `components/commonplace-card.tsx`, `components/collection-heading.tsx`, `components/content-rail.tsx`, `lib/commonplace.ts`, the Commonplace types and curated entries in `content/site.ts`, the styles, and the private sharing tools. No stored entries or database tables were deleted.

To restore the feature, copy `page.tsx.txt` to `app/commonplace/page.tsx`, restore the navigation and share-record entries, and put the archived homepage section back into `app/page.tsx`. Restore that page's `CommonplaceCard`, `ContentRail`, `InspirationHeading`, and `getCommonplace` imports and fetch the entries alongside its other data. Re-add the private form's public-board link when the page is active again. Run the build and check the restored page, menu, and homepage before publishing.
