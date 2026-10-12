# Experimental deployment storage review — 2026-10-11

## Observed state

- Account: `dove-mack0o-3684`; project: `zack-cook` (`prj_AcuTfmUBydayvETed53KCREnlONa`); Hobby.
- Overview read 7.74 GB / 10 GB Function Storage; the fresher detailed Last 30 Days view later read **8.18 GB**, entirely attributed to this project. These are dashboard observations at different update times, not a verified amount after cleanup.
- Current B Resources lists 40 Functions. Representative page functions are 19.9 MB, API functions 19.6 MB, and middleware 601 kB, in IAD1 with Node.js 24.x.
- Latest 100-deployment inventory contains 32 previews from this experimental branch, 41 main deployments, and unrelated branches. Inventory pagination indicates older deployments also exist; this is not an exhaustive team history.
- Inference: retained compiled function bundles from repeated previews are a substantial contributor. Function Storage is separate from Supabase database/carving storage and from Deployment Storage, so compressing carving records will not remove these retained bundles.
- No retained deployment was deleted. Production data, security settings, budgets, paid plans and retention settings remain unchanged. After one new final Preview, the refreshed detailed view still displayed 8.18 GB (Updated just now); this does not establish immediate per-deployment accounting.

## Reviewed cleanup — seven deleted, one held

The user authorised the exact eight targets at 18:07 EDT on 2026-10-11, conditional on preserving current versions. **Seven were deleted; row 5 remains held.** Deleted URLs no longer work; source history remains in GitHub.

Each was independently read through the deployment API as READY, target `null` (Preview), correct experimental branch and project. Seven report no aliases. The `lh04c9lyd` deployment has a historical branch alias in its metadata, but an independent `get_alias` read confirms the actual live alias resolves to `dpl_CviyK3XWLsh7UhZxcgsx1FqXQh6j` (`cszi1ed87`). Recheck active aliases immediately before deletion.

