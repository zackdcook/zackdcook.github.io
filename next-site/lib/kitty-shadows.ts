import windows from "@/design/kitty-window.json";

export const kittyWindows = windows;
export const braveDiscoveryKey = "zack.brave-discovered.v1";
export type ShadowFlight = { from: [number, number]; to: [number, number]; duration: number; delay: number; size: number; reverse: boolean };

/** Normalized photograph coordinates keep the shadow tied to replaceable artwork,
 * independently of viewport size, optical tilt, and display pixel density. */
export function shadowFlight(random: () => number = Math.random): ShadowFlight {
  const area = windows.original.flight;
  const sample = () => Math.max(0, Math.min(1, random()));
  const reverse = sample() > .5;
  const y = () => area.top + (area.bottom - area.top) * sample();
  return {
    from: [reverse ? area.right : area.left, y()],
    to: [reverse ? area.left : area.right, y()],
    duration: windows.durationMs[0] + (windows.durationMs[1] - windows.durationMs[0]) * sample(),
    delay: windows.intervalMs[0] + (windows.intervalMs[1] - windows.intervalMs[0]) * sample(),
    size: 22 + sample() * 12,
    reverse,
  };
}

export type FlockFlight = ShadowFlight & { startDelay: number; wingDelay: number };

/** A loose group shares a direction, never a rigid formation. Normalized paths
 * cross both window edges; each bird has its own pace, height and wing phase. */
export function shadowFlock(random: () => number = Math.random): FlockFlight[] {
  const leader = shadowFlight(random);
  return Array.from({length:3}, (_, index) => {
    const follower = index ? shadowFlight(random) : leader;
    const {left,right} = windows.original.flight;
    return {...follower, reverse:leader.reverse,
      from:[leader.reverse ? right : left, follower.from[1]],
      to:[leader.reverse ? left : right, follower.to[1]],
      startDelay:index * (240 + Math.max(0,Math.min(1,random())) * 360),
      wingDelay:-Math.max(0,Math.min(1,random())) * 540,
    };
  });
}
