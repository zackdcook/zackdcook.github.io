import type { BeBravePublicDrawing } from "../bebrave-types";
import { sparklePoints } from "./effect-anchors";
import { legendaryColor, legendaryEffect } from "./effects";

type Point = [number, number];
type Anchor = { x: number; y: number; r: number; delay: number };
type Sample = { x: number; y: number; nx: number; ny: number; distance: number };
export type EnchantmentCamera = { top: number; height: number; scale: number; pixelRatio: number };
export type EnchantmentParticle = {
  x: number; y: number; radius: number; opacity: number; rotation: number;
  kind: "mote" | "spark" | "trail" | "heart" | "blood" | "wisp";
  tail: Point[]; color: string; highlight: string;
};

const tau = Math.PI * 2;
const clamp = (n: number, low = 0, high = 1) => Math.max(low, Math.min(high, n));
const fraction = (n: number) => n - Math.floor(n);
const noise = (seed: number) => fraction(Math.sin(seed * 12.9898 + 78.233) * 43758.5453);
const rgb = (color: string) => [1, 3, 5].map(at => Number.parseInt(color.slice(at, at + 2), 16));
const highlight = (color: string, amount: number) => `rgb(${rgb(color).map(c => Math.round(c + (255 - c) * amount)).join(",")})`;

export const enchantedTier = (rarity: BeBravePublicDrawing["rarity"]) => rarity === "superior" || rarity === "epic" || rarity === "legendary";

/** A uniform arc-length sampling keeps aura motion independent of pointer
 * sample rate and archival simplification. The original vertices are untouched. */
export function sampleEnchantmentStroke(points: Point[], spacing = 22): Sample[] {
  if (points.length < 2) return [];
  const totalLength = points.slice(1).reduce((sum, point, i) => sum + Math.hypot(point[0] - points[i][0], point[1] - points[i][1]), 0);
  spacing = Math.max(spacing, totalLength / 160);
  const samples: Array<{ x: number; y: number; distance: number }> = [{ x: points[0][0], y: points[0][1], distance: 0 }];
  let distance = 0, next = spacing;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    while (length > 0 && next <= distance + length) {
      const progress = (next - distance) / length;
      samples.push({ x: a[0] + (b[0] - a[0]) * progress, y: a[1] + (b[1] - a[1]) * progress, distance: next });
      next += spacing;
    }
    distance += length;
  }
  const last = points.at(-1)!;
  if (distance > samples.at(-1)!.distance) samples.push({ x: last[0], y: last[1], distance });
  return samples.map((s, i) => {
    const a = samples[Math.max(0, i - 1)], b = samples[Math.min(samples.length - 1, i + 1)];
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { ...s, nx: -(b.y - a.y) / length, ny: (b.x - a.x) / length };
  });
}

export function enchantmentAnchors(drawing: BeBravePublicDrawing): Anchor[] {
  if (drawing.rarity === "superior" || !enchantedTier(drawing.rarity)) return [];
  return drawing.strokes.flatMap(stroke => stroke.sparkles ?? sparklePoints(stroke.points, drawing.effectSeed, stroke.strokeOrder));
}

function rainbowColor(time: number, x: number) {
  const h = fraction(time * .065 + x / 720) * 6;
  const middle = 1 - Math.abs(h % 2 - 1);
  const channels = h < 1 ? [1, middle, 0] : h < 2 ? [middle, 1, 0] : h < 3 ? [0, 1, middle] : h < 4 ? [0, middle, 1] : h < 5 ? [middle, 0, 1] : [1, 0, middle];
  return `#${channels.map(channel => Math.round(65 + channel * 190).toString(16).padStart(2, "0")).join("")}`;
}

/** Each stored anchor continuously emits. A new cycle has a different seeded
 * trajectory; restoring an archive needs no particle positions or new rolls. */
export function enchantmentParticleAt(drawing: BeBravePublicDrawing, anchor: Anchor, index: number, seconds: number): EnchantmentParticle {
  const effect = drawing.rarity === "legendary" ? legendaryEffect(drawing.effectId) : undefined;
  const blood = effect === "blood-v1";
  const seed = drawing.effectSeed + index * 137.53;
  const life = 2.3 + noise(seed + 4) * 2.1;
  const clock = seconds / life + anchor.delay / 3.8 + noise(seed);
  const age = fraction(clock), cycle = Math.floor(clock);
  const drift = (noise(seed + cycle * 19) - .5) * (blood ? 20 : 126);
  const curl = (noise(seed + 8) - .5) * (blood ? 4 : 46);
  const lift = blood ? 110 + anchor.r * 30 : -(104 + anchor.r * 25);
  const position = (a: number): Point => [
    anchor.x + drift * a + Math.sin(a * tau + seed) * curl * Math.sin(a * Math.PI),
    anchor.y + lift * a + (blood ? 0 : Math.sin(a * tau * 1.4 + seed) * 9 * Math.sin(a * Math.PI)),
  ];
  const [x, y] = position(age);
  const base = effect === "rainbow-v1" ? rainbowColor(seconds, anchor.x) : legendaryColor(effect, drawing.color);
  const kind = blood ? "blood" : effect === "hearts-v1" ? "heart" : effect === "will-o-wisp-v1" ? "wisp" : index % 5 === 0 ? "trail" : index % 3 === 0 ? "spark" : "mote";
  const twinkle = kind === "spark" ? .72 + .28 * Math.sin(seconds * (7 + noise(seed) * 7) + seed) ** 8 : 1;
  return {
    x, y, kind, color: blood ? "#760B20" : base, highlight: highlight(base, .45),
    radius: (kind === "spark" ? anchor.r * 2.4 : kind === "heart" ? anchor.r * 2.5 : kind === "wisp" ? anchor.r * 1.8 : anchor.r * 1.25) * (.55 + .65 * Math.sin(age * Math.PI)),
    opacity: clamp(age / .12) * clamp((1 - age) / .3) * twinkle,
    rotation: blood ? 0 : Math.sin(seconds * 1.5 + seed) * .3,
    tail: [position(Math.max(0, age - .035)), position(Math.max(0, age - .075)), position(Math.max(0, age - .12))],
  };
}

