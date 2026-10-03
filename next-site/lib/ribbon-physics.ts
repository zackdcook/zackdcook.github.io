export const ribbonWidth = 640;
export const ribbonHeight = 480;
export const ribbonSpacing = 22.5;
export type RibbonNode = { x: number; y: number; z: number; vx: number; vy: number; vz: number; twist: number; spin: number; age: number };
export type RibbonGrab = { index: number; x: number; y: number; phase?: number };
export type RibbonBounds = { left: number; right: number; top: number; bottom: number };

export function createRibbon(): RibbonNode[] {
  return Array.from({ length: 25 }, (_, index) => {
    const x = 110 + index * ribbonSpacing;
    return { x, y: 444 - (x - 380) * .11, z: 0, vx: 0, vy: 0, vz: 0, twist: 0, spin: 0, age: 0 };
  });
}

/** Fabric loses most projected hand velocity as it lands on the page plane.
 * Keep a little tail momentum, without throwing the whole strip off its drop. */
export function dropRibbon(nodes: RibbonNode[]) {
  for (const node of nodes) {
    node.vx *= .12; node.vy *= .08;
    node.vz = Math.min(0, node.vz * .12); node.spin *= .5;
  }
}

/** An inextensible strip above the page plane. The grip lifts it; release lands
 * it where it falls. There are deliberately no springs to its original place. */
export function stepRibbon(nodes: RibbonNode[], grab: RibbonGrab | null, elapsed: number, reduced = false, bounds?: RibbonBounds) {
  const clamp = (node: RibbonNode) => {
    node.z = Math.max(0, node.z);
    if (bounds) {
      node.x = Math.max(bounds.left, Math.min(bounds.right, node.x));
      node.y = Math.max(bounds.top, Math.min(bounds.bottom, node.y));
    }
  };
  if (reduced) {
    if (grab) {
      const dx = grab.x - nodes[grab.index].x, dy = grab.y - nodes[grab.index].y;
      for (const node of nodes) { node.x += dx; node.y += dy; clamp(node); }
    }
    for (const node of nodes) { node.z = node.vx = node.vy = node.vz = node.spin = 0; node.twist = Math.round(node.twist / Math.PI) * Math.PI; }
    return false;
  }
  const duration = Math.max(0, Math.min(48, elapsed)) / 1000;
  const steps = Math.max(1, Math.ceil(duration * 120)), dt = duration / steps;
  if (!dt) return Boolean(grab);
  for (let step = 0; step < steps; step++) {
    const previous = nodes.map(node => ({ x: node.x, y: node.y, z: node.z }));
    for (const [index, node] of nodes.entries()) {
      node.age += dt;
      if (grab?.index === index) { node.x = grab.x; node.y = grab.y; node.z = 78; continue; }
      const onPage = node.z < .2 && !grab;
      const drag = Math.exp(-(onPage ? 26 : 2.1) * dt);
      const breeze = grab ? Math.sin(node.age * 2.1 + index * .3 + (grab.phase ?? 0)) * 16 : 0;
      node.vx = (node.vx + breeze * dt) * drag;
      node.vy = (node.vy + (grab ? 950 : node.z > .2 ? 450 : 0) * dt) * drag;
      node.vz = (node.vz - 1400 * dt) * drag;
      node.x += node.vx * dt; node.y += node.vy * dt; node.z += node.vz * dt;
      const target = grab ? Math.sin((index - grab.index) * .26 + (grab.phase ?? 0)) * 2.1 + Math.sin(node.age * 1.6 + index * .18) * .35 : Math.round(node.twist / Math.PI) * Math.PI;
      node.spin = (node.spin + (target - node.twist) * 28 * dt) * Math.exp(-5 * dt);
      node.twist += node.spin * dt;
      clamp(node);
    }
    const constrain = (a: number, b: number, length: number, stiffness = 1) => {
      const first = nodes[a], second = nodes[b];
      const dx = second.x - first.x, dy = second.y - first.y, dz = second.z - first.z;
      const distance = Math.hypot(dx, dy, dz) || .001;
      const wa = grab?.index === a ? 0 : 1, wb = grab?.index === b ? 0 : 1;
      const correction = (distance - length) / distance * stiffness / (wa + wb);
      first.x += dx * correction * wa; first.y += dy * correction * wa; first.z += dz * correction * wa;
      second.x -= dx * correction * wb; second.y -= dy * correction * wb; second.z -= dz * correction * wb;
    };
    for (let pass = 0; pass < 16; pass++) {
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = pass % 2 ? nodes.length - 2 - i : i;
        constrain(a, a + 1, ribbonSpacing);
      }
      // Weak bending resistance keeps it a satin ribbon rather than a chain.
      if (grab || nodes.some(node => node.z > .2)) {
        for (let i = 0; i < nodes.length - 2; i++) constrain(i, i + 2, ribbonSpacing * 2, .035);
      }
      for (const node of nodes) clamp(node);
      if (grab) { nodes[grab.index].x = grab.x; nodes[grab.index].y = grab.y; nodes[grab.index].z = 78; }
    }
    for (const [index, node] of nodes.entries()) {
      const before = previous[index], cap = (value: number) => Math.max(-1800, Math.min(1800, value));
      node.vx = cap((node.x - before.x) / dt); node.vy = cap((node.y - before.y) / dt); node.vz = cap((node.z - before.z) / dt);
      if (!grab && node.z < .2 && Math.hypot(node.vx, node.vy) < .6) node.vx = node.vy = node.vz = 0;
      const flat = Math.round(node.twist / Math.PI) * Math.PI;
      if (!grab && Math.abs(node.twist - flat) < .002 && Math.abs(node.spin) < .002) { node.twist = flat; node.spin = 0; }
    }
  }
  return Boolean(grab) || nodes.some(node => node.z > .2 || Math.hypot(node.vx, node.vy) > .6 || Math.abs(node.spin) > .002);
}

