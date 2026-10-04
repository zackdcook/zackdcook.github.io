export type LeafBody = { x: number; y: number; z: number; rx: number; ry: number; rz: number; scale: number; vx: number; vy: number; vz: number; wx: number; wy: number; wz: number; base: number; phase: number; order: number };
export type LeafBounds = { width: number; height: number; leafWidth: number };
export type LeafPoint = { x: number; y: number };
export const leafBankLimit = 26;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const radians = Math.PI / 180;

function randomFor(index: number) {
  let seed = (index + 11) * 2654435761 >>> 0;
  seed = Math.imul(seed ^ seed >>> 16, 0x21f0aaad);
  seed = Math.imul(seed ^ seed >>> 15, 0x735a2d97);
  seed = (seed ^ seed >>> 15) >>> 0;
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

/** Orthographic banking keeps each blade in one paint layer. A shared CSS 3D
 * scene lets intersecting planes split their lettering and strains iOS Safari.
 * The same flat projection drives drawing, containment and surface lighting. */
export function leafProjection(leaf: LeafBody) {
  const ax=leaf.rx*radians, ay=leaf.ry*radians, az=leaf.rz*radians;
  const cx=Math.cos(ax), sx=Math.sin(ax), cy=Math.cos(ay), sy=Math.sin(ay), cz=Math.cos(az), sz=Math.sin(az);
  const scale=leaf.scale*(1+Math.max(0,leaf.z-leaf.base)/1400);
  return {a:cy*cz*scale,b:(sx*sy*cz+cx*sz)*scale,c:-cy*sz*scale,d:(cx*cz-sx*sy*sz)*scale};
}
/** Project the complete blade, stem and cast without a shared perspective. */
export function leafProjectedBounds(leaf: LeafBody, bounds: LeafBounds) {
  const {a,b,c,d}=leafProjection(leaf);
  const halfWidth=bounds.leafWidth/2, halfHeight=halfWidth/1.6;
  let left=Infinity, right=-Infinity, top=Infinity, bottom=-Infinity;
  for (const dx of [-halfWidth,halfWidth]) for (const dy of [-halfHeight,halfHeight]) {
    const px=leaf.x+dx*a+dy*c, py=leaf.y+dx*b+dy*d;
    left=Math.min(left,px); right=Math.max(right,px); top=Math.min(top,py); bottom=Math.max(bottom,py);
  }
  const shadow=26+Math.max(0,leaf.z-leaf.base)*.13;
  return { left:left-shadow, right:right+shadow, top:top-shadow, bottom:bottom+shadow };
}
function containLeaf(leaf: LeafBody, bounds: LeafBounds) {
  for (let pass=0; pass<3; pass++) {
    const box=leafProjectedBounds(leaf,bounds);
    const dx=box.left<0 ? -box.left : box.right>bounds.width ? bounds.width-box.right : 0;
    const dy=box.top<0 ? -box.top : box.bottom>bounds.height ? bounds.height-box.bottom : 0;
    if (!dx && !dy) break;
    leaf.x+=dx; leaf.y+=dy;
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
    const turn=Math.min(140,speed/Math.max(140,bounds.leafWidth)*70)*grip;
    leaf.wx=(dy/distance*.85+Math.sin(leaf.phase)*.45)*turn;
    leaf.wy=(-dx/distance*.9+Math.cos(leaf.phase)*.3)*turn;
    leaf.wz=clamp(leaf.wz+(ox*dy-oy*dx)/Math.max(60,bounds.leafWidth)*grip*3+Math.sin(leaf.phase+dx/distance)*turn*.18,-100,100);
    leaf.order=++order; containLeaf(leaf,bounds);
  }
  return touched;
}
/** A grabbed blade follows its contact point, without imparting a brush impulse
 * to its neighbours. Releasing it lets only its lift and banking settle. */
export function moveLeaf(leaf: LeafBody, target: LeafPoint, travel: LeafPoint, elapsed: number, bounds: LeafBounds) {
  if (![target.x,target.y,travel.x,travel.y,elapsed].every(Number.isFinite)) return;
  const dt=clamp(elapsed,1/120,.08), bank=20;
  leaf.x=target.x; leaf.y=target.y;
  leaf.z=leaf.base+Math.min(24,bounds.leafWidth*.09);
  leaf.rx+=(clamp(-travel.y/dt*.035,-bank,bank)-leaf.rx)*.45;
  leaf.ry+=(clamp(travel.x/dt*.035,-bank,bank)-leaf.ry)*.45;
  leaf.vx=leaf.vy=leaf.vz=leaf.wx=leaf.wy=leaf.wz=0;
  containLeaf(leaf,bounds);
}
/** Store the contact in the leaf's own coordinates, including its current bank. */
export function leafGrabPoint(leaf: LeafBody, point: LeafPoint): LeafPoint {
  const {a,b,c,d}=leafProjection(leaf), determinant=a*d-b*c;
  const x=point.x-leaf.x,y=point.y-leaf.y;
  return {x:(d*x-c*y)/determinant,y:(a*y-b*x)/determinant};
}
/** Gravity acts around the actual grip; movement supplies torque and momentum.
 * Reproject the same grip after rotation so it remains beneath the finger. */
export function dragLeaf(leaf: LeafBody, contact: LeafPoint, grip: LeafPoint, travel: LeafPoint, elapsed: number, bounds: LeafBounds) {
  if(![contact.x,contact.y,grip.x,grip.y,travel.x,travel.y,elapsed].every(Number.isFinite)) return;
  const dt=clamp(elapsed,1/120,1/30),{a,b,c,d}=leafProjection(leaf);
  const gx=grip.x*a+grip.y*c,gy=grip.x*b+grip.y*d;
  const vx=clamp(travel.x/dt,-700,700),vy=clamp(travel.y/dt,-700,700);
  const inertia=Math.max(160,(bounds.leafWidth*leaf.scale)**2*.09);
  const gravity=-gx*480/inertia/radians;
  const impulse=-(gx*(vy-leaf.vy)-gy*(vx-leaf.vx))/inertia/radians*.35;
  leaf.wz=clamp(leaf.wz+clamp(gravity,-340,340)*dt+clamp(impulse,-85,85),-220,220)*Math.exp(-5*dt);
  leaf.rz+=leaf.wz*dt;
  leaf.vx+=(vx-leaf.vx)*.42;leaf.vy+=(vy-leaf.vy)*.42;
  leaf.vz=leaf.wx=leaf.wy=0;
  leaf.z=leaf.base+Math.min(32,bounds.leafWidth*.12);
  const easing=1-Math.exp(-12*dt);
  leaf.rx+=(clamp(-vy*.025,-20,20)-leaf.rx)*easing;
  leaf.ry+=(clamp(vx*.025,-20,20)-leaf.ry)*easing;
  const projected=leafProjection(leaf);
  leaf.x=contact.x-(grip.x*projected.a+grip.y*projected.c);
  leaf.y=contact.y-(grip.x*projected.b+grip.y*projected.d);
  containLeaf(leaf,bounds);
}
export function stepLeaves(leaves: LeafBody[], elapsed: number, bounds: LeafBounds, held?: LeafBody) {
  const dt=clamp(elapsed,0,1/30);
  let moving=false;
  for (const leaf of leaves) {
    if (leaf===held) continue;
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
      // A flexible blade banks into the air, then rights itself. Never flip it
      // edge-on or through a neighbour's paint layer.
      leaf.wx=(leaf.wx+(-leaf.rx*16+Math.sin(leaf.phase*10)*22)*dt)*Math.exp(-3*dt);
      leaf.wy=(leaf.wy+(-leaf.ry*16+Math.cos(leaf.phase*8)*18)*dt)*Math.exp(-3*dt);
      leaf.rx+=leaf.wx*dt; leaf.ry+=leaf.wy*dt;
    }
    let lean=0;
    if (leaf.z<=leaf.base || !airborne) {
      leaf.z=leaf.base; leaf.vz=0;
      leaf.wx=(leaf.wx-leaf.rx*110*dt)*Math.exp(-18*dt);
      leaf.wy=(leaf.wy-leaf.ry*110*dt)*Math.exp(-18*dt);
      leaf.rx+=leaf.wx*dt; leaf.ry+=leaf.wy*dt;
      if (Math.abs(leaf.rx)<.08 && Math.abs(leaf.wx)<.1) { leaf.rx=0; leaf.wx=0; }
      if (Math.abs(leaf.ry)<.08 && Math.abs(leaf.wy)<.1) { leaf.ry=0; leaf.wy=0; }
      lean=Math.abs(leaf.rx)+Math.abs(leaf.ry);
    }
    if (Math.abs(leaf.rx)>leafBankLimit) { leaf.rx=clamp(leaf.rx,-leafBankLimit,leafBankLimit); leaf.wx*=.1; }
    if (Math.abs(leaf.ry)>leafBankLimit) { leaf.ry=clamp(leaf.ry,-leafBankLimit,leafBankLimit); leaf.wy*=.1; }
    const drag=Math.exp(-(leaf.z>leaf.base ? 1.7 : 7)*dt);
    leaf.vx*=drag; leaf.vy*=drag; leaf.wz*=drag; leaf.rz+=leaf.wz*dt;
    containLeaf(leaf,bounds);
    const energy=Math.abs(leaf.vx)+Math.abs(leaf.vy)+Math.abs(leaf.wx)+Math.abs(leaf.wy)+Math.abs(leaf.wz)+lean;
    moving ||= leaf.z>leaf.base+.1 || energy>.2;
    if (energy<=.2 && leaf.z===leaf.base) leaf.vx=leaf.vy=leaf.wz=0;
  }
  return moving;
}
