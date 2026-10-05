export const materialGeometryEvent = "zack-material-geometry";

export type SurfaceBounds = { left: number; top: number; width: number; height: number };

/** A soft light above the page. Each surface casts away from that same source. */
export function materialLight(bounds: SurfaceBounds, x: number, y: number, intensity: number) {
  const awayX = bounds.left + bounds.width / 2 - x;
  const awayY = bounds.top + bounds.height / 2 - y;
  const distance = Math.hypot(awayX, awayY);
  const edgeDistance = Math.hypot(
    Math.max(bounds.left - x, 0, x - bounds.left - bounds.width),
    Math.max(bounds.top - y, 0, y - bounds.top - bounds.height),
  );
  const strength = Math.max(0, Math.min(1, intensity)) * Math.max(0, 1 - edgeDistance / 1400);
  const length = Math.hypot(distance, 120);
  const directionX = awayX / length;
  const directionY = awayY / length;
  return {
    strength,
    lightX: x - bounds.left,
    lightY: y - bounds.top,
    // Gravity returns only as the virtual light fades; it cannot bias a live
    // light's shadow toward the bottom of the page.
    shadowX: directionX * 15 * strength + 0,
    shadowY: directionY * 15 * strength + 5 * (1 - strength),
    blur: 12 + 4 * strength,
    rimX: directionX * 2.4 * strength + 0,
    rimY: directionY * 2.4 * strength + 1 * (1 - strength),
  };
}

/** Equal-speed arrival and departure, including reversals halfway through. */
export function approachLight(current: number, target: number, elapsed: number) {
  const distance = Math.max(0, elapsed) / 1100;
  return current < target ? Math.min(target, current + distance) : Math.max(target, current - distance);
}

/** Large panels light the portion the visitor can see, rather than an
 * offscreen midpoint several screens away. Keep face coordinates local to
 * the whole panel so the highlight stays under the shared light source. */
export function panelLight(bounds: SurfaceBounds, x: number, y: number, intensity: number, viewportHeight: number) {
  const top = Math.max(0, bounds.top);
  const bottom = Math.min(viewportHeight, bounds.top + bounds.height);
  if (bottom <= top) return materialLight(bounds, x, y, intensity);
  const light = materialLight({ left: bounds.left, width: bounds.width, top, height: bottom - top }, x, y, intensity);
  return { ...light, lightX: x - bounds.left, lightY: y - bounds.top };
}
