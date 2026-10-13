# Be Brave animated auras — test revision v3

Application `9d5a434ad3bf27bb872719222ab9b618dbdf08b2` is READY on Preview `dpl_AjUk1RKiSeLQfwD1ufyuZznTVjhf`. The stable experimental alias resolves to this deployment:

https://zack-cook-git-experiment-be-brave-encha-6d0cb7-dove-mack0o-3684.vercel.app/bebrave

Immutable deployment: https://zack-cook-rm19pa326-dove-mack0o-3684.vercel.app

## Animated rendering

The user recording demonstrated why the previous SVG treatment was insufficient: the carving appeared static, the aura was largely hidden beneath its core, and the sky showed vertical streaks. Desktop Chrome could animate the earlier SVG after reload, so a specific iPhone/Safari root cause is not established.

The shared renderer now paints an animated aura and particles into two camera-sized Canvas2D surfaces. Superior has layered saturated light, breathing brightness and flowing ribbons; it has no detached particles. Epic adds continuously moving motes, twinkling sparks and curling energy trails. A separate SVG engraving preserves the crisp, assigned-color core and joined intersections. Common and Uncommon retain their engraving without an aura. Existing Legendary hearts, rainbow, blood and will-o-wisp IDs use this renderer too.

Live mutable geometry wakes and updates the same painter used for settled and published work. Stored geometry, seeds, colors, effect IDs and seeded anchors are reused; no migration of earlier drawings is required. Camera buffers, DPR, sampling, cached geometry and crowded emitter density are bounded. The frame loop sleeps when hidden, reduced or without a visible enchanted mark, then wakes on camera or model changes.

## Parallax

Scenery remains visible for a much longer ascent, with distinct near/far movement. Its exposed upper edges now fade naturally into the sky. The blue → purple → black transition begins after the scenery has left the camera, with a further pause before darkening. Transform travel is bounded after the artwork exits. Thirty-eight small, round stars replace the radial-gradient streaks from the recording.

At a 390 × 844 test viewport, two Page Ups retained both artwork opacities at 1, with horizon translation 163.4px, midground 286.8px and the starting blue sky `#152f58`. Farther ascent faded the foreground first. At the top endpoint, both artwork opacities were 0, stars were 1, the sky was `#020308` and its upper gradient `#010205`.

## Verification

132 tests pass (124 standard and 8 module mocks). TypeScript, asset/theme validation, whitespace and the optimized Next build pass. The final CSS edge-mask change also passed an optimized build.

New tests exercise animated Superior without particles, moving Epic emitters and archive round trips, distinct Legendary motion, live point growth without React rerendering, tall-tree buffer/cache bounds, pause/resume/disposal, and waking an idle renderer for new work.

Actual deployed Chrome checks passed at desktop and 390px phone viewport widths. The renderer's frame counter advanced and native screenshots contained changing aura/particle pixels. Reduced effects switched to static rendering and paused at frame 59606; restoring full effects resumed Canvas rendering. Light/system and dark appearances were reviewed with the assigned carving colors readable. Appearance was restored to System and effects to full after QA.

A separate disposable test code, campaign `enchantment-v3-renderer-qa-20261013`, was redeemed through the normal UI. It did not consume one of the 50 distribution codes. Three native drags produced 27 points in three chunks, showing the glow and rising heart particles after lifting the pointer. The timed session published normally, and reload → Admire restored its animated effect. Session `127a3ad4-e8af-472e-906a-700d8cfd70bb` is sequence 45, Legendary `hearts-v1`, magenta `#C92C8C`, seed `1108064502`, completed at `2026-10-13T12:49:04.105539Z`. After refresh, five visible auras and 54 particles were painted and the frame counter continued increasing. The published Epic sequence 43 continued emitting alongside it.

The archive now has 45 completed carvings. All compressed payload SHA-256 checks pass. The earlier 44 archive rows retain aggregate digest `c0e688c422ec6e453ee48801c6e50bb0`; all 50 distribution codes remain unused and retain full-row digest `02d5444d07ca3709d2d5465f7bf8c0a9`. No production database writes occurred.

Proof files in `qa/` are actual browser captures from final application `9d5a434`: `enchantments-v3-animated-phone.mp4`, `enchantments-v3-phone.jpg` and `enchantments-v3-night.jpg`. The video samples 20 native frames over 2.221 seconds, approximately 8.55 captured frames per second; this is proof of changing rendered pixels, not a measurement of device playback FPS. The first/last phone crops have nonzero RGB differences. These replace reliance on static screenshots as evidence of animation.

## Source and release boundaries

The complete local commit ancestry was imported and pushed normally through an isolated authenticated Codespace mirror. The experimental GitHub branch now contains application `9d5a434`; the earlier Git synchronization blocker is resolved. The original Codespace checkout remains on `spring-clean-2026-10` and was kept clean. No force push was used. This documentation and its proof files are a subsequent documentation-only descendant; they require no application rebuild.

The temporary branch `experiment/be-brave-source-transfer-2026-10-13` contains a Git bundle transport. Its automatically created Preview `dpl_D3YKCxoUyc2Vhg4V9YXyUNL3XrxG` is not the delivered application. The final test alias explicitly targets `dpl_AjUk1RKiSeLQfwD1ufyuZznTVjhf`. Finish native publication, verify the remote documentation head and clean original checkout, then stop the resumed `cautious-trout-wrq56q47v6j4c94x6` Codespace.

Main remains `75de96bb3ef7a4edf138d07ee313519bb3bb212e`; production alias `zackdcook.com` remains on `dpl_4Uzwt4ELBoYd8ckmEAR1jkQP7PqQ`. Production release awaits Zack's test acceptance and needs a new production-configured build with the previously documented production Supabase/Turnstile guards. Do not promote the test-storage Preview.

Physical iPhone/Safari, actual touch/stylus input, sensor permission and GPU frame rate remain device QA. Both explicit reduced effects and an OS reduced-motion preference intentionally stop animation. The linked World of Warcraft YouTube page was available, but its stream did not start in this browser; no claim is made to have watched it. The requested enchanted-weapon aesthetic and supplied game recording guided the implementation.
