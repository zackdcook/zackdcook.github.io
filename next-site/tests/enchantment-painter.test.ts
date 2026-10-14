import test from "node:test";
import assert from "node:assert/strict";
import { EnchantmentPainter,carvingParticleSymbol,enchantmentAnchors,enchantmentParticleAt,enchantmentSurface,sampleEnchantmentStroke,particleSizeMultiplier } from "../lib/bebrave/enchantment-painter";
import { createEnchantmentLoop } from "../lib/bebrave/enchantment-loop";
import { packDrawing,unpackDrawing } from "../lib/bebrave/completed-strokes";
import { PARTICLE_SYMBOLS,SYMBOL_PATHS } from "../lib/bebrave/symbol-paths";
import type { BeBravePublicDrawing } from "../lib/bebrave-types";
import { AdaptiveEffectQuality } from "../lib/bebrave/effect-quality";

const drawing:BeBravePublicDrawing={id:"saved",publicSequence:4,rarity:"epic",color:"#00F5FF",effectSeed:9134,
  strokes:[{strokeId:"one",strokeOrder:0,points:[[80,1000],[300,1140],[560,1000]]},{strokeId:"two",strokeOrder:1,points:[[110,1120],[540,1080]]}]};
const camera={top:900,height:844/.36,scale:.36,pixelRatio:3};

class TestPath {
  points:number[][]=[];
  moveTo(x:number,y:number){this.points.push([x,y]);}
  lineTo(x:number,y:number){this.points.push([x,y]);}
}
function surface() {
  const operations:unknown[][]=[];
  const context={canvas:{width:1,height:1,style:{} as Record<string,string>},strokeStyle:"",fillStyle:"",globalAlpha:1,lineWidth:1,shadowBlur:0,globalCompositeOperation:"",
    setTransform:(...args:number[])=>operations.push(["transform",...args]),clearRect:()=>operations.push(["clear"]),
    beginPath:()=>operations.push(["begin"]),moveTo:(...args:number[])=>operations.push(["move",...args]),lineTo:(...args:number[])=>operations.push(["line",...args]),
    stroke(path?:TestPath){operations.push(["stroke",this.strokeStyle,this.globalAlpha,this.lineWidth,path?.points.map(point=>[...point])]);},
    save:()=>{},restore:()=>{},scale:(...args:number[])=>operations.push(["scale",...args]),drawImage(){operations.push(["copy",this.globalAlpha]);},createLinearGradient:()=>({addColorStop:()=>{}}),translate:(...args:number[])=>operations.push(["translate",...args]),rotate:(...args:number[])=>operations.push(["rotate",...args]),
    bezierCurveTo:(...args:number[])=>operations.push(["curve",...args]),ellipse:(...args:number[])=>operations.push(["ellipse",...args]),arc:(...args:number[])=>operations.push(["arc",...args]),closePath:()=>{},fill(){operations.push(["fill",this.fillStyle,this.globalAlpha]);},
  };
  return {context:context as unknown as CanvasRenderingContext2D,operations,canvas:context.canvas};
}
const factory=()=>new TestPath() as unknown as Path2D;

test("Superior paints changing aura geometry with no particle drawing; ordinary tiers have no aura",()=>{
  const a=surface(),m=surface(),painter=new EnchantmentPainter(a.context,m.context,factory);
  const superior={...drawing,rarity:"superior" as const};
  const before=JSON.stringify(superior);
  let frame=painter.paint([superior],camera,14000,0);
  assert.equal(frame.auras,1);assert.equal(frame.particles,0);
  const first=JSON.stringify(a.operations);a.operations.length=0;
  frame=painter.paint([superior],camera,14000,1.3);
  assert.notEqual(JSON.stringify(a.operations),first,"radiance and edge ribbons visibly evolve");
  assert.equal(m.operations.some(operation=>operation[0]==="fill"),false);
  assert.equal(a.context.globalCompositeOperation,"source-over");
  assert.equal(JSON.stringify(superior),before);
  for(const rarity of ["common","uncommon"] as const)assert.deepEqual(painter.paint([{...drawing,rarity}],camera,14000,2).auras,0);
});

