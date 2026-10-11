# Public experience — feedback milestone 3

Started 2026-10-11 UTC from verified local and remote experimental head 89b13f010c790455cf4c7c6d5178549650caedc1. Main remains 64ebf8a4773889eb8278901512b30dd9aa34c071. This is a public-site refinement milestone, not whole-project completion. Listening/reading integration and artwork sourcing are separate handoffs; tree tool-scene development remains behind the public website.

## Feedback inventory and acceptance checks

| Request | Implementation / acceptance | Status |
| --- | --- | --- |
| Engineer ⇌ Author inline | One line, above Zack Cook, same collection-label typography; opening CTA still visible on short phones | Pending |
| About opening font | Same font, size and line-height as following body paragraphs, original wording/paragraphs intact | Pending |
| About scroll experience | Restrained paragraph entrances, persistent illustrated marginalia and reading depth, no scroll interception | Pending |
| Consistent buttons | Explicit primary, text-action and icon treatments independent of anchor/button HTML; matching directions/calendar controls | Pending |
| Calendar extra prose / close outline | Remove both marked helper paragraphs; deliberate initial dialog focus and retained keyboard-only focus indication | Pending |
| RSS wording | Author explicitly authorized this page's simpler voice rewrite; document exact copy exception | Pending |
| Moon movement | Equally deliberate sun/moon transition, reduced-motion fallback | Pending |
| Find me at line | Shared CollectionHeading treatment restores missing rule | Pending |
| Repeated milestone heading | Remove note heading duplication while retaining selected labels and accessible descriptions | Pending |
| Mobile tilt default | Existing default true/explicit opt-out preserved; explain platform permission distinction; physical sensor verification honest | Pending |
| Whole pile link | Below leaf in DOM and visible composition, both phone and desktop | Pending |
| Continuous dynamic light | One shared smoothed source illuminates page atmosphere and controls; soft bounded reflections without hard section-edge clipping | Pending |
| Persistent parallax | Distinct art planes continue through community, biography, Folly and shoutouts; quiet reading zones | Pending |
| Dial / date | Remove misleading planned-stage dots; consistent graduation geometry; whole date stays together | Pending |
| Hover layout shift | All notes occupy the same measured grid cell; title and adjacent content remain stable across selection | Pending |
| Calendar light | Text action uses the same dynamic rule as directions and other text controls | Pending |
| Supplied bird GIF | Exact looping asset, only right-to-left, independent random interval/height/size; size correlates with speed | Pending |
| Super-foreground motes | Bounded particle count, random placement, scroll depth and gentle twinkle, noninteractive, hidden under reduced effects | Pending |
| Typography/marketing review | Evidence and proposed copy changes separate from implementations; no invented conversion promises | Pending |

## Research conclusions and design decisions

Sources checked once for this milestone:

- W3C, [Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html): descriptive organization helps visitors locate and understand content. Preserve meaningful structure, not decorative heading proliferation.
- W3C, [Consistent Identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification.html): recognizable recurring controls support reuse of learned behavior. Our explicit control variants are a design inference, not a claim that every different action must look identical.
- W3C, [Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html): nonessential interaction-triggered motion can be disabled. Keep OS and site reduced-effects controls effective.
- NN/g, [Layer-Cake Scanning](https://www.nngroup.com/articles/layer-cake-pattern-scanning/): observed scanning often uses headings to find relevant text. Keep orientation labels legible and distinct from display titles.
- Tuch et al. (2012), [visual complexity and first impressions](https://research.google/pubs/the-role-of-visual-complexity-and-prototypicality-regarding-first-impression-of-websites-working-towards-understanding-aesthetic-judgments/): screenshot experiments concern aesthetic judgments, not signup conversion or guaranteed behavior. Preserve a quiet focal region while concentrating artwork at edges and transitions.

Application is our judgment: retain Zack's name and invitation as the first-view hierarchy; make Greetings, fellow person! a smaller, welcoming bridge into biography. Keep the four semantic palettes and existing author voice. Give native scroll transitions coherent depth but do not animate every paragraph theatrically. Reserve a filled primary action for signup/submission; use one recognizable text-action grammar for exploration/calendar/directions. The planned revision ring should look unstarted, not like a completed dotted perimeter. Actual layout stability must be checked in a browser.

## Copy boundaries and suggestions for review

Zack explicitly permits the RSS rewrite and calendar helper removals. All other prose, factual content, hidden text and paragraph order stay authored and intact. Suggestions below are not silently applied:

| Area | Suggestion | Reason / limit |
| --- | --- | --- |
| Greetings, fellow person! | Keep the words; lower its display emphasis below the invitation | Typography judgment, not a research-defined ideal font size |
| BIO1990 | Keep playful label paired with Who am I?; consider a plainer label only if Zack later chooses | A cryptic label alone is weaker orientation; do not rewrite now |
| More deets / The whole pile | Keep voice and nearby context; consider more explicit accessible wording only with Zack's approval | Current destinations are already contextual; no replacement prose invented |
| Event description | Preserve invitation and exact venue/schedule; keep action pair adjacent | Location, time and next step should remain easy to find |
| RSS | Replace technical explanation with one short instruction and retain copy/open/read actions | Explicit rewrite authorization; the XML endpoint remains functional |

## Verification

Local implementation complete; first automated pass: type checking PASS, optimized CTA-enabled build PASS (47 routes and generated theme/art checks), authored route/copy preservation PASS within the explicit RSS/calendar exceptions. Native browser checks and final visual refinement remain pending. Physical device orientation, touch hardware and representative low-end FPS require real-device evidence; do not certify them from desktop iframes.

## Exact next action

Commit and publish the implemented public milestone using the established authorized native Git path. Create only an experimental Preview. Verify the actual responsive control/scroll/discovery flows, refine observed issues, then update this record and WORK_CHECKPOINT.md before pausing for direction feedback.
