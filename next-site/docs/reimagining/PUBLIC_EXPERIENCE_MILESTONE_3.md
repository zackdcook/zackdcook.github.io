# Public experience — feedback milestone 3

Started 2026-10-11 UTC from verified local and remote experimental head 89b13f010c790455cf4c7c6d5178549650caedc1. Main remains 64ebf8a4773889eb8278901512b30dd9aa34c071. This is a public-site refinement milestone, not whole-project completion. Listening/reading integration and artwork sourcing are separate handoffs; tree tool-scene development remains behind the public website.

## Feedback inventory and acceptance checks

| Request | Implementation / acceptance | Status |
| --- | --- | --- |
| Engineer ⇌ Author inline | One line, above Zack Cook, same collection-label typography; opening CTA still visible on short phones | Implemented; browser pending |
| About opening font | Same font, size and line-height as following body paragraphs, original wording/paragraphs intact | Implemented; browser pending |
| About scroll experience | Restrained paragraph entrances, persistent illustrated marginalia and reading depth, no scroll interception | Implemented; browser pending |
| Consistent buttons | Explicit primary, text-action and icon treatments independent of anchor/button HTML; matching directions/calendar controls | Implemented; browser pending |
| Calendar extra prose / close outline | Remove both marked helper paragraphs; deliberate initial dialog focus and retained keyboard-only focus indication | Implemented; browser pending |
| RSS wording | Author explicitly authorized this page's simpler voice rewrite; document exact copy exception | Implemented; browser pending |
| Moon movement | Equally deliberate sun/moon transition, reduced-motion fallback | Implemented; browser pending |
| Find me at line | Shared CollectionHeading treatment restores missing rule | Implemented; browser pending |
| Repeated milestone heading | Remove note heading duplication while retaining selected labels and accessible descriptions | Implemented; browser pending |
| Mobile tilt default | Existing default true/explicit opt-out preserved; explain platform permission distinction; physical sensor verification honest | Implemented; browser pending |
| Whole pile link | Below leaf in DOM and visible composition, both phone and desktop | Implemented; browser pending |
| Continuous dynamic light | One shared smoothed source illuminates page atmosphere and controls; soft bounded reflections without hard section-edge clipping | Implemented; browser pending |
| Persistent parallax | Distinct art planes continue through community, biography, Folly and shoutouts; quiet reading zones | Implemented; browser pending |
| Dial / date | Remove misleading planned-stage dots; consistent graduation geometry; whole date stays together | Implemented; browser pending |
| Hover layout shift | All notes occupy the same measured grid cell; title and adjacent content remain stable across selection | Implemented; browser pending |
| Calendar light | Text action uses the same dynamic rule as directions and other text controls | Implemented; browser pending |
| Supplied bird GIF | Exact looping asset, only right-to-left, independent random interval/height/size; size correlates with speed | Implemented; browser pending |
| Super-foreground motes | Bounded particle count, random placement, scroll depth and gentle twinkle, noninteractive, hidden under reduced effects | Implemented; browser pending |
| Typography/marketing review | Evidence and proposed copy changes separate from implementations; no invented conversion promises | Complete |

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

Implementation committed as bc7a3cf371d02d1e9683d0e5a7bf357dea6cac55, following 97340f4 and the verified 89b13f0 baseline. These ordinary descendant commits remain LOCAL/UNPUBLISHED; remote experimental head is still 89b13f010c790455cf4c7c6d5178549650caedc1. No force push or history rewrite occurred.

Type checking PASS; optimized CTA-enabled build PASS (47 routes and generated theme/art checks); 93 named TypeScript tests PASS and five signup API tests PASS (explicit TAP rerun confirms five executed, zero failures). Route/authored-copy preservation PASS within the recorded RSS/calendar exceptions. Four-theme contrast checks PASS. Native browser checks and final visual refinement remain pending. Physical device orientation, touch hardware and representative low-end FPS require real-device evidence; do not certify them from desktop iframes.

Vercel file-upload Preview READY: dpl_9QwjjarpAbfYq7wd3WLj2faYNsJd, https://zack-cook-a8k21u61y-dove-mack0o-3684.vercel.app . Source is the exact tracked bc7a3cf tree, excluding environment templates. The files and source metadata were uploaded through the authorized API; GitHub was not written. Target is null (Preview); no alias was assigned and the previously tested stable alias remains on milestone 2. Deployment protection remains intact. No production configuration, dependency, database, migration or environment change was made. Build-log read returned 403; deployment metadata independently reports READY.

Browser publishing/verification blocker: the supported Codespace Explorer Upload action stalled, then browser observation and runtime-reset calls timed out. The native Git importer was never executed, and the final state of uploaded files and the Codespace cannot be verified in this session. Preserve the local commits, reviewed importer and incremental bundle. On recovery inspect the original spring-clean checkout and the separate bare publishing mirror before doing anything. Do not discard untracked files or repeat a push without checking the remote head. A pending chooser must receive setFiles from the already-registered waitForEvent promise BEFORE awaiting the native click, as the established checkpoint instructs. Do not repeat the blocking sequence.

The acceptance table above describes implemented checks, not browser sign-off. All rows requiring visible, pointer, keyboard, responsive or sensor behavior remain unverified for this new source. The research review and documented copy suggestions are complete. Previously verified flows are retained in source but must be rechecked where this milestone affects them.

## Exact next action

Restore browser responsiveness, inspect/stop the existing cautious-trout Codespace if still running, then publish the preserved exact descendant commits with the established isolated native Git path. Verify this READY file-upload Preview's actual responsive control/scroll/discovery flows, refine observed issues, and update this record and WORK_CHECKPOINT.md before pausing for direction feedback. Do not create another identical deployment merely for a documentation-only commit. Do not start listening/reading integration, duplicate image sourcing or resume tree gameplay development.