| # | Deployment ID | Immutable URL | Source | Reason / outcome |
| --- | --- | --- | --- | --- |
| 1 | `dpl_7fxaXBgejMHEAM2JEfH68erFhEe4` | [zack-cook-i1c5rzumy-dove-mack0o-3684.vercel.app](https://zack-cook-i1c5rzumy-dove-mack0o-3684.vercel.app/) | `a0b5660` | Duplicate of preserved A (`7efdku8ep`), same source SHA — **DELETED; independent API read returns 404.** |
| 2 | `dpl_moFt4cgfysq4CtFaK2AFDutfEmrL` | [zack-cook-dvwwq0kot-dove-mack0o-3684.vercel.app](https://zack-cook-dvwwq0kot-dove-mack0o-3684.vercel.app/) | `a0b5660` | Duplicate of preserved A (`7efdku8ep`), same source SHA — **DELETED; independent API read returns 404.** |
| 3 | `dpl_EXbu6RCF93JoTEByPW5L1vbvrwcF` | [zack-cook-apjisa90u-dove-mack0o-3684.vercel.app](https://zack-cook-apjisa90u-dove-mack0o-3684.vercel.app/) | `a0b5660` | Duplicate of preserved A (`7efdku8ep`), same source SHA — **DELETED; independent API read returns 404.** |
| 4 | `dpl_DgR1fShDFLEEkU9ii36soYDdECXt` | [zack-cook-c74v1vykv-dove-mack0o-3684.vercel.app](https://zack-cook-c74v1vykv-dove-mack0o-3684.vercel.app/) | `a0b5660` | Duplicate of preserved A (`7efdku8ep`), same source SHA — **DELETED; independent API read returns 404.** |
| 5 | `dpl_DS7NhA5sqMFmyxVxsyELFX1zVZEb` | [zack-cook-lh04c9lyd-dove-mack0o-3684.vercel.app](https://zack-cook-lh04c9lyd-dove-mack0o-3684.vercel.app/) | `6b5b4c1` | Superseded B diagnostic; final B (`mo9gfql7g`) and source commit preserved — **HELD: automatic approval review blocked deletion; alias association needs reconciliation.** |
| 6 | `dpl_CvbPPKULRy8t5DRGWyRsPjUfpimP` | [zack-cook-i0l42suv6-dove-mack0o-3684.vercel.app](https://zack-cook-i0l42suv6-dove-mack0o-3684.vercel.app/) | `29b2946` | Superseded B diagnostic; final B (`mo9gfql7g`) and source commit preserved — **DELETED; independent API read returns 404.** |
| 7 | `dpl_CvYsgaCttQSXmmyhzNDJBGKU8Pgz` | [zack-cook-ly25s3plz-dove-mack0o-3684.vercel.app](https://zack-cook-ly25s3plz-dove-mack0o-3684.vercel.app/) | `2adb464` | Superseded B diagnostic; final B (`mo9gfql7g`) and source commit preserved — **DELETED; independent API read returns 404.** |
| 8 | `dpl_FsRg8jCvjrvyrTnwFWUpMsAzdyFt` | [zack-cook-p54b6iw5x-dove-mack0o-3684.vercel.app](https://zack-cook-p54b6iw5x-dove-mack0o-3684.vercel.app/) | `5a92393` | Superseded B diagnostic; final B (`mo9gfql7g`) and source commit preserved — **DELETED; independent API read returns 404.** |

Keep:
- Production deployments, domains, database and all main branch history.
- Preserved A: `dpl_GcNcBe5wD1k2j8GGDBN5x8m2d867` / `7efdku8ep`.
- Preserved B: `dpl_afzChy7QG7WzbLKYQuJB4weAFUXR` / `mo9gfql7g`.
- Existing branch shortcut target: `dpl_CviyK3XWLsh7UhZxcgsx1FqXQh6j` / `cszi1ed87`.
- Listening/reading branch previews and every other project or branch.
- New falling-paper Preview: `dpl_5t1bScRe3FbMF8DhkLeeEpM3cSjj` / `da7jbra30`, exact source `f34b5c78b45f4391590c7b2282ae80cae013780f`.

**Status: seven deletions confirmed; one held.** A, B and the current Preview remain READY; current website reload works. Main and the live shortcut assignment remain unchanged. Automatic approval review rejected row 5 because its deployment page visibly lists the retained shortcut despite the API assigning that alias to another preserved deployment. Do not bypass the rejection; leave that build intact until reconciled.

The refreshed meter still reads 8.18 GB. Official storage documentation specifies GB-month accounting from each project's daily maximum. Removing output does not undo already counted daily peaks. Do not claim an immediate decrease or exact reclaimed GB; review future daily measurements. No paid plan, retention policy, production resource or unrelated branch was changed.

## Avoid repeating the growth

- This milestone uses an isolated, private Codespace for iterations, then one final Vercel Preview deployment. Experimental Git automatic deployment stays disabled in both existing Vercel config files.
- Existing build output tracing is already optimized differently by the Vercel adapter: local repeated trace sums overstate unique remote storage. Do not blindly exclude Sharp/libvips, Next.js runtime, or shared modules merely because local trace sums look large; they support preserved image and server functionality.
- Review project Settings → Security → Deployment Retention. Current official Hobby guidance retains fewer deployments with a 30-day age threshold and protects current production, recent deployments, and active branch aliases. These duplicate previews are only days old, so age-based pruning alone will not immediately remove them.
- Apply any future retention change only after reviewing all branches' preview needs. It changes which older URLs will remain available; do not silently remove another ongoing chat's preview.
- If cleanup is insufficient, inspect retained builds' Resources and broad server imports next. Verify every affected API/page after a real bundle-size change, using free infrastructure.

## Primary references

- https://vercel.com/docs/deployment-storage
- https://vercel.com/docs/deployment-storage/optimize
- https://vercel.com/docs/deployment-retention
- https://vercel.com/changelog/hobby-projects-now-retain-fewer-deployments-to-free-up-storage
