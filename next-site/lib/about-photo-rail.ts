/** Sticky photos are pushed by the next paragraph at document scroll speed.
 * All values are viewport pixels; each photo keeps its own measured height. */
export function photoRailPositions(anchors: readonly number[], heights: readonly number[], top: number, gap: number, viewportHeight: number) {
  // A photo can rest below the header while its successor is offscreen. As
  // soon as that next paragraph enters, both pictures travel with the page.
  const positions = anchors.map((anchor, index) => Math.max(anchor, top + Math.min(0, (anchors[index + 1] ?? Infinity) - viewportHeight)));
  for (let index = positions.length - 2; index >= 0; index--) {
    positions[index] = Math.min(positions[index], positions[index + 1] - heights[index] - gap);
  }
  return positions;
}
