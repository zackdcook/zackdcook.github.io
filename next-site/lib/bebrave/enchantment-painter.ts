import type { BeBravePublicDrawing } from "../bebrave-types";
import { sparklePoints } from "./effect-anchors";
import { legendaryColor, legendaryEffect } from "./effects";
import { carvingEdge } from "./carving-contrast";
import { PARTICLE_SYMBOLS, PERSONAL_SYMBOL, SYMBOL_PATHS } from "./symbol-paths";
import { fullEffectDetail, type EffectDetail } from "./effect-quality";

type Point = [number, number];
type Anchor = { x: number; y: number; r: number; delay: number };
type Sample = { x: number; y: number; nx: number; ny: number; distance: number };
export type EnchantmentCamera = {
  top: number; height: number; scale: number; pixelRatio: number;
  /** Standing canvases live in scene coordinates and scroll with the bark. */
  left?: number; offsetTop?: number; viewportWidth?: number; viewportHeight?: number;
};
export type EnchantmentParticle = {
  x: number; y: number; radius: number; opacity: number; rotation: number;
  kind: "mote" | "spark" | "trail" | "heart" | "blood" | "wisp";
  tail: Point[]; color: string; highlight: string;
  symbol:number;
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

/** The server's saved random roll also chooses one symbol for the whole mark.
 * Integer mixing makes that choice identical across devices and refreshes. */
export function carvingParticleSymbol(drawing: BeBravePublicDrawing): number {
  if (drawing.rarity === "legendary" && drawing.effectId === "blood-v1") return PERSONAL_SYMBOL;
  if (drawing.rarity === "legendary" && drawing.effectId === "hearts-v1") return 0x2665;
  let seed = (drawing.effectSeed >>> 0) ^ 0x9e3779b9;
  seed = Math.imul(seed ^ (seed >>> 16), 0x85ebca6b);
  seed = Math.imul(seed ^ (seed >>> 13), 0xc2b2ae35);
  return PARTICLE_SYMBOLS[((seed ^ (seed >>> 16)) >>> 0) % PARTICLE_SYMBOLS.length];
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
    x, y, kind, color: blood ? "#760B20" : base, highlight: blood?"#D82B45":highlight(base, .45),
    symbol: carvingParticleSymbol(drawing),
    radius: anchor.r * (kind === "spark" ? 3 : 2.5) * (.55 + .65 * Math.sin(age * Math.PI)),
    opacity: clamp(age / .12) * clamp((1 - age) / .3) * twinkle,
    rotation: blood ? 0 : Math.sin(seconds * 1.5 + seed) * .3,
    tail: [position(Math.max(0, age - .035)), position(Math.max(0, age - .075)), position(Math.max(0, age - .12))],
  };
}

export function enchantmentSurface(camera: EnchantmentCamera, totalHeight: number, pixelBudget = 900_000) {
  const scale = Math.max(.01, camera.scale);
  const portrait = camera.viewportWidth !== undefined;
  // Stable screen-sized buffers never change dimensions during pinch zoom or
  // Safari toolbar movement. Only their world-to-pixel transform changes.
  const cssWidth = portrait ? Math.max(1, camera.viewportWidth!) : 960 * scale;
  const cssHeight = portrait ? Math.max(1, camera.viewportHeight ?? camera.height * scale) + 480 : Math.ceil((camera.height + 680) / 160) * 160 * scale;
  const bandTop = portrait ? Math.max(0, Math.floor((camera.top * scale - 240) / 96) * 96) : Math.max(0, Math.min(Math.floor((camera.top - 260) / 160) * 160, Math.max(0, totalHeight - cssHeight / scale))) * scale;
  const top = bandTop / scale, height = cssHeight / scale;
  const ratio = Math.min(1.5, Math.max(.1, camera.pixelRatio), Math.sqrt(pixelBudget / (cssWidth * cssHeight)));
  return {
    top, height, scale, ratio, portrait, padding: 120, worldWidth: cssWidth / scale,
    cssTop: portrait ? (camera.offsetTop ?? 0) + bandTop : top,
    cssLeft: portrait ? 0 : -120,
    cssWidth: portrait ? cssWidth : 960, cssHeight: portrait ? cssHeight : height,
    translateX: portrait ? (camera.left ?? 0) * ratio : 120 * scale * ratio,
    translateY: -bandTop * ratio,
    width: Math.max(1, Math.ceil(cssWidth * ratio)), pixelsHigh: Math.max(1, Math.ceil(cssHeight * ratio)),
  };
}

