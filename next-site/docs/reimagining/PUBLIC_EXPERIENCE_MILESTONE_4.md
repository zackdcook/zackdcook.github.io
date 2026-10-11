# Public experience — feedback milestone 4

Started 2026-10-11 from local 038d0fa8e651990babca47b464e67930f7319f7a / UI bc7a3cf. All previous history and recovery artifacts remain intact. This is a bounded refinement milestone for Zack's feedback, not final acceptance of the overhaul.

## Evidence and scope

The supplied 34-second recording and three popup screenshots are accessible and were inspected locally. They show strong cursor wash, dark light-mode particles, abrupt section backgrounds, and unsolicited focus rings on initial dialog focus. The recording includes briefly empty content during navigation/scrolling but no explicit application error. The reported occasional crash is not reproduced or diagnosed yet. Do not certify crash resolution merely from source changes.

The homepage animates the same elements whose anonymous view timelines drive their motion. Move those animations to stable parent section timelines; preserve substantial depth, avoid whole-section scale, and preserve the About reading progression Zack explicitly approved. Reduce ambient layer area/blending and inherited style writes. All decorative work should rest under modal dialogs and reduced effects. Keep the supplied bird GIF and its repeat/scale/speed behavior.

Other acceptance points: soften and animate homepage joins; let the three requested titles fit one line on wide screens without shrinking mobile body text; give Settings one consistent control treatment; remove the explicitly rejected Reset Brave discovery control; focus dialog titles deliberately without an unsolicited outline, retain keyboard focus visibility on interactive controls; turn the permanent Brave message and sole Follow him. action into a distinct JRPG dialogue with selected arrow and reduced-motion fallback.

## Research and copy

Reuse the focused W3C / NN/g / Tuch review in PUBLIC_EXPERIENCE_MILESTONE_3.md. Provide concrete hierarchy and wording recommendations to Zack with this milestone. Recommendations are design judgments informed by the research, not proven conversion effects. Keep Greetings, fellow person! as a modest 21–22px welcome below the signup invitation; the name and invitation have stronger emphasis. Retain all authored prose and original routes. No further copy rewrite is authorized or needed in this pass.

## Verification

Pending implementation and tests. Browser service responds again, but protected Vercel sign-in rejected the submitted two-factor code. No deployment-protection setting has been altered. GitHub connector/local Git publishing remain unverified for this continuation; do not assume the previous local milestones are remote. Previous Preview stays intact.

## Next action

Implement the scoped fixes, run type checking, automated preservation/interaction tests and the CTA-enabled production build, then perform actual responsive/pointer/keyboard Preview checks if authorized browser access is restored. Publish only Preview, retain full recovery history, update this report and WORK_CHECKPOINT.md, then pause for direction feedback.
