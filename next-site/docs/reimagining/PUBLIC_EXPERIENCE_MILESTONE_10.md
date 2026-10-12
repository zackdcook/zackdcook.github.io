# Mobile interaction refinements — 2026-10-12

Source starts with experimental92b5880 and incorporates current main9385b3f (39° logo hover) via exact integration0e3d321. Separate Be Brave JRPG/listening-reading work untouched.

## Findings and changes

- The supplied signup recording shows accepted confirmation without a visible challenge. HumanCheck uses Cloudflare interaction-only appearance; it mounts only after valid email plus Count, and production API verifies its token. Silent verification is intended, not a bypass. This mechanism/security was preserved.
- Count uses the shared touch-active and busy button palette. Verification and POST are one visible busy state; aria-disabled preserves feedback/focus while the existing synchronous request gate prevents repeats. Email is disabled only while POST is pending.
- Home success measures the actual invitation footprint before replacement and uses committed-layout focus/scroll reveal. The message no longer disappears above the visitor after the form collapses. No email storage/logging added.
- Explicit mobile hero grid places intro left aligned beside the profile photo; narrow/short screens keep usable type and targets.
- Native ChoiceDialog owns focus, backdrop and scrolling for Calendar and Directions. Calendar pills order Apple, Google, Outlook; no arrows. Directions has Apple Maps/Google Maps and the exact existing address. No map API/service/payment/geolocation request.
- Preferences merge the latest synchronous record and sync storage clearing as well as individual changes. Tilt intent stays separate from sensor activity/permission. Default true and explicit false persist. Safari permission is requested on the first trusted mobile tap when needed; denial prevents repeated automatic prompts, Settings can retry. Permission failure never saves tilt=false. Per-constructor pending requests coalesce without losing transient activation.
- Phone light uses bounded continuous mapping,70ms frame-independent follow and240ms intensity arrival; small gestures travel farther. Shared physical photo cast now uses the sensor light. Mouse timing, geometry culling, reduced motion and teardown preserved.
- About paragraphs own stable native touch/zoom hit boxes; only inner ink translates on a timeline anchored to its stationary paragraph. No wheel/touch interception or scroll locking added. This removes a plausible Safari compositor/hit-test cause; the intermittent physical iPhone issue could not be reproduced/certified in Chrome.
- Reader focus return tracks keyboard/pointer provenance. Touch/mouse closure retains focus but no keyboard selection outline; genuine keyboard use retains its visible focus indicator and leaf ordering.

## Validation

109 tests(102 TS +7 API/render/controller) PASS; typecheck, assets/themes, whitespace and47-route build PASS. Accessible-copy scanner recognizes the shared closeLabel prop; all baseline wording/content preserved. New unavoidable labels are Apple Maps, Google Maps, Close map choices and Allow phone tilt lighting, tied directly to requested functionality.

Private Chrome:390 phone receipt focused/visible y354..590 in844px viewport,235px original invitation height preserved;320 viewport photo115px/intro128px side by side with scrollWidth=clientWidth305. Theme/compact/analytics opt-out/subscribed persist after hard reload, tilt intent true. Calendar pills48px/no arrows/Apple first; both map URLs/picker verified. Pointer reader return has data-keyboard-focus=false and ordinary2px leaf stroke even when focus-visible=true; keyboard Enter/Escape works. Native reading scroll from lower text0→936→1872 while ink animation active, paragraph transform none and touch-action pan-y pinch-zoom. Browser metadata extension errors excluded from app diagnostics. Deterministic tests cover60/120Hz phone follow, angular wrapping, permission coalescing/denial/retry and synthetic event rejection; no physical sensor/GPU certification.

Receipt browser acceptance uses an explicitly private-only API response fixture in owned QA folder with empty server secrets and no canonical subscriber writes. That route is not in committed source. Existing API tests cover real acceptance/security boundaries; no dummy production email or production-reset POST.

References: https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/ ; https://www.w3.org/TR/orientation-event/ ; https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static ; https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html .

Release pending: publish tested experimental source; guarded main9385b3f fast-forward with one staged production build, verify/promote same artifact. Rollbackdpl_EsrxxEgZzYm7xjXwJ31mypTBKhix retained. No schema/provider/env/plan/security/dependency change.

## Live release acceptance

Main/application75de96bb3ef7a4edf138d07ee313519bb3bb212e, productiondpl_4Uzwt4ELBoYd8ckmEAR1jkQP7PqQ READY and promoted to https://zackdcook.com/. First Git staging failed git_info_fail before build; verified exact source still available and redeployed same commit once successfully. No code workaround, one successful production build. API build-log403 not retried; native dashboard corroborated failure. Current live/7 aliases verified; auto-assignment true restored and original redirects intact. Public root/state200 with tree enabled, QA viewport404. Production-configured calendar styling/About gesture structure and no initial Cloudflare load pass. No production fake subscriber, database/schema/security/secret/plan mutation. Owned QA process3219 stopped/port3004 closed; private receipt route restored to canonical committed source, original checkout clean. Screenshot live-mobile-refinements-1791814608164.jpg. Rollbackdpl_EsrxxEgZzYm7xjXwJ31mypTBKhix retained; physical iPhone checks remain a stated limit.
