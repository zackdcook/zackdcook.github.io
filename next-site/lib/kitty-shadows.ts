import windows from "@/design/kitty-window.json";

export const kittyWindows = windows;
export const braveDiscoveryKey = "zack.brave-discovered.v1";
export type ShadowFlight = { from: [number, number]; to: [number, number]; duration: number; delay: number; size: number };

/** Normalized photograph coordinates keep the shadow tied to replaceable artwork,
 * independently of viewport size, optical tilt, and display pixel density. */
export function shadowFlight(random: () => number = Math.random): ShadowFlight {
  const area = windows.original.flight;
  const sample = () => Math.max(0, Math.min(1, random()));
  const height = area.top + (area.bottom - area.top) * sample();
  const scale = sample();
  return {
    from: [area.right, height],
    to: [area.left, height],
    // ±25% around 28px. Bigger birds cross faster; no independent random
    // duration can accidentally make a smaller bird outrun a bigger one.
    duration: windows.durationMs[1] - (windows.durationMs[1] - windows.durationMs[0]) * scale,
    delay: windows.intervalMs[0] + (windows.intervalMs[1] - windows.intervalMs[0]) * sample(),
    size: 28 * (.75 + .5 * scale),
  };
}