export function enchantmentSurface(camera: EnchantmentCamera, totalHeight: number) {
  const scale = Math.max(.01, camera.scale);
  const top = Math.max(0, Math.floor((camera.top - 260) / 160) * 160);
  const height = Math.max(1, Math.min(totalHeight - top, camera.height + 680));
  // Two camera-sized buffers, never a bitmap the height of the shared tree.
  const padding = 120, worldWidth = 720 + padding * 2;
  const ratio = Math.max(.5, Math.min(2, camera.pixelRatio, Math.sqrt(1_600_000 / (worldWidth * scale * height * scale))));
  return { top, height, scale, ratio, padding, worldWidth, width: Math.max(1, Math.ceil(worldWidth * scale * ratio)), pixelsHigh: Math.max(1, Math.ceil(height * scale * ratio)) };
}

type PreparedDrawing = { signature: string; path: Path2D; strokes: Sample[][]; anchors: Anchor[]; top: number; bottom: number };
function geometrySignature(drawing: BeBravePublicDrawing) {
  return drawing.strokes.map(stroke => `${stroke.strokeId}:${stroke.points.length}:${stroke.points.at(-1)?.join(",")}`).join("|");
}

/** One painter serves the live tool, settled draft, published tree and fallen
 * snapshot. It paints spatial motion instead of relying on SVG CSS filters. */
export class EnchantmentPainter {
  private cache = new Map<string, PreparedDrawing>();
  constructor(private aura: CanvasRenderingContext2D, private motes: CanvasRenderingContext2D, private makePath: () => Path2D = () => new Path2D()) {}
  get cacheSize() { return this.cache.size; }

  private prepare(drawing: BeBravePublicDrawing) {
    const signature = geometrySignature(drawing);
    const saved = this.cache.get(drawing.id);
    if (saved?.signature === signature) return saved;
    const path = this.makePath();
    let top = Infinity, bottom = -Infinity;
    for (const stroke of drawing.strokes) stroke.points.forEach(([x, y], index) => {
      if (index === 0) path.moveTo(x, y); else path.lineTo(x, y);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    });
    const entry = { signature, path, top, bottom, strokes: drawing.strokes.map(stroke => sampleEnchantmentStroke(stroke.points)), anchors: enchantmentAnchors(drawing) };
    this.cache.delete(drawing.id); this.cache.set(drawing.id, entry);
    return entry;
  }

  clear() {
    for (const context of [this.aura, this.motes]) {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }
  }

