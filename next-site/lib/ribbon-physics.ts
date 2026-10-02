export type RibbonNode = { x: number; y: number; vx: number; vy: number; restX: number; restY: number };
export type RibbonGrab = { index: number; x: number; y: number };

export function createRibbon(): RibbonNode[] {
  return Array.from({ length: 9 }, (_, index) => {
    const x = 20 + index * 75;
    const y = 78 + Math.sin(index / 8 * Math.PI) * 7;
    return { x, y, vx: 0, vy: 0, restX: x, restY: y };
  });
}

/** Linked damped springs, with a soft grab rather than a rigid translation. */
export function stepRibbon(nodes: RibbonNode[], grab: RibbonGrab | null, elapsed: number, reduced = false) {
  const dt = Math.max(.1, Math.min(1.5, elapsed / 16.67));
  const targets = nodes.map((node, index) => {
    const weight = grab ? .22 + .78 * Math.exp(-Math.pow((index - grab.index) / 2.5, 2)) : 0;
    return { x: node.restX + (grab?.x ?? 0) * weight, y: node.restY + (grab?.y ?? 0) * weight };
  });
  // Read the previous positions for every spring before advancing any node.
  const forces = nodes.map((node, index) => {
    let x = (targets[index].x - node.x) * .14;
    let y = (targets[index].y - node.y) * .14;
    for (const neighbor of [index - 1, index + 1]) if (nodes[neighbor]) {
      x += (nodes[neighbor].x - node.x - (nodes[neighbor].restX - node.restX)) * .045;
      y += (nodes[neighbor].y - node.y - (nodes[neighbor].restY - node.restY)) * .045;
    }
    return { x, y };
  });
  let moving = false;
  nodes.forEach((node, index) => {
    if (reduced) {
      node.x = targets[index].x; node.y = targets[index].y;
      node.vx = node.vy = 0;
    } else {
      node.vx = (node.vx + forces[index].x * dt) * Math.pow(.77, dt);
      node.vy = (node.vy + forces[index].y * dt) * Math.pow(.77, dt);
      node.x += node.vx * dt; node.y += node.vy * dt;
      moving ||= Math.abs(node.vx) + Math.abs(node.vy) + Math.abs(forces[index].x) + Math.abs(forces[index].y) > .03;
    }
  });
  return moving;
}

type Point = { x: number; y: number };
function curve(points: Point[]) {
  const point = (p: Point) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  let path = `M${point(points[0])}`;
  for (let index = 0; index < points.length - 1; index++) {
    const before = points[Math.max(0, index - 1)], current = points[index];
    const next = points[index + 1], after = points[Math.min(points.length - 1, index + 2)];
    path += ` C${point({ x: current.x + (next.x - before.x) / 6, y: current.y + (next.y - before.y) / 6 })} ${point({ x: next.x - (after.x - current.x) / 6, y: next.y - (after.y - current.y) / 6 })} ${point(next)}`;
  }
  return path;
}

export function ribbonPaths(nodes: RibbonNode[]) {
  const upper: Point[] = [], lower: Point[] = [];
  nodes.forEach((node, index) => {
    const before = nodes[Math.max(0, index - 1)], after = nodes[Math.min(nodes.length - 1, index + 1)];
    const angle = Math.atan2(after.y - before.y, after.x - before.x);
    const offsetX = -Math.sin(angle) * 19, offsetY = Math.cos(angle) * 19;
    upper.push({ x: node.x - offsetX, y: node.y - offsetY });
    lower.push({ x: node.x + offsetX, y: node.y + offsetY });
  });
  const bottom = curve(lower.reverse());
  return { body: `${curve(upper)} L${bottom.slice(1)} Z`, lettering: curve(nodes.map(node => ({ x: node.x, y: node.y + 5 }))) };
}