test("Epic emits moving colored particles, reconstructing the same emitters from archived geometry",()=>{
  const anchors=enchantmentAnchors(drawing),saved=unpackDrawing(packDrawing(drawing));
  assert.ok(anchors.length>2);
  assert.deepEqual(enchantmentAnchors(saved),anchors);
  const first=enchantmentParticleAt(drawing,anchors[0],0,.5),second=enchantmentParticleAt(drawing,anchors[0],0,1.1);
  assert.notDeepEqual([first.x,first.y],[second.x,second.y]);
  assert.equal(first.color,drawing.color);assert.notEqual(first.highlight,"#FFFFFF");
  assert.deepEqual(enchantmentParticleAt(saved,anchors[0],0,.5),first);
  const a=surface(),m=surface(),painter=new EnchantmentPainter(a.context,m.context,factory);
  const result=painter.paint([drawing],camera,14000,1.1);
  assert.ok(result.particles>0);assert.ok(m.operations.some(operation=>operation[0]==="fill"));
});

test("Legendary hearts, rainbow and blood keep their distinct moving identities",()=>{
  const anchor={x:360,y:1200,r:3.6,delay:.4};
  const heart=enchantmentParticleAt({...drawing,rarity:"legendary",effectId:"hearts-v1"},anchor,2,1);
  assert.equal(heart.kind,"heart");
  const blood=enchantmentParticleAt({...drawing,rarity:"legendary",effectId:"blood-v1"},anchor,2,1);
  assert.equal(blood.kind,"blood");assert.ok(Math.hypot(blood.x-anchor.x,blood.y-anchor.y)>0);assert.equal(blood.color,"#760B20");
  const rainbow={...drawing,rarity:"legendary" as const,effectId:"rainbow-v1"};
  assert.notEqual(enchantmentParticleAt(rainbow,anchor,2,1).color,enchantmentParticleAt(rainbow,anchor,2,3).color);
});

test("personal particles radiate into every quadrant and enlarged infusions stay deterministic",()=>{
  const anchor={x:360,y:1200,r:3.6,delay:.4},personal={...drawing,rarity:"legendary" as const,effectId:"blood-v1"};
  const quadrants=new Set<string>();
  for(let i=0;i<64;i++){
    const particle=enchantmentParticleAt(personal,anchor,i,1.7);
    quadrants.add(`${Math.sign(particle.x-anchor.x)},${Math.sign(particle.y-anchor.y)}`);
    assert.deepEqual(particle,enchantmentParticleAt(unpackDrawing(packDrawing(personal)),anchor,i,1.7));
  }
  assert.deepEqual([...quadrants].sort(),["-1,-1","-1,1","1,-1","1,1"]);
  const skull=enchantmentParticleAt({...drawing,particleSymbol:0x2620},anchor,2,1);
  const star=enchantmentParticleAt({...drawing,particleSymbol:0x2605},anchor,2,1);
  assert.equal(skull.radius,star.radius*1.33);
  assert.equal(particleSizeMultiplier(0x1fab6,"blood-v1"),1.33);
  assert.equal(particleSizeMultiplier(0x1f5e1,"blood-v1"),1.33);
  assert.equal(particleSizeMultiplier(0x2605),1);
});

test("appending live pointer samples updates the same painter without waiting for a React render",()=>{
  const a=surface(),m=surface(),painter=new EnchantmentPainter(a.context,m.context,factory);
  const live={...drawing,id:"local",strokes:[{strokeId:"active",strokeOrder:0,points:[[100,1100],[140,1150]] as [number,number][]}]};
  painter.paint([live],camera,14000,1);
  const first=a.operations.find(operation=>operation[0]==="stroke")?.[4] as number[][];
  live.strokes[0].points.push([480,1080]);a.operations.length=0;
  painter.paint([live],camera,14000,1.1);
  const updated=a.operations.find(operation=>operation[0]==="stroke")?.[4] as number[][];
  assert.equal(first.length,2);assert.equal(updated.length,3);
});