type PreparedDrawing = { signature: string; path: Path2D; strokes: Sample[][]; anchors: Anchor[]; top: number; bottom: number };
function geometrySignature(drawing: BeBravePublicDrawing) {
  return drawing.strokes.map(stroke => `${stroke.strokeId}:${stroke.points.length}:${stroke.points.at(-1)?.join(",")}`).join("|");
}

/** One painter serves the live tool, settled draft, published tree and fallen
 * snapshot. It paints spatial motion instead of relying on SVG CSS filters. */
export class EnchantmentPainter {
  private cache = new Map<string, PreparedDrawing>();
  private symbols = new Map<number,Path2D>();
  private base?:CanvasRenderingContext2D;
  private ink?:CanvasRenderingContext2D;
  private staticKey="";
  private lastCamera?: EnchantmentCamera;
  private lastSurface?: ReturnType<typeof enchantmentSurface>;

  /** Compositor-scale the previous raster immediately during a gesture. The
   * next effect frame replaces it at the new scale without moving the core. */
  followCamera(camera: EnchantmentCamera) {
    const old = this.lastCamera, band = this.lastSurface;
    if (!old || !band?.portrait || camera.viewportWidth === undefined) return;
    const ratio = camera.scale / old.scale;
    const x = (camera.left ?? 0) - ratio * (old.left ?? 0);
    const y = (camera.offsetTop ?? 0) - (old.offsetTop ?? 0) + (ratio - 1) * band.top * old.scale;
    const transform = ratio === 1 && x === 0 && y === 0 ? "none" : `matrix(${ratio},0,0,${ratio},${x},${y})`;
    for (const context of [this.aura, this.motes]) if (context.canvas.style.transform !== transform) context.canvas.style.transform = transform;
  }
  constructor(private aura: CanvasRenderingContext2D, private motes: CanvasRenderingContext2D, private makePath: (svg?:string) => Path2D = svg => new Path2D(svg), makeBuffer:()=>CanvasRenderingContext2D|undefined=()=>typeof document==="undefined"?undefined:document.createElement("canvas").getContext("2d")??undefined) {
    this.base=makeBuffer();this.ink=makeBuffer();
  }
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

  dispose() {
    this.clear();this.cache.clear();this.symbols.clear();
    for(const context of [this.aura,this.motes,this.base,this.ink])if(context){context.canvas.width=1;context.canvas.height=1;}
  }

