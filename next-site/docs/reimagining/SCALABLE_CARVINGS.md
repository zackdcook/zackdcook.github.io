# Completed-carving storage and rendering

Implemented in the experimental branch, using only the existing free test database. Migration: `20261009190308_bebrave_canonical_archives.sql` (CLI-created filename reconciled to the applied ledger).

## Separate ledgers, originals and display

- `bebrave_sessions` / visitors / reward records stay unchanged: individual associations, care cooldown, test reset watermark, tool, rarity, seed, effect ID, location, order and publication state remain authoritative.
- `bebrave_completed_archives` stores one lossless gzip container per completed session. The exact PostgreSQL JSON text retains every original chunk field, ID, timestamp, duplicate boundary point, precision and future additive field. SHA-256 protects both original bytes and compressed payload. The original artwork can be reconstructed for later rendering changes.
- A separately versioned render projection uses iterative RDP at 0.2 world units and the existing lossless delta/varint transport (raw fallback for non-grid coordinates). Original-path seeded sparkle positions are stored before simplification; rare effects retain their placement, phase and appearance.
- Indexed viewport session lookup still uses the existing GiST range index and 12-session pages. The client loads five nearby sections and keeps a bounded adjacent cache. Completed effects outside the actual camera pause through one IntersectionObserver. Older public sessions still paint above newer sessions; individual stroke order remains intact.
- Ordinary compact viewport reads fetch projections only. `/api/bebrave/carvings/[id]` selectively restores and verifies original geometry, without exposing visitor identity or reward data. Non-compact viewport requests also preserve original geometry. Unarchived legacy sessions retain the cursor-paginated raw-chunk path.

## Atomic replacement

The server requests the canonical database document, validates all chunks and budgets, compresses it off the database, then verifies an exact decompression round trip. The sealing RPC takes the same session row lock used by append/finalize, requires a completed published session, recomputes its canonical source hash, checks the chunk/point ledger, validates stroke IDs/order and payload checksum, then inserts the archive and removes the redundant chunk rows in one transaction. No session, visitor, tree or reward record is changed. Same-hash retries are idempotent; conflicts fail. Anonymous/authenticated roles cannot reach the archive table or RPC.

Finalization performs this optimization after the ordinary gameplay transaction. An optimization failure retains the legacy read path and does not undo publication. Overdue sessions that finalize elsewhere can be backfilled with the private export/preparation workflow; no paid scheduler or database extension is added. `scripts/prepare-carving-archives.ts` accepts a reviewed SQL export and produces private RPC arguments; keep both files outside Git/public deployments.

## Verified checks

- 77 source tests pass, including exact byte/metadata/precision restoration, integrity failure, bounded decompression, ordering and unchanged original-path Legendary anchors; TypeScript and production build pass.
- Actual test-database transaction verifies rejected source/payload/projection changes, successful replacement, idempotent retry and byte-equivalent session/visitor/tree ledgers. Subsequent persistent backfill of all 21 preexisting completed sessions restored canonical text byte-for-byte and kept all individual ledger hashes unchanged. Real 60-second Legendary mouse carving published as sequence 22 and archived automatically. Original 20 carvings remain intact; all 50 distribution codes remain unredeemed. See BROWSER_VERIFICATION.md.
- RLS and grants checked: anonymous table SELECT and archive RPC EXECUTE are denied. Security advisor has only intentional INFO about service-only tables with RLS/no browser policies.
- A real existing canonical document measured 30,514 bytes; its lossless gzip measured 6,458 bytes. This is JSON-text compression, **not** a claim about physical database-disk savings; PostgreSQL already compresses large values with TOAST, and the separate projection has its own footprint.

## Scale experiment and limits

`node --import tsx scripts/benchmark-carvings.ts` generates 2,400-point carvings with separate IDs, verified complete canonical containers and original-path Legendary anchors. Synthetic metadata indexes grow from 100 to 100,000 records; geometry is generated only for the five-section camera window. It runs the actual React SVG renderer. Results are in `carving-scale-results.json`.

| Population | Visible records | Render points | SVG elements | Viewport JSON bytes |
| ---: | ---: | ---: | ---: | ---: |
| 100 | 19 | 2,964 | 3,345 | 198,541 |
| 1,000 | 19 | 2,964 | 3,345 | 199,097 |
| 10,000 | 19 | 2,964 | 3,345 | 199,962 |
| 100,000 | 19 | 2,964 | 3,345 | 200,011 |

This intentionally uses all-Legendary visible art, substantially denser effects than ordinary random rarity. Local projection decode measured 0.196–0.885 ms. Local server SVG generation measured 21.3–76.951 ms, with warm-up variation; these are not browser FPS or live-database timings. The prior actual GiST database test used 100,000 rolled-back metadata rows. The new benchmark verifies full geometry round trips and rendering, but does not allocate or persist every population's entire geometry history.

Normal growth keeps a fixed camera window independent of total history. Pathological simultaneous populations carving the same zone can increase local density; progressive/dense raster-layer benchmarking remains a future limit to investigate, not a passed constant-cost claim. The free database is finite (500 MB shared with existing features); archives reduce repeated rows/transfers but do not promise unlimited storage. Monitor actual database/egress usage and use an explicit future export/storage policy before reaching included limits. No paid resource is activated.

Extreme full-height native scrolling/SVG layout also needs an actual browser capacity test; the Node benchmark certifies the camera's loaded geometry, not arbitrarily tall DOM coordinates. A camera-window renderer must be considered before claiming year-scale extremes verified. The new original-art lens loads exactly one canonical carving on demand and retains original effect anchors; it never downloads all history.

Primary references: https://nodejs.org/api/zlib.html , https://www.postgresql.org/docs/current/storage-toast.html , https://supabase.com/docs/guides/api/securing-your-api . The current Supabase changelog through 2026-10-08 has no relevant breaking change to this service-only SHA-256/range-index design.
