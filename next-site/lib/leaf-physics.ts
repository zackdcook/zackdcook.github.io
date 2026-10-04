export type LeafBody = { x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number; vx: number; vy: number; vz: number; wx: number; wy: number; wz: number };
export type LeafBounds = { width: number; height: number; leafWidth: number };
export type LeafPoint = { x: number; y: number };
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function randomFor(index: number) {
  let seed = (index + 11) * 2654435761 >>> 0;
  seed = Math.imul(seed ^ seed >>> 16, 0x21f0aaad);
  seed = Math.imul(seed ^ seed >>> 15, 0x735a2d97);
  seed = (seed ^ seed >>> 15) >>> 0;
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

// The complete diagonal, perspective lift and shadow must fit, at EVERY angle.
export function leafClearance(leaf: LeafBody, bounds: LeafBounds) {
  return Math.hypot(bounds.leafWidth, bounds.leafWidth / 1.6) * leaf.scale * .525 + 28;
}
function containLeaf(leaf: LeafBody, bounds: LeafBounds) {
  const radius = leafClearance(leaf, bounds);
  const mx = Math.min(radius, bounds.width / 2), my = Math.min(radius, bounds.height / 2);
  const x = clamp(leaf.x, mx, bounds.width - mx), y = clamp(leaf.y, my, bounds.height - my);
  if (x !== leaf.x) leaf.vx *= -.16;
  if (y !== leaf.y) leaf.vy *= -.16;
  leaf.x = x; leaf.y = y;
}
export function makeLeafPile(count: number, bounds: LeafBounds): LeafBody[] {
  return Array.from({ length: count }, (_, i) => {
    const r = randomFor(i), angle = r() * Math.PI * 2, spread = Math.sqrt(r());
    const leaf = { x: bounds.width / 2 + Math.cos(angle) * spread * bounds.width * .17,
      y: bounds.height / 2 + Math.sin(angle) * spread * bounds.height * .16, z: 0,
      rx: r() * 10 - 5, ry: r() * 10 - 5, rz: r() * 300 - 150, scale: .91 + r() * .17,
      vx: 0, vy: 0, vz: 0, wx: 0, wy: 0, wz: 0 };
    containLeaf(leaf, bounds); return leaf;
  });
}

/** A moving fingertip/brush pushes nearby leaves in its direction of travel. */
export function pushLeaves(leaves: LeafBody[], from: LeafPoint, to: LeafPoint, elapsed: number, bounds: LeafBounds) {
  const dx = to.x - from.x, dy = to.y - from.y, distance = Math.hypot(dx, dy);
  if (!Number.isFinite(distance) || distance < .05) return false;
  const dt = clamp(elapsed, 1 / 120, .06), speed = Math.min(1000, distance / dt);
  let touched = false;
  leaves.forEach(leaf => {
    const t = clamp(((leaf.x - from.x) * dx + (leaf.y - from.y) * dy) / (distance * distance), 0, 1);
    const px = from.x + t * dx, py = from.y + t * dy;
    const a = -leaf.rz * Math.PI / 180, ox = px - leaf.x, oy = py - leaf.y;
    const localX = ox * Math.cos(a) - oy * Math.sin(a), localY = ox * Math.sin(a) + oy * Math.cos(a);
    const contact = 1 - Math.hypot(localX / (bounds.leafWidth * leaf.scale * .43 + 28), localY / (bounds.leafWidth * leaf.scale * .23 + 28));
    if (contact <= 0) return;
    touched = true;
    const grip = .25 + contact * .75;
    leaf.x += dx * grip * .55; leaf.y += dy * grip * .55;
    leaf.vx = clamp(leaf.vx + dx / distance * speed * grip * .12, -700, 700);
    leaf.vy = clamp(leaf.vy + dy / distance * speed * grip * .12, -700, 700);
    leaf.z = Math.min(14, Math.max(leaf.z, 4 + speed * .01 * contact));
    leaf.vz = Math.min(65, speed * .06 * contact);
    leaf.wx = clamp(dy * 5 * grip, -150, 150); leaf.wy = clamp(-dx * 5 * grip, -150, 150);
    leaf.wz = clamp(leaf.wz + (ox * dy - oy * dx) / Math.max(80, bounds.leafWidth) * grip * 4, -180, 180);
    containLeaf(leaf, bounds);
  });
  return touched;
}
export function stepLeaves(leaves: LeafBody[], elapsed: number, bounds: LeafBounds) {
  const dt = clamp(elapsed, 0, 1 / 30), air = Math.exp(-4 * dt), floor = Math.exp(-6 * dt);
  let moving = false;
  for (const leaf of leaves) {
    leaf.x += leaf.vx * dt; leaf.y += leaf.vy * dt; leaf.z = Math.min(20, leaf.z + leaf.vz * dt);
    leaf.vz -= 840 * dt;
    leaf.rx = clamp(leaf.rx + leaf.wx * dt, -20, 20); leaf.ry = clamp(leaf.ry + leaf.wy * dt, -20, 20); leaf.rz += leaf.wz * dt;
    if (leaf.z <= 0) {
      leaf.z = leaf.vz = 0;
      leaf.rx *= Math.exp(-10 * dt); leaf.ry *= Math.exp(-10 * dt);
      leaf.wx *= floor; leaf.wy *= floor;
      if (Math.abs(leaf.rx) < .08) leaf.rx = 0;
      if (Math.abs(leaf.ry) < .08) leaf.ry = 0;
    }
    const drag = leaf.z > 0 ? air : floor;
    leaf.vx *= drag; leaf.vy *= drag; leaf.wz *= drag;
    containLeaf(leaf, bounds);
    moving ||= leaf.z > 0 || Math.abs(leaf.vx) + Math.abs(leaf.vy) + Math.abs(leaf.wx) + Math.abs(leaf.wy) + Math.abs(leaf.wz) + Math.abs(leaf.rx) + Math.abs(leaf.ry) > .2;
  }
  return moving;
}
