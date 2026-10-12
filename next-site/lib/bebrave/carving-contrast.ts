export const carvingLightEdge = "#FFF2C8";
export const carvingDarkEdge = "#121526";

export function luminance(hex: string) {
  const rgb = hex.replace("#", "").match(/.{2}/g)?.map(part => parseInt(part, 16) / 255) || [0, 0, 0];
  const linear = rgb.map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}

export function contrastRatio(a: string, b: string) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}

/** Retain the stored pigment; choose the edge that separates it most clearly.
 * The outer light/dark pair also separates the mark from bark of any shade. */
export function carvingEdge(color: string) {
  return contrastRatio(color, carvingLightEdge) > contrastRatio(color, carvingDarkEdge) ? carvingLightEdge : carvingDarkEdge;
}
