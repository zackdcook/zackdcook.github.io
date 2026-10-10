# Replaceable artwork brief

These are working placeholders, not final artwork. The composition, depth and lighting are independent of the illustrations. Zack supplies all visible words; artwork should contain no lettering, invented slogans or baked-in interface controls.

## Recommended identity

Make the site a warm Florida writing retreat: cypress, scrub, evening water, weathered wood and little traces of an engineer who writes fiction. Use a restrained painted or cut-paper treatment with visible material and light. Strong silhouettes and negative space matter more than detail. Avoid generic fantasy clip art, unrelated mascots and the rejected origami bird.

The first priority is a single coherent environment split into transparent planes. Trees, reeds and light should overlap naturally but leave calm reading space around the name and invitation. The second priority is an illustration drawn from the actual manuscript, chosen by Zack, for Creative Works. Photos stay personal and honest.

| Replacement slot | Recommended artwork | Source delivery and framing |
| --- | --- | --- |
| `hero-landscape` | A distant Florida cypress/swamp horizon: broad water, hazy trunks and a warm opening in the canopy | 2800 × 1600 transparent master; distinct silhouettes, soft top transition, quiet left half. Keep important subjects in the central 60% for mobile crops. |
| `hero-foreground` | Near reeds, palmetto and scrub framing the same scene | 2400 × 1600 transparent master; most detail along bottom/outer edges, empty center. Separate from the horizon so scrolling can move each plane independently. |
| `page-scenery`, `navigation-scenery` | Alternate crop or simpler extension of that same environment | Wide transparent layer, same horizon/light direction. No distinct new visual style per page. A separate image can be assigned to each slot later. |
| `event-illustration` | A warm evening gathering place associated with the real writing group | 2200 × 1400 master with subdued center behind existing event text. Use Zack's venue drawing/photo if preferred; no invented venue details. |
| `folly-scenery` | A clearing or scattered botanical detail that belongs to the same world | 2200 × 1600 transparent master. Leave the interactive leaf shapes and quote text live in the interface. |
| `hero-orbit`, `hero-branch`, `manuscript` (currently disabled) | Optional personal objects: a marked manuscript, drafting instrument or detail from Zack's fiction | Isolated transparent cutouts, about 1200 px on the long side. Introduce only objects with personal relevance; leaving a slot empty is supported. |
| `progress-dial` | Optional custom instrument/hand-drawn dial face | Square transparent face, 1000 × 1000. The progress, numbers and controls remain live; do not paint them into the face. |
| `portrait`, `cats`, and other photo slots | Zack's own photographs with intentional crops | Full-resolution originals; portrait crops to a rounded square. Cat photo must include its window; update normalized `design/kitty-window.json` coordinates if the photo/crop changes. |
| `kitty-shadow` | A simple bird seen as a soft shadow, with a recognizable body/wing silhouette | Transparent mask or native SVG, around 256 × 160. No origami geometry. The original photo alone receives recurring side-to-side flights; the revealed photo has no shadow overlay. |
| Tree world (deferred) | One substantial bark master, separate base/roots, swamp distance and near scrub | Bark must tile vertically without seams; ground/base must join it. Deliver layered originals so perspective, carving visibility and both timelines can be evaluated together. |

## Light and timeline variants

The four semantic themes already recolor/tone the default scenery. A stronger final result uses the same geometry and crops in four separately painted exports: warm parchment daylight, blue-green dusk, drained late light after felling, and an ash/plum night after felling. Keep readable text surfaces and silhouettes consistent; melancholy comes from environmental light and missing foliage rather than reducing text contrast. A single neutral master with theme filters remains a supported starting point.

Keep sun/moon glow, atmospheric haze and foreground shadows separate when preparing source artwork. Dynamic cursor/optional tilt lighting belongs to the live material system; do not bake a moving specular highlight into every image. Static light direction should agree across layers.

## Drop-in implementation

- Registry: `design/art-assets.json`; generator: `npm run art:build`; validation: `npm run art:check`. Slots support `image`, `mask`, `native` and `none`, with optional four-theme variants. Change the registry/local asset path without changing page components.
- Deliver layered originals in a format Zack can edit with free tools (for example Krita/OpenRaster), plus individual transparent PNG masters. Export the web versions as alpha WebP/AVIF where appropriate; native SVG is useful for simple masks/icons. There is no requirement to buy software or image services.
- Aim for roughly 150–400 KB per scenery plane at web dimensions; measure the result rather than sacrificing visible quality to an arbitrary number. Keep crisp faces and readable small silhouettes. Load the portrait first and defer secondary scenery as appropriate.
- Test at 320/375/390 px phone widths, tablet and wide desktop. Preserve generous quiet areas for the existing text and CTA, especially in the first viewport. Check all four palettes and reduced effects after replacement.

No additional website prose or external art license is required by this brief. The existing cypress horizon and botanical frame are sufficient placeholders while the authored artwork is prepared.
