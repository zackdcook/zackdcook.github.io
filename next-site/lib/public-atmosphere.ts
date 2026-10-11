export type PublicMote = { layer: "far" | "middle" | "near"; x: number; start: number; depth: number; size: number; period: number; phase: number };

/** One bounded field per page, randomized once after hydration. It has no
 * visitor data, network requests, simulation state or per-frame React work. */
export function createPublicMotes(random: () => number = Math.random): PublicMote[] {
  const sample = () => Math.max(0, Math.min(1, random()));
  return Array.from({ length: 14 }, (_, index) => ({
    layer: index < 5 ? "far" : index < 10 ? "middle" : "near",
    x: (index * 61.803 + sample() * 13) % 100,
    start: sample(), depth: (index < 5 ? .1 : index < 10 ? .28 : .52) + sample() * .1,
    size: 1.8 + sample() * 2.2, period: 8 + sample() * 9, phase: -sample() * 17,
  }));
}

/** Wrap above/below the visible field so long pages never exhaust the dust.
 * Teleports happen outside the viewport, not in the visitor's reading field. */
export function publicMoteY(start: number, depth: number, scroll: number, height: number) {
  if (![start, depth, scroll, height].every(Number.isFinite) || height <= 0) return 0;
  const span = height * 1.4;
  const position = start * span - Math.max(0, scroll) * depth;
  return ((position % span) + span) % span - height * .2;
}
