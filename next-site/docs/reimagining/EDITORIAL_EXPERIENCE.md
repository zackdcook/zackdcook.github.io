# Editorial world — main-site milestone, 2026-10-10

The tree inspection milestone is now verified in a real Preview browser. Zack's newest priority puts further tree development behind the ordinary site's experience. This implementation has passed the focused deployed checks below; the overall redesign and full route inventory remain in progress.

## Direction and live observations

An illustrated Florida editorial world connects the engineer, writer, photographs, manuscript, community and Folly. A large personal identity remains the first focal point. The foreground, horizon and photograph move at visibly different depths; the ordinary scroll position and touch gestures remain native. The manuscript occupies a quiet paper spread; the community section becomes a dusk-colored spread; the biography becomes a personal photographic discovery; the leaves inhabit a botanical clearing.

The references were inspected again in the live desktop browser, rather than relying on screenshots alone. Impilo's hero anchors a clear headline; its product chart develops during scrolling, then transitions through spacious type into stronger dark process sections. The solution menu opens with keyboard focus on its first item. Hellboy uses foreground silhouettes, strong scale changes and artwork crossing the reading field; later scrolling reveals a staged house/interior composition. The lesson is coherent world-building, focal hierarchy and pacing. Their branding, assets, layouts and signature interactions are not reproduced. Physical mobile inspection of the references has not been performed.

## Research and practical interpretation

- The creators' Hellboy case study describes mood, restraint, composition and world-integrated actions: https://www.psychoactive.co.nz/work/hellboy . Here, the existing links and words retain their meaning while the environment supplies atmosphere.
- Robins and Holmes (2008), DOI 10.1016/j.ipm.2007.02.003, studied aesthetics and perceived web credibility. The retrieved original abstract supports an association in that experiment, not guaranteed trust or conversion for this site. The full paper was not accessible.
- Forster, Gerger and Leder (2015), original processing-fluency experiments: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0135944 . Effects depended on comparisons and task conditions. Clear grouping and predictable controls are useful design hypotheses; no claim is made that a palette or animation reliably increases sales.
- Browser engineering case study: https://developer.chrome.com/blog/scroll-animation-performance-case-study . Native CSS scroll timelines can keep transform-based movement independent of ordinary main-thread scroll handlers. Our parallax uses named view timelines and transform/translate; unsupported browsers retain the complete stationary layout. Actual frame rate still requires browser/device measurement.
- Accessibility and the four palette research remain in ART_DIRECTION.md. Both the site setting and OS reduced-motion preference disable the new parallax; bird discovery remains available as a stationary keyboard/tap target.

## Replaceable artwork and physical lighting

Two original transparent bitmap layers are registered by role in design/art-assets.json:
- editorial-cypress-horizon-v1.webp: distant cypress/pine, Spanish moss, reeds and water reflections.
- editorial-botanical-frame-v1.webp: foreground palmettos/reeds, a pine bough and moss around an open center.

Generated originals are retained outside Git; optimized WebPs retain alpha. The combined initial source asset budget is about 0.9 MB. Reusing these files across scenery slots uses the browser cache. Future source changes, four-theme variants, masks and disabling individual slots use the existing registry. Neither the rejected origami bird nor the provisional vector scenery is rendered. Theme brightness/saturation/hue relationships live in semantic-roles.css.

The photo image/pose has an inner clip; the stable outer frame owns a curved, masked specular rim and cast. Broad rectangular lighting washes were removed. Pointer/opt-in tilt lighting remains shared and sleeps after settling. Photography retains original color; environmental artwork responds to the four themes. The new manuscript dial's decorative face is separately replaceable through progress-dial; all original stage/ring interactions remain.

## Kitty discovery and copy exception

The existing editorial label is now the photograph's caption. Small soft bird shadows cross the actual glass region at random intervals, in either direction. A normalized polygon/route/rest position is configured for both original and escaped photographs in design/kitty-window.json. Replace these coordinates when replacing the photograph. The silhouette is replaceable via kitty-shadow (native/image/mask/none); it is a winged shadow, not the removed origami graphic.

Click, tap, Enter or Space opens the original Brave question in a native dialog. Yes opens the existing /bebrave route; No or Escape closes it and restores the shadow's focus. The original empty-window photograph and alternative text remain. Flights pause while hovered/focused, while the dialog is open, offscreen or in a hidden tab. Reduced effects keeps a stationary shadow. Targets are 44px. There is no per-frame React state update or scroll hijacking.

Only the two obsolete ribbon-specific accessible instructions are removed, explicitly at Zack's request. They are individually recorded in copy-exceptions.json. The baseline content hashes and every other extracted wording/route continue to be checked. No new website prose is introduced.

## Verification status

TypeScript, 82 automated tests, generated theme/art checks and a clean production build passed locally. The first build hit an existing Turbopack persistence-directory error; preserving the old build cache outside the repository and rebuilding clean resolved it. Tests cover 2,000 random paths for each photograph plus all four night-spread contrast pairs.

Pending: actual desktop/390/768/1024 screenshots, moving-shadow mouse interaction, native secret dialog and focus, page/menu/calendar/Folly flow, four-theme render contrast, visible parallax measurements, reduced-effects stationary behavior, and refinement after viewing the deployed result. Physical touch/orientation remains a separate limitation.

## First deployed check and refinement

The 7e9 Preview verifies the new scene, including distinct horizon/foreground scrolling, living light/dark treatments, a square portrait with bounded cursor pose, and the bird-shadow discovery through mouse and keyboard. The community calendar preserves its native dialog and Escape focus. The 390/768/1024 CSS viewports have no document overflow; phone menu route/close/focus semantics work. These are browser observations, not physical touch or device-sensor tests.

The first check exposed scenery behind small introductory text and a cascade collision that made the menu scenery relative instead of absolute. The refinement protects the reading area with diffuse themed light, increases introductory text legibility, makes shared artwork defaults deliberately low in specificity, clips the menu scenery in its own plane, fades the community artwork into its spread, and moves the photo rim with the same inner pose. Source checks/build pass; deployed recheck follows. The broader visual design remains in progress.

## Verified milestone and next work

The final 84fda Preview removes the first reading field's hard boundary with a closest-side ellipse; the portrait remains above it and phone layouts omit it. Real cursor response moves the face, border and rim with identical nonzero matrices and fixed square outer bounds. Opposing parallax, four home themes, reduced-effects fallback, original calendar/Folly/secret flows, mobile menu and 390/768/1024 CSS viewports passed the focused browser checks in BROWSER_VERIFICATION.md. Physical touch/sensors and full-route visual sign-off remain incomplete.

Main independently advanced to 64ebf8a with new book signup and privacy/analytics controls. These must be selectively preserved in the experimental design using isolated test infrastructure, before the wider public-page design/flow milestone. Tree development remains behind that work. No paid service or production deployment/configuration was changed.
