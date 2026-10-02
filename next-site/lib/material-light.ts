export type SurfaceBounds = { left: number; top: number; width: number; height: number };

/** A soft light above the page. Each surface casts away from that same source. */
export function materialLight(bounds: SurfaceBounds, x: number, y: number, intensity: number) {
  const awayX = bounds.left + bounds.width / 2 - x;
  const awayY = bounds.top + bounds.height / 2 - y;
  const distance = Math.hypot(awayX, awayY);
  const strength = Math.max(0, Math.min(1, intensity)) * Math.max(0, 1 - distance / 1400);
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

export function lightIntensity(elapsed: number, released: boolean) {
  return Math.max(0, 1 - Math.max(0, elapsed - (released ? 0 : 240)) / 1100);
}