test("camera buffers, aura sampling and cached paths stay bounded across a very tall history",()=>{
  for(const scale of [.1,.36,.89,1.5]){
    const result=enchantmentSurface({...camera,top:14_390_000,height:844/scale,scale},14_400_000);
    assert.ok(result.width*result.pixelsHigh<904_000);
    assert.ok(result.pixelsHigh<5000);
    assert.ok(result.height<844/scale+841);
  }
  assert.ok(sampleEnchantmentStroke([[0,0],[0,1_000_000]]).length<=162);
  const a=surface(),m=surface(),painter=new EnchantmentPainter(a.context,m.context,factory);
  for(let i=0;i<200;i++)painter.paint([{...drawing,id:`scroll-${i}`}],camera,14_400_000,i/30);
  assert.ok(painter.cacheSize<=128);
});

test("shared loop wakes once, pauses when hidden or reduced, resumes, and completely tears down",()=>{
  let next=0,allowed=true,paints=0;
  const queue=new Map<number,(time:number)=>void>();
  const loop=createEnchantmentLoop({request:fn=>{const id=++next;queue.set(id,fn);return id;},cancel:id=>queue.delete(id),allowed:()=>allowed,paint:()=>{paints++;return true;}});
  const frame=(time:number)=>{const [id,callback]=[...queue][0];queue.delete(id);callback(time);};
  loop.wake();loop.wake();assert.equal(queue.size,1);
  frame(20);assert.equal(paints,1);assert.equal(queue.size,1);
  allowed=false;loop.pause();loop.wake();assert.equal(queue.size,0);
  allowed=true;loop.wake();frame(40);assert.equal(paints,2);
  loop.dispose();loop.wake();assert.equal(queue.size,0);
});

test("empty camera sleeps, then a new live stroke or camera movement restarts emission",()=>{
  let next=0,present=false,paints=0;
  const queue=new Map<number,(time:number)=>void>();
  const loop=createEnchantmentLoop({request:fn=>{queue.set(++next,fn);return next;},cancel:id=>queue.delete(id),allowed:()=>true,paint:()=>{paints++;return present;}});
  const frame=(time:number)=>{const [id,callback]=[...queue][0];queue.delete(id);callback(time);};
  loop.wake();frame(20);assert.equal(queue.size,0);
  present=true;loop.wake();frame(40);assert.equal(queue.size,1);assert.equal(paints,2);
  loop.dispose();
});


test("symbols are deterministic text outlines; the personal red effect always emits U+1F5E1",()=>{
  const seen=new Set<number>(),anchor={x:360,y:1200,r:3.6,delay:.4};
  for(let i=0;i<300;i++){
    const rolled={...drawing,effectSeed:i};
    const p=enchantmentParticleAt(rolled,anchor,i,i*.73);seen.add(p.symbol);
    assert.equal(enchantmentParticleAt(rolled,anchor,0,1000).symbol,p.symbol);
    assert.equal(enchantmentParticleAt(unpackDrawing(packDrawing(rolled)),anchor,3,28).symbol,p.symbol);
    assert.equal(carvingParticleSymbol(rolled),p.symbol);
    assert.ok(SYMBOL_PATHS[p.symbol]);assert.ok(PARTICLE_SYMBOLS.includes(p.symbol as typeof PARTICLE_SYMBOLS[number]));
    assert.equal(enchantmentParticleAt({...drawing,rarity:"legendary",effectId:"blood-v1"},anchor,i,i*.73).symbol,i%2===0?0x1f5e1:0x1fab6);
  }
  assert.equal(seen.size,PARTICLE_SYMBOLS.length);
});

test("camera buffers retain their dimensions throughout scrolling and release their backing stores",()=>{
  const first=enchantmentSurface(camera,14000);
  for(const top of [0,900,9000,13000]){const next=enchantmentSurface({...camera,top},14000);assert.equal(next.width,first.width);assert.equal(next.pixelsHigh,first.pixelsHigh);}
  const a=surface(),m=surface(),painter=new EnchantmentPainter(a.context,m.context,factory);
  painter.paint([drawing],camera,14000,1);painter.dispose();
  assert.equal(painter.cacheSize,0);assert.equal(a.canvas.width,1);assert.equal(m.canvas.height,1);
});

