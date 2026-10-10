# Living marginalia — a warm reading room

## Latest direction, feedback milestone 2 — 2026-10-10
The public website is a warm, imaginative reading room, independent of the tentative novel's swamp setting. Swamp artwork belongs only in the hidden tree. Zack's reference recordings show loose side-profile bird flocks and Apple Home Screen reflections: translate those principles into original flight silhouettes and steady optical surfaces, without copying footage or artwork.

Original modular SVG placeholders establish window light, paper, books, open pages and botanical details. Semantic roles paint them across the four timelines/modes; registry slots accept native/image/mask/none and individually replaceable theme variants. Final commissioned or author-supplied assets should preserve independent depth planes, quiet text areas, transparent edges and intentional phone crops. See ARTWORK_REPLACEMENT_BRIEF.md. These placeholders are not final artwork approval.

Photos stay steady, with restrained face sheen and a one-pixel curved edge reflection. Glass primarily marks controls and navigation. One shared smoothed pointer/sensor loop drives bounded local reflection positions; explicit sensor opt-outs and reduced effects remain. Strong native scroll depth separates window/desk planes; section entry and 680ms route chapter reveals make exploration legible without controlling the visitor's scrolling.

The small Engineer ⇌ Author label precedes the name; the exact main CTA remains in the initial phone view. Folly labels inherit 11px section typography. Kitty discovery uses repeating three-bird flocks and permanently changes the photo/reveals Zack's exact Brave chased a shadow and got outside. / Follow him. wording. Settings belongs at the bottom of phone navigation and beside appearance on wide screens. Milestone 2 is implemented and focused browser/source checks pass; pause for direction feedback before further route composition.

Focused primary references:
- Apple materials: https://developer.apple.com/design/human-interface-guidelines/materials
- Apple Liquid Glass: https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass
- React ViewTransition: https://react.dev/reference/react/ViewTransition
The design inference is restrained edge/optical feedback on steady surfaces, not a claim that a CSS effect reproduces Apple's compositor. Physical sensor behavior needs device verification.

## Constraint clarification, 2026-10-09
Zack explicitly rejected retaining the old boxes, folder navigation, menu buttons, layout, and visual hierarchy. Authored words remain exact; presentation is free to change comprehensively. The tree's original dream and established functional experience remain the starting point. No extra website prose or navigation destinations are needed for this redesign.

## Original visual system
- An open, warm editorial reading room: oversized but balanced display typography; fine engineering rules, useful progress diagrams, paper/books and botanical detail; photographs treated as windows into the person rather than nested cards.
- Content spreads instead of a card stack. The manuscript is an asymmetric title/progress composition; events have a typographic schedule/venue composition; biography is an open image-and-text spread; Folly leaves inhabit an illustrated clearing; shoutouts are a restrained directory.
- A slim transparent/blurred header and an accessible full-screen navigation sheet on smaller screens. Existing names and routes only. Controls are ink-like links or small purpose-specific surfaces, not universal bevelled rectangles.
- Shared semantic palettes connect timeline states while public artwork and the hidden swamp remain distinct. Living and felled modes change light and atmosphere without changing legibility.
- Native scrolling. Pronounced opposing art planes and progressive chapter reveals; no scroll hijacking, obligatory intro, cursor replacement, or continuous motion over reading text. Reduced-motion/effects users receive complete stationary content.
- Component-scoped styles for new compositions. Replace legacy global/material overrides instead of adding another final-corrections layer. Interactive preferences, leaves, calendars, server integration and secret intent stay functional; the ribbon presentation is superseded by the author-requested flock.

## Focused live reference observations
On 2026-10-09 the actual reference sites were inspected in the cloud browser, including initial composition and subsequent scrolling (desktop). These are observed principles, not copied assets or layouts:
- Impilo (`https://impilo.health/`): a dominant chromatic field, very clear typographic hierarchy, line-art imagery related to its subject, scroll-led product visualization, changing words inside an anchored headline, and spacious transitions. Its long smooth-content staging can delay reaching ordinary reading content; retain native scrolling here.
- Hellboy (`https://www.hellboywebofwyrd.com/`): layered full-viewport artwork, tightly integrated type/art direction, deep silhouette framing, and scroll-triggered spatial changes. Apply the principle of a consistent illustrated world, not its comic art, gothic composition, palette, or signature reveals.
- Mobile and interaction verification of our implementation is mandatory. Desktop observation of references is not evidence that our responsive site works.

## Color / perception / accessibility
The four palettes already centralized in `design/themes.json` remain the chromatic foundation. Background/surface/ink/muted/accent/foliage/brass/sky/bark roles are reused throughout, rather than adding component hex palettes.

Supported requirements: ordinary text 4.5:1; large text 3:1; meaningful control/graphic cues 3:1. Selection must also use geometry/weight/underlining, not color alone. Decorative low-contrast rules are not the sole boundary of an interactive control. Motion/effects must be suppressible. Contrast tests check actual role pairs, followed by browser checks of composed surfaces.

Sources:
- W3C text contrast: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- W3C non-text contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- W3C interaction animation: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- Palmer & Schloss, ecological valence theory (original research): https://www.pnas.org/doi/10.1073/pnas.0906172107

Color/object associations can inform an environmental palette, but do not guarantee trust, purchases, comfort, or exploration. Cozy greens/cream and melancholy plum/ash are art-direction intentions, not universal psychological outcomes. The same hue can have different associations across people and contexts. Readability and predictable feedback take priority over speculative marketing claims.

## Verification gates
Exact-copy and content hashes; route inventory; Next/TypeScript build; actual mobile and desktop renders; all four themes; full navigation and history behavior; calendar/preferences/ribbon/leaves; reduced effects; no horizontal overflow; tree input and backend isolation. A code-only milestone is not visual sign-off.