  paint(drawings: BeBravePublicDrawing[], camera: EnchantmentCamera, totalHeight: number, seconds: number) {
    const surface = enchantmentSurface(camera, totalHeight);
    for (const context of [this.aura, this.motes]) {
      const canvas = context.canvas;
      if (canvas.width !== surface.width) canvas.width = surface.width;
      if (canvas.height !== surface.pixelsHigh) canvas.height = surface.pixelsHigh;
      canvas.style.top = `${surface.top}px`; canvas.style.height = `${surface.height}px`;
      canvas.style.left = `${-surface.padding}px`; canvas.style.width = `${surface.worldWidth}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      const pixelScale = surface.scale * surface.ratio;
      context.setTransform(pixelScale, 0, 0, pixelScale, surface.padding * pixelScale, -surface.top * pixelScale);
      context.lineCap = "round"; context.lineJoin = "round";
      context.globalCompositeOperation = "source-over";
    }
    const magical = drawings.filter(drawing => enchantedTier(drawing.rarity));
    const crowded = magical.length > 12;
    let auraCount = 0, particleCount = 0;
    for (const drawing of magical) {
      const prepared = this.prepare(drawing);
      if (prepared.bottom + 260 < camera.top || prepared.top - 260 > camera.top + camera.height) continue;
      auraCount++;
      this.paintAura(drawing, prepared, seconds, surface.scale * surface.ratio, crowded);
      const budget = Math.max(2, Math.floor(220 / Math.max(1, magical.length)));
      const stride = Math.max(1, Math.ceil(prepared.anchors.length / budget));
      for (let index = 0; index < prepared.anchors.length; index += stride) {
        const particle = enchantmentParticleAt(drawing, prepared.anchors[index], index, seconds);
        if (particle.opacity < .02) continue;
        particleCount++; this.paintParticle(particle, surface.scale * surface.ratio);
      }
    }
    // Discard unseen geometry first; cap cached paths during long-history QA.
    if (this.cache.size > 128) {
      const present = new Set(magical.map(drawing => drawing.id));
      for (const id of this.cache.keys()) if (!present.has(id)) this.cache.delete(id);
      while (this.cache.size > 128) this.cache.delete(this.cache.keys().next().value!);
    }
    return { auras: auraCount, particles: particleCount, surface };
  }

  private paintAura(drawing: BeBravePublicDrawing, prepared: PreparedDrawing, seconds: number, pixelScale: number, crowded: boolean) {
    const context = this.aura;
    const effect = drawing.rarity === "legendary" ? legendaryEffect(drawing.effectId) : undefined;
    const blood = effect === "blood-v1", rainbow = effect === "rainbow-v1";
    const color = blood ? "#030105" : rainbow ? rainbowColor(seconds, 360) : drawing.color;
    const phase = drawing.effectSeed % 97;
    const breathe = .78 + .17 * Math.sin(seconds * 1.9 + phase) + .05 * Math.sin(seconds * 3.1 + phase);
    context.strokeStyle = color; context.shadowColor = color;
    // Saturated layers form a soft substantial mantle around the crisp SVG core.
    // Source-over union strokes preserve the assigned color at own crossings.
    for (const [width, opacity] of (crowded ? [[46, .14], [25, .38]] : [[68, .055], [49, .12], [33, .25], [20, .37]])) {
      context.lineWidth = width * (1 + .08 * Math.sin(seconds * 1.5 + phase));
      context.globalAlpha = opacity * breathe;
      context.shadowBlur = crowded ? 0 : 12 * pixelScale;
      context.stroke(prepared.path);
    }
    if (!crowded) prepared.strokes.forEach((samples, strokeIndex) => {
      if (samples.length < 3) return;
      for (const side of [-1, 1]) {
        context.beginPath();
        samples.forEach((point, index) => {
          const wave = Math.sin(point.distance * .034 - seconds * 3 + phase + strokeIndex);
          const curl = Math.sin(point.distance * .017 + seconds * 2.2 + phase);
          const offset = side * (17 + 7 * wave + 5 * curl);
          const x = point.x + point.nx * offset, y = point.y + point.ny * offset;
          if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
        });
        context.lineWidth = 9 + 3 * Math.sin(seconds * 2.1 + phase + side);
        context.globalAlpha = blood ? .46 : .26;
        context.shadowBlur = 16 * pixelScale;
        context.strokeStyle = rainbow ? rainbowColor(seconds + side, strokeIndex * 150) : color;
        context.stroke();
      }
    });
    context.globalAlpha = 1; context.shadowBlur = 0;
  }

  private paintParticle(particle: EnchantmentParticle, pixelScale: number) {
    const context = this.motes, r = particle.radius;
    context.save(); context.globalAlpha = particle.opacity;
    context.shadowColor = particle.color; context.shadowBlur = 12 * pixelScale;
    if (particle.kind === "trail" || particle.kind === "wisp") {
      context.strokeStyle = particle.color; context.lineWidth = 2.4;
      context.beginPath(); context.moveTo(particle.x, particle.y);
      for (const [x, y] of particle.tail) context.lineTo(x, y);
      context.stroke();
    }
    context.translate(particle.x, particle.y); context.rotate(particle.rotation);
    context.fillStyle = particle.color;
    context.beginPath();
    if (particle.kind === "heart") {
      context.moveTo(0, r); context.bezierCurveTo(-r * 2, -.15 * r, -r, -1.7 * r, 0, -.5 * r);
      context.bezierCurveTo(r, -1.7 * r, r * 2, -.15 * r, 0, r);
    } else if (particle.kind === "blood") {
      context.shadowColor = "#120106"; context.shadowBlur = 3 * pixelScale;
      context.moveTo(0, -r * 1.5); context.bezierCurveTo(-r * .3, -r * .2, -r, r * .2, -r * .7, r);
      context.bezierCurveTo(-r * .3, r * 1.7, r, r * 1.4, r * .7, r * .6);
      context.bezierCurveTo(r * .5, 0, r * .2, -.6 * r, 0, -r * 1.5);
    } else if (particle.kind === "spark") {
      for (let i = 0; i < 8; i++) {
        const radius = i % 2 ? r * .19 : r;
        const x = Math.sin(i * Math.PI / 4) * radius, y = Math.cos(i * Math.PI / 4) * radius;
        if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
    } else context.ellipse(0, 0, r, particle.kind === "wisp" ? r * 1.6 : r, .15, 0, tau);
    context.closePath(); context.fill();
    if (particle.kind !== "blood") {
      context.shadowBlur = 0; context.fillStyle = particle.highlight;
      context.beginPath(); context.arc(0, 0, Math.max(1.1, r * .34), 0, tau); context.fill();
    }
    context.restore();
  }
}
