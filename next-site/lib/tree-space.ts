import { signatureNameLines, type Point, type Stroke } from "@/lib/guestbook";

// These are permanent world units. Never change them after the first approval.
export const treeWidth = 720;
export const unitsPerFoot = 288;
export const activeFeet = 5;
export const treeSectionHeight = 864;
export const carvingWidth = 216;
export const carvingHeight = 76;
export const cellSize = 4;
export const cellsPerRow = treeWidth / cellSize;
export const fallenBaseUnits = 720;
// Rigid rotation, without reflow or moving any carving relative to a landmark.
export const fallenPoint = (x:number,y:number,height:number) => ({ x:height + fallenBaseUnits - y, y:x });
export type Geometry = { contours: Point[][]; lines: Stroke[] };
export type FontGeometry = { units: number; glyphs: Record<string, { advance: number; contours: Point[][] }> };
export type TreeState = { approved_count: number; height: number; active_top: number; active_bottom: number; version: number; oldest: { id: string; y: number; public_sequence: number } | null; newest: { id: string; y: number; public_sequence: number } | null };
export const emptyTree: TreeState = { approved_count: 0, height: 1440, active_top: 0, active_bottom: 1440, version: 1, oldest: null, newest: null };

export function treeBounds(approved: number) {
  if (!Number.isSafeInteger(approved) || approved < 0) throw new Error("Invalid tree count.");
  const height = activeFeet * unitsPerFoot + Math.floor(approved / 2) * unitsPerFoot;
  return { height, active_top: height - activeFeet * unitsPerFoot, active_bottom: height };
}
export const snap = (value: number) => Math.round(value / cellSize) * cellSize;

export function treeLandmark(section: number) {
  // Coordinate-hashed world landmarks, independent of population or viewport.
  const seed = ((section + 1) * 2654435761) >>> 0;
  return { knotX: 200 + seed % 300, knotY: 160 + (seed >>> 8) % 480, variant: section % 3, width: Math.min(670, 570 + Math.floor(section / 8) * 12) };
}
export function barkEdges(y: number) {
  const section = Math.max(0, Math.floor(y / treeSectionHeight));
  const width = treeLandmark(section).width;
  return { left: (treeWidth - width) / 2 + 12, right: (treeWidth + width) / 2 - 12 };
}
export function validPlacement(x: number, y: number, state: Pick<TreeState, "active_top" | "active_bottom">) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x !== snap(x) || y !== snap(y) || y < state.active_top || y + carvingHeight > state.active_bottom) return false;
  const a = barkEdges(y), b = barkEdges(y + carvingHeight);
  return x >= Math.max(a.left, b.left) && x + carvingWidth <= Math.min(a.right, b.right);
}

export function typedGeometry(name: string, note: string, font: FontGeometry): Geometry {
  const contours: Point[][] = [];
  function addLine(text: string, baseline: number, desired: number) {
    const glyphs = [...text].map(char => {
      const glyph = font.glyphs[String(char.codePointAt(0))];
      if (!glyph) throw new Error("This handwriting supports Latin letters and punctuation. Try Draw for other symbols.");
      return glyph;
    });
    const advance = glyphs.reduce((total,g) => total + g.advance, 0);
    const size = Math.min(desired, 550 / Math.max(advance / font.units, 1));
    const scale = size / font.units;
    let x = (600 - advance * scale) / 2;
    for (const glyph of glyphs) {
      for (const contour of glyph.contours) contours.push(contour.map(([a,b]) => [Math.round((x + a*scale)*10)/10, Math.round((baseline+b*scale)*10)/10]));
      x += glyph.advance * scale;
    }
  }
  const lines = signatureNameLines(name);
  lines.forEach((line,i) => addLine(line, lines.length === 1 ? 108 : 74+i*58, 53));
  if (note) addLine(note, 183, 25);
  if (contours.some(c => c.some(([x,y]) => x < 0 || x > 600 || y < 0 || y > 210))) throw new Error("Make your name or note a little shorter so it fits.");
  return { contours, lines: [] };
}

function inside(x: number,y: number,contour: Point[]) {
  let result = false;
  for (let i=0,j=contour.length-1;i<contour.length;j=i++) {
    const a=contour[i],b=contour[j];
    if ((a[1]>y)!==(b[1]>y) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) result=!result;
  }
  return result;
}
function segmentDistance(x: number,y: number,a: Point,b: Point) {
  const dx=b[0]-a[0],dy=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy || 1)));
  return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
export function collisionMask(geometry: Geometry): number[] {
  const sx=carvingWidth/600,sy=carvingHeight/210;
  const contours=geometry.contours.map(c=>c.map(([x,y])=>[x*sx,y*sy] as Point));
  const lines=geometry.lines.map(c=>c.map(([x,y])=>[x*sx,y*sy] as Point));
  const mask:number[]=[];
  for(let gy=0;gy<carvingHeight/cellSize;gy++) for(let gx=0;gx<carvingWidth/cellSize;gx++) {
    const x=gx*cellSize+cellSize/2,y=gy*cellSize+cellSize/2;
    let filled=false;
    for(const c of contours) if(inside(x,y,c)) filled=!filled;
    // Grid half-diagonal + small knife-cut safety margin: no missed thin strokes.
    const near=(groups:Point[][],closed:boolean,radius:number)=>groups.some(c=>c.some((p,i)=>i>0?segmentDistance(x,y,c[i-1],p)<=radius:closed&&segmentDistance(x,y,c[c.length-1],p)<=radius));
    if(filled||near(contours,true,3.4)||near(lines,false,4.2)) mask.push(gy*cellsPerRow+gx);
  }
  if(!mask.length) throw new Error("Add a visible signature before choosing bark.");
  return mask;
}
export function footprintAt(mask: number[],x: number,y: number) { const offset=y/cellSize*cellsPerRow+x/cellSize; return mask.map(cell=>cell+offset); }
export function collides(cells: number[], occupied: Set<number>) { return cells.some(cell=>occupied.has(cell)); }
export function geometryPath(contours: Point[][]) { return contours.map(c=>c.map(([x,y],i)=>`${i ? "L" : "M"}${x} ${y}`).join(" ")+" Z").join(" "); }
