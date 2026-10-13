import test from "node:test";
import assert from "node:assert/strict";
import { TreeHistoryCache,initialHistoryWindow } from "../lib/bebrave/history-cache";
import { anchoredScroll,pinchAdmireZoom,smoothParallaxRise } from "../lib/bebrave/admire-zoom";
import { packDrawing } from "../lib/bebrave/completed-strokes";
import type { BeBravePublicDrawing } from "../lib/bebrave-types";
const drawing=(n:number):BeBravePublicDrawing=>({id:`drawing-${n}`,publicSequence:n,rarity:"epic",color:"#00F5FF",effectSeed:n,strokes:[{strokeId:`stroke-${n}`,strokeOrder:0,points:[[100,n*864+20],[500,n*864+100]]}]});

test("warmed history is immediately available; each page appears before the slowest page",async()=>{
  let next:(value:any)=>void=()=>{};let calls=0,updates=0;
  const cache=new TreeHistoryCache(async()=>++calls===1?{drawings:[packDrawing(drawing(22))],more:true,nextBefore:22}:new Promise(resolve=>{next=resolve;}));
  cache.setWindow(20,24);cache.subscribe(()=>updates++);
  const pending=cache.load(20,24);await new Promise(resolve=>setImmediate(resolve));
  assert.equal(cache.read(20,24).length,1);assert.equal(updates,1);
  next({drawings:[packDrawing(drawing(21))],more:false,nextBefore:null});await pending;
  assert.equal(cache.read(20,24).length,2);
  await cache.load(20,24);assert.equal(calls,2,"Admire reuses the entry preload");
});

test("rapid traversal bounds requests and late responses cannot refill abandoned history",async()=>{
  const replies:Array<()=>void>=[];const cache=new TreeHistoryCache(async first=>new Promise(resolve=>replies.push(()=>resolve({drawings:[drawing(first)],more:false,nextBefore:null}))));
  const promises:Promise<void>[]=[];
  for(let first=0;first<1000;first+=4){cache.setWindow(first,first+5);promises.push(cache.load(first,first+5));assert.ok(cache.pendingCount<=2);}
  replies.forEach(reply=>reply());await Promise.all(promises);
  assert.ok(cache.size<=2);assert.equal(cache.pendingCount,0);
  cache.dispose();assert.equal(cache.size,0);
});

test("pinch limits are relative to the default and preserve the point under the fingers",()=>{
  assert.equal(pinchAdmireZoom(1,100,5),.5);assert.equal(pinchAdmireZoom(1,100,400),1.5);
  const worldY=32000,screenY=420,scale=.45,top=0;
  assert.equal((anchoredScroll(top,worldY,scale,screenY)+screenY-top)/scale,worldY);
  const [first,last]=initialHistoryWindow(36000,844,.3);assert.ok((last-first)*864>844/.3);
});

test("parallax converges smoothly without overshoot or frame-rate dependent jumps",()=>{
  let rise=0;
  for(let n=0;n<60;n++){const next=smoothParallaxRise(rise,1000,16);assert.ok(next>=rise&&next<=1000);rise=next;}
  assert.ok(1000-rise<.01);
  assert.ok(smoothParallaxRise(0,1000,1000)<600,"a delayed frame does not snap scenery to the target");
});
