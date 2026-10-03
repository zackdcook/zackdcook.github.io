export type LeafBody = { x: number; y: number; z: number; rx: number; ry: number; rz: number; vx: number; vy: number; vz: number; wx: number; wy: number; wz: number };
export type LeafBounds = { width: number; height: number; leafWidth: number };
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function randomFor(index: number) {
  let seed = (index + 11) * 2654435761 >>> 0;
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}
export function makeLeafPile(count: number, bounds: LeafBounds): LeafBody[] {
  return Array.from({ length: count }, (_, i) => {
    const r = randomFor(i), margin = bounds.leafWidth * .48;
    return { x: margin + r() * Math.max(0, bounds.width - margin * 2), y: 135 + r() * Math.max(10, bounds.height - 270), z: 0,
      rx: r() * 8 - 4, ry: r() * 8 - 4, rz: r() * 100 - 50, vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0 };
  });
}
export function blowLeaves(leaves: LeafBody[], x: number, y: number) {
  leaves.forEach((leaf, index) => {
    const dx = leaf.x - x, dy = leaf.y - y, distance = Math.hypot(dx, dy);
    const angle = distance < 1 ? index * 2.39996 : Math.atan2(dy, dx);
    const force = 190 + 660 * Math.exp(-distance / 460);
    leaf.vx += Math.cos(angle) * force; leaf.vy += Math.sin(angle) * force;
    leaf.vz = 220 + force * .35;
    leaf.wx = (index % 2 ? -1 : 1) * (110 + force * .2);
    leaf.wy = (index % 3 ? 1 : -1) * (150 + force * .18);
    leaf.wz += (index % 2 ? -1 : 1) * (120 + force * .22);
  });
}
export function stepLeaves(leaves: LeafBody[], elapsed: number, bounds: LeafBounds) {
  const dt = clamp(elapsed, 0, 1 / 30), air = Math.exp(-2.5 * dt), floor = Math.exp(-7 * dt);
  let moving = false;
  const marginX = Math.min(bounds.leafWidth * .42, bounds.width / 2), marginY = bounds.leafWidth * .3;
  for (const leaf of leaves) {
    leaf.x += leaf.vx * dt; leaf.y += leaf.vy * dt; leaf.z += leaf.vz * dt;
    leaf.vz -= 840 * dt;
    leaf.rx += leaf.wx * dt; leaf.ry += leaf.wy * dt; leaf.rz += leaf.wz * dt;
    if (leaf.x < marginX || leaf.x > bounds.width - marginX) { leaf.x = clamp(leaf.x, marginX, bounds.width - marginX); leaf.vx *= -.4; }
    if (leaf.y < marginY || leaf.y > bounds.height - marginY) { leaf.y = clamp(leaf.y, marginY, bounds.height - marginY); leaf.vy *= -.4; }
    if (leaf.z <= 0) {
      leaf.z = 0; leaf.vz = 0;
      leaf.rx *= Math.exp(-10 * dt); leaf.ry *= Math.exp(-10 * dt);
      leaf.wx *= floor; leaf.wy *= floor;
      if (Math.abs(leaf.rx) < .08) leaf.rx = 0;
      if (Math.abs(leaf.ry) < .08) leaf.ry = 0;
    }
    const drag = leaf.z > 0 ? air : floor;
    leaf.vx *= drag; leaf.vy *= drag; leaf.wz *= drag;
    moving ||= leaf.z > 0 || Math.abs(leaf.vx) + Math.abs(leaf.vy) + Math.abs(leaf.wx) + Math.abs(leaf.wy) + Math.abs(leaf.wz) + Math.abs(leaf.rx) + Math.abs(leaf.ry) > .2;
  }
  return moving;
}