test("static glow and engraving are rasterized once; particle tails are filled curved ribbons",()=>{
  const a=surface(),m=surface(),base=surface(),ink=surface();let buffers=0;
  const painter=new EnchantmentPainter(a.context,m.context,factory,()=>buffers++===0?base.context:ink.context);
  const fixed={...camera,left:40,offsetTop:0,viewportWidth:390,viewportHeight:844};
  painter.paint([drawing],fixed,14000,1);const shaded=base.operations.length,engraved=ink.operations.length;
  painter.paint([drawing],fixed,14000,1.2);
  assert.equal(base.operations.length,shaded);assert.equal(ink.operations.length,engraved);
  assert.ok(a.operations.some(o=>o[0]==="copy"));
  assert.ok(m.operations.some(o=>o[0]==="curve"));
  assert.equal(m.operations.some(o=>o[0]==="ellipse"||o[0]==="arc"),false);
  assert.equal(a.canvas.style.position,"absolute");
});


test("standing pixels remain bounded and allocation dimensions are identical at every zoom",()=>{
  const base={...camera,left:80,offsetTop:12,viewportWidth:390,viewportHeight:844};
  const first=enchantmentSurface(base,14_400_000);
  for(const zoom of [.5,.8,1,1.2,1.5]){
    const scale=base.scale*zoom,next=enchantmentSurface({...base,scale,height:844/scale,top:13_900_000},14_400_000);
    assert.equal(next.width,first.width);assert.equal(next.pixelsHigh,first.pixelsHigh);
    assert.ok(next.width*next.pixelsHigh<904_000);
    assert.ok(Math.abs(next.cssTop-next.top*scale-base.offsetTop)<.001);
  }
});

test("cached carving and bark share document coordinates, with immediate compositor zoom",()=>{
  const a=surface(),m=surface(),painter=new EnchantmentPainter(a.context,m.context,factory);
  const base={...camera,left:80,offsetTop:12,viewportWidth:390,viewportHeight:844};
  painter.paint([drawing],base,14000,1);
  const top=a.canvas.style.top;
  painter.followCamera({...base,top:base.top+40});
  assert.equal(a.canvas.style.top,top,"native scrolling moves the layer without repaint or style repositioning");
  assert.equal(a.canvas.style.transform,"none");
  const zoomed={...base,scale:base.scale*1.5,left:21};
  painter.followCamera(zoomed);assert.ok(Math.abs(Number(a.canvas.style.transform.slice(7).split(",")[0])-1.5)<1e-12);
  assert.equal(a.canvas.style.transform,m.canvas.style.transform);
  painter.paint([drawing],zoomed,14000,1.1);assert.equal(a.canvas.style.transform,"none");
});

test("lowest quality still animates Superior radiance and Epic glyphs within a hard particle limit",()=>{
  const a=surface(),m=surface(),base=surface(),ink=surface();let buffers=0;
  const painter=new EnchantmentPainter(a.context,m.context,factory,()=>buffers++===0?base.context:ink.context);
  const portrait={...camera,left:40,viewportWidth:390,viewportHeight:844};
  const low=new AdaptiveEffectQuality(2,2).detail(0);
  const crowded=Array.from({length:50},(_,n)=>({...drawing,id:`epic-${n}`,effectSeed:n}));
  const frame=painter.paint(crowded,portrait,14000,1,low);
  assert.ok(frame.particles>0&&frame.particles<=low.particles);
  assert.ok(m.operations.some(o=>o[0]==="fill"));
  const superior={...drawing,rarity:"superior" as const};
  a.operations.length=0;painter.paint([superior],portrait,14000,1,low);const alpha=a.operations.find(o=>o[0]==="copy")?.[1];a.operations.length=0;
  const result=painter.paint([superior],portrait,14000,1.6,low);
  assert.notEqual(a.operations.find(o=>o[0]==="copy")?.[1],alpha);assert.equal(result.auras,1);assert.equal(result.particles,0);
});