  paint(drawings: BeBravePublicDrawing[], camera: EnchantmentCamera, totalHeight: number, seconds: number, detail: EffectDetail = fullEffectDetail) {
    const surface = enchantmentSurface(camera, totalHeight, detail.pixelBudget);
    for (const context of [this.aura, this.motes]) {
      const canvas = context.canvas;
      if (canvas.width !== surface.width) canvas.width = surface.width;
      if (canvas.height !== surface.pixelsHigh) canvas.height = surface.pixelsHigh;
      canvas.style.position = "absolute";
      canvas.style.top = `${surface.cssTop}px`;
      canvas.style.height = `${surface.cssHeight}px`;
      canvas.style.left = `${surface.cssLeft}px`;
      canvas.style.width = `${surface.cssWidth}px`;
      canvas.style.transformOrigin = "0 0";
      canvas.style.transform = "none";
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      const pixelScale = surface.scale * surface.ratio;
      context.setTransform(pixelScale, 0, 0, pixelScale, surface.translateX, surface.translateY);
      context.lineCap = "round"; context.lineJoin = "round";
      context.globalCompositeOperation = "source-over";
    }
    this.lastCamera = { ...camera }; this.lastSurface = surface;
    const magical = drawings.filter(drawing => enchantedTier(drawing.rarity));
    const crowded = magical.length > 12;
    const preparedAll=drawings.map(drawing=>({drawing,prepared:this.prepare(drawing)}));
    const pixelScale=surface.scale*surface.ratio;
    const key=`${surface.top}:${surface.height}:${surface.width}:${surface.pixelsHigh}:${pixelScale}:${surface.translateX}:${surface.translateY}:${surface.portrait}:${preparedAll.map(({drawing,prepared})=>`${drawing.id}:${prepared.signature}:${drawing.color}:${drawing.effectId}`).join("|")}`;
    if(this.base&&this.ink&&key!==this.staticKey){
      this.staticKey=key;
      for(const context of [this.base,this.ink]){
        if(context.canvas.width!==surface.width)context.canvas.width=surface.width;
        if(context.canvas.height!==surface.pixelsHigh)context.canvas.height=surface.pixelsHigh;
        context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,surface.width,surface.pixelsHigh);
        context.setTransform(pixelScale,0,0,pixelScale,surface.translateX,surface.translateY);
        context.lineCap="round";context.lineJoin="round";
      }
      for(const {drawing,prepared} of preparedAll)if(enchantedTier(drawing.rarity))this.paintMantle(this.base,drawing,prepared,pixelScale,crowded);
      if(surface.portrait)for(const {drawing,prepared} of preparedAll)this.paintInk(this.ink,drawing,prepared,seconds);
    }
    if(this.base){
      this.aura.save();this.aura.setTransform(1,0,0,1,0,0);this.aura.globalAlpha=.8+.2*Math.sin(seconds*1.8);this.aura.drawImage(this.base.canvas,0,0);this.aura.restore();
    }
    let auraCount = 0, particleCount = 0;
    for (const drawing of magical) {
      const prepared = this.prepare(drawing);
      if (prepared.bottom + 260 < camera.top || prepared.top - 260 > camera.top + camera.height) continue;
      auraCount++;
      this.paintAura(drawing, prepared, seconds, pixelScale, crowded, detail);
      const budget = Math.max(2, Math.floor(detail.particles / Math.max(1, magical.length)));
      const stride = Math.max(1, Math.ceil(prepared.anchors.length / budget));
      for (let index = 0; index < prepared.anchors.length; index += stride) {
        if (particleCount >= detail.particles) break;
        const particle = enchantmentParticleAt(drawing, prepared.anchors[index], index, seconds);
        if (particle.opacity < .02) continue;
        particleCount++; this.paintParticle(particle, surface.scale * surface.ratio, detail);
      }
    }
    if(surface.portrait){
      if(this.ink){
        if(drawings.some(d=>d.effectId==="rainbow-v1")){this.ink.setTransform(1,0,0,1,0,0);this.ink.clearRect(0,0,surface.width,surface.pixelsHigh);this.ink.setTransform(pixelScale,0,0,pixelScale,surface.translateX,surface.translateY);for(const {drawing,prepared} of preparedAll)this.paintInk(this.ink,drawing,prepared,seconds);}
        this.aura.save();this.aura.setTransform(1,0,0,1,0,0);this.aura.drawImage(this.ink.canvas,0,0);this.aura.restore();}
      else for(const {drawing,prepared} of preparedAll)this.paintInk(this.aura,drawing,prepared,seconds);
    }
    // Release abandoned paths immediately instead of retaining 128 dense marks.
    const present=new Set(drawings.map(drawing=>drawing.id));
    for(const id of this.cache.keys())if(!present.has(id))this.cache.delete(id);
    return { auras: auraCount, particles: particleCount, surface };
  }

  private paintMantle(context:CanvasRenderingContext2D,drawing:BeBravePublicDrawing,prepared:PreparedDrawing,pixelScale:number,crowded:boolean){
    const color=drawing.effectId==="blood-v1"?"#030105":drawing.color;
    context.strokeStyle=color;context.shadowColor=color;context.shadowBlur=crowded?0:12*pixelScale;
    for(const [width,opacity] of (crowded?[[46,.14],[25,.38]]:[[68,.055],[49,.12],[33,.25],[20,.37]])){
      context.lineWidth=width;context.globalAlpha=opacity;context.stroke(prepared.path);
    }
    context.globalAlpha=1;context.shadowBlur=0;
  }

  private paintInk(context:CanvasRenderingContext2D,drawing:BeBravePublicDrawing,prepared:PreparedDrawing,seconds:number){
    const magic=enchantedTier(drawing.rarity),blood=drawing.effectId==="blood-v1";
    const color=drawing.effectId==="rainbow-v1"?rainbowColor(seconds,360):legendaryColor(drawing.effectId,drawing.color);
    const mix=(other:string,amount:number)=>`rgb(${rgb(color).map((c,i)=>Math.round(c*(1-amount)+rgb(other)[i]*amount)).join(",")})`;
    const layers=magic?[[15.4,mix("#121526",.62),1],[13.4,mix("#121526",.42),1],[11.2,blood?"#660D20":highlight(color,.14),1],[9.2,color,1],[2.8,blood?"#FF6475":highlight(color,.36),1]]:[[15.4,"#FFF2C8",.78],[13.8,"#121526",1],[11.2,carvingEdge(color),.85],[9.2,color,1],[1.5,mix("#FFF2C8",.22),.85]];
    context.shadowBlur=0;
    const rainbow=drawing.effectId==="rainbow-v1"?context.createLinearGradient(0,0,720,0):null;
    if(rainbow)for(let i=0;i<=6;i++)rainbow.addColorStop(i/6,rainbowColor(seconds,i*120));
    for(const [width,ink,opacity] of layers){context.lineWidth=Number(width);context.strokeStyle=Number(width)===9.2&&rainbow?rainbow:String(ink);context.globalAlpha=Number(opacity);context.stroke(prepared.path);}
    context.globalAlpha=1;
  }

  private paintAura(drawing: BeBravePublicDrawing, prepared: PreparedDrawing, seconds: number, pixelScale: number, crowded: boolean, detail: EffectDetail) {
    const context = this.aura;
    const effect = drawing.rarity === "legendary" ? legendaryEffect(drawing.effectId) : undefined;
    const blood = effect === "blood-v1", rainbow = effect === "rainbow-v1";
    const color = blood ? "#030105" : rainbow ? rainbowColor(seconds, 360) : drawing.color;
    const phase = drawing.effectSeed % 97;
    const breathe = .78 + .17 * Math.sin(seconds * 1.9 + phase) + .05 * Math.sin(seconds * 3.1 + phase);
    context.strokeStyle = color; context.shadowColor = color;
    // Saturated layers form a soft substantial mantle around the crisp SVG core.
    // Source-over union strokes preserve the assigned color at own crossings.
    for (const [width, opacity] of (this.base&&!rainbow?[]:crowded ? [[46, .14], [25, .38]] : [[68, .055], [49, .12], [33, .25], [20, .37]])) {
      context.lineWidth = width * (1 + .08 * Math.sin(seconds * 1.5 + phase));
      context.globalAlpha = opacity * breathe;
      context.shadowBlur = crowded ? 0 : 12 * pixelScale;
      context.stroke(prepared.path);
    }
    if (!crowded && detail.ribbons) prepared.strokes.forEach((samples, strokeIndex) => {
      if (samples.length < 3) return;
      for (const side of [-1, 1]) {
        context.beginPath();
        samples.forEach((point, index) => {
          if (index % detail.sampleStride !== 0 && index !== samples.length - 1) return;
          const wave = Math.sin(point.distance * .034 - seconds * 3 + phase + strokeIndex);
          const curl = Math.sin(point.distance * .017 + seconds * 2.2 + phase);
          const offset = side * (17 + 7 * wave + 5 * curl);
          const x = point.x + point.nx * offset, y = point.y + point.ny * offset;
          if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
        });
        context.lineWidth = 9 + 3 * Math.sin(seconds * 2.1 + phase + side);
        context.globalAlpha = blood ? .46 : .26;
        context.shadowBlur = 0;
        context.strokeStyle = rainbow ? rainbowColor(seconds + side, strokeIndex * 150) : color;
        context.stroke();
      }
    });
    context.globalAlpha = 1; context.shadowBlur = 0;
  }

  private paintParticle(particle: EnchantmentParticle, pixelScale: number, detail: EffectDetail) {
    const context = this.motes, r = particle.radius;
    context.save(); context.globalAlpha = particle.opacity;
    context.shadowColor = particle.color; context.shadowBlur = detail.particleGlow ? 12 * pixelScale : 0;
    if (particle.kind === "trail" || particle.kind === "wisp" || particle.kind === "blood") {
      const end=particle.tail[2],middle=particle.tail[0];
      const dx=particle.x-end[0],dy=particle.y-end[1],length=Math.hypot(dx,dy)||1;
      const nx=-dy/length*r*.48,ny=dx/length*r*.48;
      const gradient=context.createLinearGradient(end[0],end[1],particle.x,particle.y);
      gradient.addColorStop(0,"transparent");gradient.addColorStop(.5,particle.color);gradient.addColorStop(1,particle.highlight);
      context.fillStyle=gradient;context.globalAlpha=particle.opacity*.36;context.beginPath();
      context.moveTo(particle.x+nx,particle.y+ny);
      context.bezierCurveTo(middle[0]+nx,middle[1]+ny,end[0]+nx*.12,end[1]+ny*.12,...end);
      context.bezierCurveTo(end[0]-nx*.12,end[1]-ny*.12,middle[0]-nx,middle[1]-ny,particle.x-nx,particle.y-ny);
      context.closePath();context.fill();context.globalAlpha=particle.opacity;
    }
    context.translate(particle.x, particle.y); context.rotate(particle.rotation);
    let glyph=this.symbols.get(particle.symbol);
    if(!glyph){glyph=this.makePath(SYMBOL_PATHS[particle.symbol]);this.symbols.set(particle.symbol,glyph);}
    context.scale(r,r);context.fillStyle=particle.color;context.fill(glyph);
    context.shadowBlur=0;context.globalAlpha=particle.opacity*.72;context.fillStyle=particle.highlight;context.fill(glyph);
    context.restore();
  }
}
