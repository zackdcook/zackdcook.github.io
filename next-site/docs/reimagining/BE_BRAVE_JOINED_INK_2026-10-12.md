# Be Brave — joined-ink feedback revision, 12 October 2026

## Release

Playable test Preview: https://zack-cook-git-experiment-be-brave-jrpg-aaee4f-dove-mack0o-3684.vercel.app/bebrave

Exact application: `4671459163fdbeb45038b3bf5e279ce0b64805fe`. Deployment `dpl_MCG9hZGxZFqt4K5gcx6qHLoJ1fQx`, READY, Preview target. Immutable artifact: https://zack-cook-ezrptgdxz-dove-mack0o-3684.vercel.app/bebrave . Branch `experiment/be-brave-jrpg-2026-10-12`; separate original worktree preserved. The stable origin preserves personal anonymous identity across future branch previews. Existing Vercel sign-in protection remains; authenticated access succeeded. Anonymous external access was not certified.

This follow-up includes the user's two explicitly requested public-page changes in the test branch: remove the Home discovery popup's outer shadow in dark mode, and add the moss-covered duplicate at the bottom of About Me. No broader public-site redesign or listening/reading work is included.

## Changes

- Each person's carving now renders all original stroke subpaths through one shared ink stack. Crossing strokes join without their own outer edges painting over one another. Original stroke IDs, orders, vertices, color, seed and per-stroke sparkle anchors remain unchanged. Older sessions still paint above newer sessions.
- Colored halos and seeded star highlights are stronger for special rarities; Uncommon has a smaller glow. Crisp cut edges and pigment cores remain visible. Legendary keeps `will-o-wisp-v1` and its permanent unlock architecture. Reduced effects disables glow filters and animation, retaining readable cores.
- Pointer interaction no longer leaves keyboard-style outlines on game controls. Keyboard navigation retains a visible two-pixel focus indicator; Settings initially focuses its title. Original selected-choice carets remain.
- Tool and reveal copy use a constant-height slot. The roots and physical objects stay stationary when the arrowhead description gains a line. Objects are placed in the root image's coordinate composition, with straight labels and consistent scale. The dramatic accepted knife reveal remains larger by design.
- The shaft stays opaque to the cut plane. Only the upper root image fades over the opaque shaft; the fixed lower roots retain their opacity. The falling crown contains both the shaft and upper-root trunk, with one pivot at the cut. Chop impacts are guarded against double activation and finish before subsequent strikes. Standalone Chop controls use the dialogue's framed menu treatment.
- Admire and completion Back controls are framed at the bottom. A bark endcap and measured footer floor retain access to the lowest original points without blank space below the trunk. The full 720×1440 active carving region fits below controls even at 375×568; the fit uses stable viewport height to avoid browser-toolbar movement shifting the plane.
- Dead entry and stump views omit the fault sentence. Only Regret shows “You have the distinct feeling that this is your fault.” Immediate fallen Admire remains available after the chop, and disappears after returning.
- Home and About use the same actual Brave discovery component and original frame/choice/caret styling. The dark Home frame retains its inset treatment with no outer shadow. Seven modular SVG moss patches cover all About words except “shadow” and “Follow”; the original blinking caret and full accessible invitation remain. The whole About card links to Be Brave. Biography text is unchanged.

Two deliberate visual refinement passes were used: opaque root backing / correctly grounded objects, and short-screen full-region fit. No further style expansion was made.

## Verification

117 automated tests pass (110 standard plus 7 module-mock tests), including original subpath preservation, one shared session ink stack and retained per-stroke anchor seeding. Typecheck, art/theme checks and the 48-route production build pass. The final short-screen commit also built successfully. No dependencies, schema, security protections or archive/cache foundations changed.

Actual authenticated final-Preview flow:

1. Resumed the previously prepared server-authorized Legendary knife across a deployment/reload, with the same session, color `#FF2BD6`, effect `will-o-wisp-v1` and seed `2089271491`. No reroll or second redemption occurred. The ready session had no deadline; the completed reveal preceded Start carving.
2. Started drawing at 375×568 emulated layout. The complete zone measured x69.30, y94.69, width236.41, height472.81, bottom567.50. Controls ended at y71.19. The entire permitted area fits beneath them. Native mouse drags made two crossing strokes, 18 canonical points, with one core path.
3. Waited for the server-authoritative 60-second deadline. Artwork remained visible at timeout and completion. A later drag did not add points; final point count stayed18. Completion Back was at the bottom.
4. Published sequence40, inspected Admire, refreshed, and compared the loaded projection. Color, effect, seed, projected path and all20 sparkle positions matched. The gzip archive's payload/source SHA-256 checks passed; original18 vertices reconstruct the exact released/live path. The existing0.2-world-unit render projection removes collinear intermediate vertices without changing canonical geometry. No click-to-zoom/inspection UI was reintroduced.
5. Saw the4-foot remaining growth gate, clicked Reset my carve limit, and prepared a new tool selection using the same visitor. Reset preserved growth, previous archives and permanent redemption. The unused new attempt was cancelled with the same reset button. The QA browser was restored to a living, eligible entry with default preferences.
6. Completed local chop sequences, reached immediate Admire, returned to entry with no Admire choice, inspected the stump without the fault line, and opened Regret with that line. The shared database remained unchanged by local felling. The crown's common parent contains both visual trunk pieces and the lower roots remain separate. Continuous fall interpolation is not certified by the sampled cloud captures; see limits below.
7. Reviewed living light/dark and felled light/dark rendered layouts, reduced effects, public Home shadow/focus behavior, and the About moss card. The About card has seven moss tiles, the full accessible name, and the original `choice-caret` animation. Mouse and native keyboard were used; these are emulated phone layouts, not physical-device passes.

## Data preservation

Only isolated test project `qkkgcoejkqvthbjcldcw` was used. Preview flags and public Supabase origin were checked before writes. Production project `belqlsqnbexwkpmnptyy` was not written.

| Shared test data | Before | After |
| --- | --- | --- |
| Height |34,560 units /120ft|34,848 units /121ft|
| Completed drawings /archives |39 /39|40 /40|
| Revision |107|108|
| Original distribution codes |50 unused|50 unused|

The one nonempty QA carving added exactly one foot. Every prior archive's combined hash remains `06ce5c4a9f8146f9b5d749c8f550c1fb`. The50 distribution-code full-row digest remains `025a32464a325167fa8bb9f170319f23`. The private distribution CSV was not read or modified. Only separately named disposable campaign `jrpg-joined-ink-fixture-20261012` was used; its reward is permanently consumed once by session `61ba9fa9-1672-4fcc-a5b8-979edaf2d6e1`. No plaintext codes are in the review package.

Remote main remains `75de96bb3ef7a4edf138d07ee313519bb3bb212e`; production alias remains on `dpl_4Uzwt4ELBoYd8ckmEAR1jkQP7PqQ`. No main merge, production publish, shared alias/security/environment change, purchase or plan upgrade occurred.

## Browser measurements and remaining limits

Final synthetic benchmark uses real rendered components but no shared writes or API transfer. Ordinary workload showed3 visible drawings /87 SVG descendants and6.76MB sampled JS heap. Crowded workload showed43 visible drawings /2,961 SVG descendants and11.49MB heap. The50,000-foot workload remained bounded at3 visible drawings /76 SVG descendants and8.20MB heap. These are isolated samples, not lifetime memory maxima.

Cloud requestAnimationFrame was heavily throttled: ordinary sample20 had median16.7ms but p951,016.5ms; crowded31 and tall28 samples were dominated by approximately1,016ms intervals. These samples cannot establish hardware FPS or a comparative rendering regression. Dense effects remain a known performance limitation. No speculative archive/cache rewrite was made from this inconclusive timing.

The final native cloud horizontal-scroll commands did not advance the fallen rail (scrollLeft remained0). Its overflow is auto, dimensions are360×398 with18,537px content, and parallax variables/transform remain stationary. The prior revision's horizontal panning architecture is retained; final physical swipe/trackpad panning is not certified. Do not describe the0→0 sample as a successful pan. The cloud capture rate also missed the1.1-second fall state; the complete crown structure and final local transition were checked, but continuous motion quality needs physical review.

Direct original-detail HTTP navigation returned `ERR_BLOCKED_BY_CLIENT` in this browser. The archive/source integrity and original geometry were verified independently through the isolated test database; the authenticated original-detail HTTP path remains unverified. Existing protection was not weakened to bypass this.

Physical iOS/Safari/touch/stylus, OS reduced-motion media query, unthrottled GPU behavior and anonymous external access were not certified. Explicit reduced-effects settings were reviewed. The supplied phone screenshots/video are physical before evidence, not an after-device pass. Short clips are assembled from actual sampled states with expanded holds; they do not measure animation duration or FPS.

## Handoff

Open the stable test Preview, use Reset my carve limit to repeat testing, and use Settings → Reset timeline and preferences to return from local felling. These are test controls only; production guards are unchanged. The review package includes representative user before images/video, labelled after screenshots, short sampled tool/carving clips, test logs and machine-readable verification. Development is finished for this follow-up; further features or production publication are separate decisions. Owned development processes and the existing publishing Codespace are stopped at handoff; the deployed Preview stays live.
