# Living cypress preview

Baseline: `e76fe250853b4e77fb78bd46a3a0a4f7b5eff46d` on `main`.
Preview branch: `feature/living-cypress`. Do not merge or promote automatically.

## Audit and implementation order

The existing App Router site runs Next 16.3.8 and React 19.3 (the lockfile already resolves React 19.3). Vercel remains the host. The existing palette, Fraunces display face, paper folder navigation, progress rings, posts, owner authentication, calendar, RSS, and user-written copy remain the starting point. Supabase client/auth code exists; the connected Supabase account currently lists no projects. A connected plugin is not proof that a database is provisioned. No new paid services are required or enabled.

1. Pin the existing React versions; enable Cache Components/partial prefetching, migrate old revalidation configuration, and place request-dependent UI behind Suspense. Keep the header/footer as reusable route shells.
2. Add native React ViewTransition boundaries with a short unfurl/fold language. Unsupported browsers retain ordinary navigation. A single RAF lighting controller updates CSS variables on visible tactile surfaces, with geometry measured separately from writes. Idle/touch-release light decays; the loop stops when faded.
3. Add a small preferences dialog: light/dark/system, compact spacing, expanded project descriptions, Reduce Effects. A guarded head script applies local preferences before paint. OS reduced motion always wins. No accounts, analytics, or tracking required.
4. Move repeatable editorial copy and project records into typed content files. Use the same records for presentation, metadata, and locally generated social cards. Preserve existing copy. No CMS subscription.
5. Build an explorable cypress world with permanent coordinates, visitor-selected placement, exact numeric signature geometry, collision masks, and spatial loading. Native browser scrolling remains primary. Historical sections and landmarks never rearrange.
6. Reserve a chosen footprint transactionally before accepting a pending entry. Turnstile, durable rate limits, verified owner moderation, and bounded email notifications protect the queue. Approval commits the reserved coordinates and allocates a permanent chronological number atomically.
7. Verify validation, moderation ordering, concurrent approvals, cache freshness, keyboard/touch drawing, theme persistence, reduced effects, hydration, metadata, and existing features. Make a reviewable preview and document the exact remaining account setup.

## Services and responsibilities

| Service | Responsibility | Cost control |
| --- | --- | --- |
| Existing Vercel Hobby | Next rendering, Server Actions, preview deployments, OG images | No plan change or paid add-on; no cron/polling |
| Supabase Free | Auth, guestbook, shoutout queue, atomic moderation and rate limits | Additive schema; no storage uploads or paid branch |
| Cloudflare Turnstile Free | Server-verified bot challenge | No phone numbers or SMS; fail closed without keys |
| Resend Free (required to open submissions) | A pending-entry notification linking to the authenticated desk | No approval links containing bearer secrets; reserve quota in database before sending |

## Data and moderation

Guestbook rows contain UUID, canonical server timestamps, moderation status, permanent guest number, typed/drawn mode, name (40 characters), note (60), one of five bundled OFL handwriting fonts, numeric geometry, permanent X/Y, dimensions, and occupied grid cells. Raw SVG/HTML is never accepted. Font outlines are built once from the actual fonts; the browser and server use the same numeric geometry for rendering and collision. A four-world-unit occupancy grid follows ink/strokes with a small safety margin rather than reserving a whole text rectangle. A GIN index supports overlap checks. Private tables hold salted duplicate/rate hashes; raw IP addresses are not retained. Anonymous database roles cannot read or mutate the queues, reservations, or security records. Next route handlers expose only explicitly selected approved fields and anonymous occupied cells for placement.

The world is 720 units wide; a metaphorical foot is permanently 288 units. Initial height is five feet (1,440 units). Every second approval appends 288 units beneath the existing world. The active bounds are `[height - 1,440, height]`. Existing coordinates never change. Three-foot sections have coordinate-hashed, immutable landmarks and width; milestone growth adds richer new sections without changing old ones. These scale constants must not change after the first approval.

Create → preview on real bark → choose a location → reserve → confirm → pending review is the signing flow. Pointer/touch placement and keyboard nudge controls share the same grid; location is never picked automatically. A reservation holds for 20 minutes, then a submitted pending reservation holds for seven days. Expired/abandoned space is excluded from collision checks and released lazily inside transactions; no paid cron is required. An expired pending entry needs a new placement and cannot be silently approved or moved. The browser retains the draft and a safe entry ID; the HTTP-only visitor cookie establishes ownership, not the public ID.

An important frontier rule: growth may move a **valid pending reserved location** above the current active zone. Approval checks the original server-recorded writable-zone snapshot and the still-owned, unexpired footprint, not the new frontier. That preserves the visitor's chosen neighborhood while preventing new reservations in historical bark. No signature is silently relocated to make room.

Email is a notification, not authentication. The owner signs in at `/admin/submissions`, sees the literal carving in its chosen bark neighborhood, and approves/rejects there. Reserve, finalize, and approve use one consistent tree transaction lock. Approval and sequence allocation are atomic and idempotent. Guest numbers and growth are monotonic; future removal must not collapse history. Rejection releases reserved space without ever publishing pending content.

## Accessibility and performance

Typed mode, keyboard placement, and a semantic browse list are full alternatives to drawing/dragging. Carvings reveal localized timestamps on hover, focus, or tap. Native dialogs retain focus and Escape behavior. A native-height world spacer contains only nearby sections; spatial queries load a bounded window and prefetch its neighbors. Scroll/pointer RAF work updates CSS transforms/variables; React updates only when the section window changes. A narrow trunk minimap, oldest/newest helpers, public name search, and Find My Carving navigate fixed coordinates. The viewer initially opens near the frontier. Reduced effects removes parallax, lighting, and travel animation while preserving all navigation. No polling or new image generation per signer. Moderation and reservation operations are always uncached.

## Safety and rollback

Keep `main` and the production domains unchanged during review. Configuration is disabled by default; missing Turnstile/database settings cannot accept public submissions. Do not set the enable flag until the additive schema and keys are verified. No destructive database migration, DNS change, phone verification, or paid resource is part of this branch. Discarding this branch returns to the current live website. If later merged, revert the merge commit or promote the baseline Vercel deployment; additive guestbook tables can remain without affecting the old site.

References: [React ViewTransition](https://react.dev/reference/react/ViewTransition), [Next 16.3](https://nextjs.org/blog/next-16-3), [Cache Components](https://nextjs.org/docs/app/getting-started/cache-components), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Turnstile server verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
