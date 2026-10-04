export type LeafBody = { x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number; vx: number; vy: number; vz: number; wx: number; wy: number; wz: number; base: number; phase: number; order: number };
export type LeafBounds = { width: number; height: number; leafWidth: number };
export type LeafPoint = { x: number; y: number };
export const leafPerspective = 1600;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const radians = Math.PI / 180;

function randomFor(index: number) {
  let seed = (index + 11) * 2654435761 >>> 0;
  seed = Math.imul(seed ^ seed >>> 16, 0x21f0aaad);
  seed = Math.imul(seed ^ seed >>> 15, 0x735a2d97);
  seed = (seed ^ seed >>> 15) >>> 0;
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

/** Project the complete blade, stem and cast, including airborne XYZ rotation. */
export function leafProjectedBounds(leaf: LeafBody, bounds: LeafBounds) {
  const ax=leaf.rx*radians, ay=leaf.ry*radians, az=leaf.rz*radians;
  const cx=Math.cos(ax), sx=Math.sin(ax), cy=Math.cos(ay), sy=Math.sin(ay), cz=Math.cos(az), sz=Math.sin(az);
  const halfWidth=bounds.leafWidth*leaf.scale/2, halfHeight=halfWidth/1.6;
  let left=Infinity, right=-Infinity, top=Infinity, bottom=-Infinity;
  for (const dx of [-halfWidth,halfWidth]) for (const dy of [-halfHeight,halfHeight]) {
    // CSS applies rotateZ, then rotateY, then rotateX to the local surface.
    const u=dx*cz-dy*sz, v=dx*sz+dy*cz, q=-u*sy;
    const x=u*cy, y=v*cx-q*sx, z=v*sx+q*cx;
    const projection=leafPerspective/(leafPerspective-leaf.z-z);
    const px=bounds.width/2+(leaf.x-bounds.width/2+x)*projection;
    const py=bounds.height/2+(leaf.y-bounds.height/2+y)*projection;
    left=Math.min(left,px); right=Math.max(right,px); top=Math.min(top,py); bottom=Math.max(bottom,py);
  }
  const shadow=26+Math.max(0,leaf.z-leaf.base)*.13;
  return { left:left-shadow, right:right+shadow, top:top-shadow, bottom:bottom+shadow };
}
function containLeaf(leaf: LeafBody, bounds: LeafBounds) {
  // Two small corrections account for corners at different perspective depths.
  for (let pass=0; pass<3; pass++) {
    const box=leafProjectedBounds(leaf,bounds), projection=leafPerspective/(leafPerspective-leaf.z);
    const dx=box.left<0 ? -box.left : box.right>bounds.width ? bounds.width-box.right : 0;
    const dy=box.top<0 ? -box.top : box.bottom>bounds.height ? bounds.height-box.bottom : 0;
    if (!dx && !dy) break;
    leaf.x+=dx/projection; leaf.y+=dy/projection;
    if (dx && leaf.vx*dx<0) leaf.vx*=.15;
    if (dy && leaf.vy*dy<0) leaf.vy*=.15;
  }
}
export function makeLeafPile(count: number, bounds: LeafBounds, writtenCount=count): LeafBody[] {
  return Array.from({ length: count }, (_, i) => {
    const r=randomFor(i), angle=r()*Math.PI*2, spread=Math.sqrt(r()), written=i<writtenCount;
    const base=written ? 5+r()*4 : r()*3;
    const leaf: LeafBody = {
      x:bounds.width/2+Math.cos(angle)*spread*bounds.width*(written ? .17 : .24),
      y:bounds.height*.53+Math.sin(angle)*spread*bounds.height*(written ? .14 : .23),
      z:base, base, rx:r()*12-6, ry:r()*14-7, rz:r()*360-180,
      scale:written ? .88+r()*.18 : .38+r()*.26,
      vx:0, vy:0, vz:0, wx:0, wy:0, wz:0, phase:r()*Math.PI*2, order:written ? 100+i : i,
    };
    containLeaf(leaf,bounds); return leaf;
  });
}

/** A swept brush lifts a handful of leaves, rather than sliding a flat card. */
export function pushLeaves(leaves: LeafBody[], from: LeafPoint, to: LeafPoint, elapsed: number, bounds: LeafBounds, touch=false) {
  const dx=to.x-from.x, dy=to.y-from.y, distance=Math.hypot(dx,dy);
  if (!Number.isFinite(distance) || distance<.05) return false;
  const dt=clamp(elapsed,1/120,.08), speed=Math.min(1200,distance/dt), gain=touch ? 1.4 : 1;
  let touched=false, order=leaves.reduce((highest,leaf)=>Math.max(highest,leaf.order),0);
  for (const leaf of leaves) {
    const t=clamp(((leaf.x-from.x)*dx+(leaf.y-from.y)*dy)/(distance*distance),0,1);
    const px=from.x+t*dx, py=from.y+t*dy, a=-leaf.rz*radians, ox=px-leaf.x, oy=py-leaf.y;
    const localX=ox*Math.cos(a)-oy*Math.sin(a), localY=ox*Math.sin(a)+oy*Math.cos(a);
    const reach=touch ? 34 : 22;
    const contact=1-Math.hypot(localX/(bounds.leafWidth*leaf.scale*.46+reach),localY/(bounds.leafWidth*leaf.scale*.27+reach));
    if (contact<=0) continue;
    touched=true;
    const grip=.3+contact*.7, lift=Math.min(170,bounds.leafWidth*.58)*Math.sqrt(leaf.scale);
    leaf.x+=dx*grip*(touch ? .85 : .65); leaf.y+=dy*grip*(touch ? .85 : .65);
    leaf.vx=clamp(leaf.vx+dx/distance*speed*grip*.24*gain,-650,650);
    leaf.vy=clamp(leaf.vy+dy/distance*speed*grip*.24*gain,-650,650);
    leaf.z=Math.max(leaf.z,leaf.base+3);
    leaf.vz=Math.max(leaf.vz,Math.min(Math.sqrt(2*560*lift)*.9,(150+speed*.48)*grip*gain));
    const turn=Math.min(460,speed/Math.max(140,bounds.leafWidth)*150)*grip;
    leaf.wx=(dy/distance*.85+Math.sin(leaf.phase)*.45)*turn;
    leaf.wy=(-dx/distance*.9+Math.cos(leaf.phase)*.3)*turn;
    leaf.wz=clamp(leaf.wz+(ox*dy-oy*dx)/Math.max(60,bounds.leafWidth)*grip*6+Math.sin(leaf.phase+dx/distance)*turn*.18,-300,300);
    leaf.order=++order; containLeaf(leaf,bounds);
  }
  return touched;
}
function landingAngles(leaf: LeafBody) {
  // Choose the nearest FRONT-up plane, even after a complete tumble. The
  // unlettered underside is only exposed during flight, not left hiding notes.
  const flatX=Math.round(leaf.rx/360)*360, flatY=Math.round(leaf.ry/360)*360;
  const flippedX=Math.round((leaf.rx-180)/360)*360+180, flippedY=Math.round((leaf.ry-180)/360)*360+180;
  return Math.abs(flatX-leaf.rx)+Math.abs(flatY-leaf.ry) <= Math.abs(flippedX-leaf.rx)+Math.abs(flippedY-leaf.ry) ? [flatX,flatY] : [flippedX,flippedY];
}
export function stepLeaves(leaves: LeafBody[], elapsed: number, bounds: LeafBounds) {
  const dt=clamp(elapsed,0,1/30);
  let moving=false;
  for (const leaf of leaves) {
    const airborne=leaf.z>leaf.base+.1 || leaf.vz>0;
    leaf.x+=leaf.vx*dt; leaf.y+=leaf.vy*dt;
    if (airborne) {
      leaf.phase+=dt;
      leaf.vz-=560*dt;
      // Broadside blades catch the air on descent; edges fall more quickly.
      const broadside=Math.abs(Math.cos(leaf.rx*radians)*Math.cos(leaf.ry*radians));
      leaf.vz*=Math.exp(-(leaf.vz<0 ? 1.2+broadside*2.5 : .7)*dt);
      leaf.z+=leaf.vz*dt;
      const ceiling=leaf.base+Math.min(170,bounds.leafWidth*.58)*Math.sqrt(leaf.scale);
      if (leaf.z>ceiling) { leaf.z=ceiling; leaf.vz=Math.min(0,leaf.vz)*.2; }
      leaf.wx=(leaf.wx+Math.sin(leaf.phase*10)*65*dt)*Math.exp(-.9*dt);
      leaf.wy=(leaf.wy+Math.cos(leaf.phase*8)*55*dt)*Math.exp(-.9*dt);
      leaf.rx+=leaf.wx*dt; leaf.ry+=leaf.wy*dt;
    }
    let lean=0;
    if (leaf.z<=leaf.base || !airborne) {
      leaf.z=leaf.base; leaf.vz=0;
      const [targetX,targetY]=landingAngles(leaf);
      leaf.wx=(leaf.wx+(targetX-leaf.rx)*110*dt)*Math.exp(-18*dt);
      leaf.wy=(leaf.wy+(targetY-leaf.ry)*110*dt)*Math.exp(-18*dt);
      leaf.rx+=leaf.wx*dt; leaf.ry+=leaf.wy*dt;
      if (Math.abs(targetX-leaf.rx)<.08 && Math.abs(leaf.wx)<.1) { leaf.rx=targetX; leaf.wx=0; }
      if (Math.abs(targetY-leaf.ry)<.08 && Math.abs(leaf.wy)<.1) { leaf.ry=targetY; leaf.wy=0; }
      lean=Math.abs(targetX-leaf.rx)+Math.abs(targetY-leaf.ry);
    }
    const drag=Math.exp(-(leaf.z>leaf.base ? 1.7 : 7)*dt);
    leaf.vx*=drag; leaf.vy*=drag; leaf.wz*=drag; leaf.rz+=leaf.wz*dt;
    containLeaf(leaf,bounds);
    const energy=Math.abs(leaf.vx)+Math.abs(leaf.vy)+Math.abs(leaf.wx)+Math.abs(leaf.wy)+Math.abs(leaf.wz)+lean;
    moving ||= leaf.z>leaf.base+.1 || energy>.2;
    if (energy<=.2 && leaf.z===leaf.base) leaf.vx=leaf.vy=leaf.wz=0;
  }
  return moving;
}
