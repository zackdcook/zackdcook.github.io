# Replaceable artwork and material lighting

Zack's 2026-10-09 direction: the current graphics are provisional. Remove the origami bird from the default layout, preserve four-theme color behavior, make art replaceable, and retain cursor/opt-in phone-tilt lighting inspired by responsive glass. The source bird is archived as an optional template; it is neither rendered nor required. Unassigned decorative slots collapse without empty layout space. Authored words, hidden narrative, reading fields and game coordinates remain intact.

## Replace an asset

1. Put an owned image/design in `public/images/` using an SVG, PNG, JPEG, WebP or AVIF filename without spaces.
2. Change its stable slot in `design/art-assets.json` to `{"kind":"image","src":"/images/your-art.webp","fit":"contain","material":"paper"}`. `mask` tints a single silhouette with a semantic palette role; `native` uses its optional source vector; `none` removes decoration.
3. Run `npm run art:build` and `npm run art:check`. Build validation refuses missing files, external origins, path traversal and injected CSS. No credentials or extra paid storage are needed.

Optional `variants` keys are `living-light`, `living-dark`, `felled-light`, `felled-dark`. Each missing variant falls back to `src`. Generated CSS selects the correct file before paint, including the persisted appearance bootstrap. Only the selected CSS image is requested, with no per-artwork React theme observer. A raster's authored colors are preserved; use four variants for deliberate palette changes or `mask` for automatic semantic tint. Set `tint` to `ink`, `accent`, `foliage`, `brass` or `sun`. Native vectors read these existing palette roles.

## Slots and boundaries

| Area | Slots |
| --- | --- |
| Identity and controls | `brand-mark`, `icon-*` |
| Intro | `hero-landscape`, `hero-foreground`, `hero-orbit`, `hero-branch`, `portrait` |
| Manuscript and events | `manuscript`, `event-illustration` |
| Biography and secrets | `cats`, `name-doodles`; secret cat image remains authored in `content/editorial.json` |
| Folly and navigation | `folly-scenery`, `navigation-scenery`, `leaf-texture` |
| Ribbon | `ribbon-texture` |
| Tree | `tree-sky`, `tree-foreground`, `tree-bark`, `tree-stump`, `tool-*` |

Canonical visitor carvings, procedural leaf collision/lettering outlines, progress values and the secret ribbon's authored labels are functional data. Their layout/geometry and persistence are separate from replaceable decorative skins. Leaf outlines are modular in `content/leaf-shapes.json`; validate a new outline's tapered reading field and collision limits with the existing leaf tests. Custom photos keep their original authored alternative text until Zack provides replacement descriptions.

`ArtworkImage` retains responsive Next.js image optimization for a single photograph. When variants are supplied, it uses the same CSS image selection with the original accessible description; optimize those owned variant files before adding them. Leaf/ribbon textures are optional, clipped beneath their original lettering, and absent by default. Site favicon metadata stays in the existing brand files and `SiteIcons` timeline selection, independent from the on-page brand mark. Cursor lighting also applies to photos with variants.

## One shared light

`PointerLight` owns a single observer/event loop for visible material surfaces. `[data-material-surface]` opts a new element into the shared cursor/tilt source; `Artwork` handles its decorative face and `[data-light-source]` supports environmental light fields. Surface pose is bounded to 1.8 degrees; game coordinates and outer hit targets never move. Rims, light positions and depth all use semantic theme roles. Mouse light holds at rest and stops requesting animation frames after settling. Tilt is opt-in through the existing preference and permission control, with recenter/fallback behavior intact. Reduced effects disable lighting/pose and hide no authored content.

Source validation and browser verification are separate gates. Physical mobile orientation cannot be claimed verified from an iframe viewport. Sources informing the material/permission boundaries: https://developer.apple.com/design/human-interface-guidelines/materials and https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static .