type Point = { x: number; y: number };
const pointString = (p: Point) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
function curve(points: Point[]) {
  let path = `M${pointString(points[0])}`;
  for (let index = 0; index < points.length - 1; index++) {
    const before = points[Math.max(0, index - 1)], current = points[index];
    const next = points[index + 1], after = points[Math.min(points.length - 1, index + 2)];
    path += ` C${pointString({ x: current.x + (next.x - before.x) / 6, y: current.y + (next.y - before.y) / 6 })} ${pointString({ x: next.x - (after.x - current.x) / 6, y: next.y - (after.y - current.y) / 6 })} ${pointString(next)}`;
  }
  return path;
}

export function ribbonPaths(nodes: RibbonNode[]) {
  const upper: Point[] = [], lower: Point[] = [];
  nodes.forEach((node, index) => {
    const before = nodes[Math.max(0, index - 1)], after = nodes[Math.min(nodes.length - 1, index + 1)];
    const angle = Math.atan2(after.y - before.y, after.x - before.x);
    // Twisting changes the visible face, not the ordering of the strip edges.
    // Signed width would cross the edges into bow-tie holes at face changes.
    const halfWidth = 19 * Math.abs(Math.cos(node.twist)) * (1 + node.z / 1800);
    const offsetX = -Math.sin(angle) * halfWidth, offsetY = Math.cos(angle) * halfWidth;
    upper.push({ x: node.x - offsetX, y: node.y - offsetY });
    lower.push({ x: node.x + offsetX, y: node.y + offsetY });
  });
  const segments = nodes.slice(0, -1).map((node, index) => ({
    path: `M${pointString(upper[index])} L${pointString(upper[index + 1])} L${pointString(lower[index + 1])} L${pointString(lower[index])} Z`,
    front: Math.cos((node.twist + nodes[index + 1].twist) / 2) >= 0,
    shade: Math.abs(Math.sin((node.twist + nodes[index + 1].twist) / 2)) * .18,
  }));
  const bottom = curve([...lower].reverse());
  return {
    body: `${curve(upper)} L${bottom.slice(1)} Z`,
    lettering: curve(nodes.map(node => ({ x: node.x, y: node.y + 5 }))),
    front: segments.filter(segment => segment.front).map(segment => segment.path).join(" "),
    back: segments.filter(segment => !segment.front).map(segment => segment.path).join(" "),
    segments,
    height: nodes.reduce((sum, node) => sum + node.z, 0) / nodes.length,
  };
}
