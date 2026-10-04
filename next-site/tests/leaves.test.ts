import test from "node:test";
import assert from "node:assert/strict";
import { makeLeafPile, moveLeaf, dragLeaf, leafGrabPoint, pushLeaves, stepLeaves, leafProjectedBounds, leafProjection, leafBankLimit, type LeafBounds, type LeafBody } from "../lib/leaf-physics";
import { leafLettering,leafTextArea,leafTextWidth } from "../lib/leaf-lettering";
import entries from "../content/folly.json";
import shapes from "../content/leaf-shapes.json";

function inside(leaves: LeafBody[], bounds: LeafBounds) {
  for (const leaf of leaves) {
    const box=leafProjectedBounds(leaf,bounds);
    assert.ok(Object.values(leaf).every(Number.isFinite));
    assert.ok(Math.abs(leaf.rx)<=leafBankLimit && Math.abs(leaf.ry)<=leafBankLimit,"banking must never flip a blade edge-on");
    const {a,b,c,d}=leafProjection(leaf);
    assert.ok(a*d-b*c>=leaf.scale*leaf.scale*.8,"the projected reading surface must remain front-facing and substantial");
    assert.ok(box.left>=-.02 && box.right<=bounds.width+.02,`horizontal cast escaped: ${JSON.stringify(box)}`);
    assert.ok(box.top>=-.02 && box.bottom<=bounds.height+.02,`vertical cast escaped: ${JSON.stringify(box)}`);
  }
}
test("a brush lifts nearby leaves in its travel direction without disturbing distant leaves",()=>{
  const bounds={width:1000,height:720,leafWidth:300},leaves=makeLeafPile(2,bounds);
  leaves[0].x=400; leaves[0].y=350; leaves[1].x=800; leaves[1].y=350;
  assert.equal(pushLeaves(leaves,{x:400,y:350},{x:425,y:350},.03,bounds),true);
  assert.ok(leaves[0].x>400 && leaves[0].vx>0 && leaves[0].vz>100 && leaves[0].wy!==0);
  assert.equal(leaves[1].x,800); assert.equal(leaves[1].vx,0);
});
test("a tap without travel leaves every blade undisturbed",()=>{
  const bounds={width:375,height:480,leafWidth:165},leaves=makeLeafPile(7,bounds),before=structuredClone(leaves);
  assert.equal(pushLeaves(leaves,{x:180,y:240},{x:180,y:240},.1,bounds),false);
  assert.deepEqual(leaves,before);
});
test("grabbing a leaf follows the contact point and leaves every neighbour alone",()=>{
  for (const bounds of [{width:1000,height:720,leafWidth:300},{width:337,height:480,leafWidth:148}]) {
    const leaves=makeLeafPile(19,bounds,7),before=structuredClone(leaves),leaf=leaves[6];
    const target={x:bounds.width*.68,y:bounds.height*.7};
    moveLeaf(leaf,target,{x:28,y:12},.07,bounds);
    assert.equal(leaf.x,target.x); assert.equal(leaf.y,target.y);
    assert.ok(leaf.z>leaf.base && Math.abs(leaf.rx)+Math.abs(leaf.ry)>0);
    assert.deepEqual(leaves.slice(0,6),before.slice(0,6));
    assert.deepEqual(leaves.slice(7),before.slice(7));
    const held=structuredClone(leaf);
    for(let i=0;i<120;i++) stepLeaves(leaves,1/60,bounds,leaf);
    assert.deepEqual(leaf,held,"a held blade must not drift away from the finger");
    for(let i=0;i<300;i++) stepLeaves(leaves,1/60,bounds);
    assert.equal(leaf.x,target.x); assert.equal(leaf.y,target.y);
    assert.equal(leaf.z,leaf.base);
    assert.equal(leaf.rx,0); assert.equal(leaf.ry,0);
    inside(leaves,bounds);
  }
});
test("individual arrangement keeps the full blade and cast within a phone frame",()=>{
  const bounds={width:337,height:480,leafWidth:148},leaf=makeLeafPile(1,bounds)[0];
  for(const target of [{x:-1000,y:-1000},{x:10000,y:10000},{x:-1000,y:10000},{x:10000,y:-1000}]) {
    moveLeaf(leaf,target,{x:300,y:-300},.001,bounds); inside([leaf],bounds);
    for(let i=0;i<300;i++) {stepLeaves([leaf],1/60,bounds);inside([leaf],bounds);}
  }
  const before=structuredClone(leaf);
  moveLeaf(leaf,{x:NaN,y:10},{x:0,y:0},.01,bounds);
  assert.deepEqual(leaf,before);
});
test("a short phone stroke creates visible lift and gentle banking",()=>{
  const bounds={width:337,height:480,leafWidth:148},mouse=makeLeafPile(1,bounds),touch=structuredClone(mouse);
  const start={x:touch[0].x,y:touch[0].y},end={x:start.x+28,y:start.y+12};
  pushLeaves(mouse,start,end,.07,bounds); pushLeaves(touch,start,end,.07,bounds,true);
  assert.ok(touch[0].vx>mouse[0].vx && touch[0].vz>=mouse[0].vz);
  let lift=0,tilt=0,spin=0;
  const rz=touch[0].rz;
  for(let i=0;i<50;i++) {
    stepLeaves(touch,1/60,bounds);inside(touch,bounds);
    lift=Math.max(lift,touch[0].z-touch[0].base);
    tilt=Math.max(tilt,Math.hypot(touch[0].rx,touch[0].ry));
    spin=Math.max(spin,Math.abs(touch[0].rz-rz));
  }
  assert.ok(lift>30,`lift ${lift}`); assert.ok(tilt>8,`tilt ${tilt}`); assert.ok(spin>1,`spin ${spin}`);
});
test("flight preserves whole-leaf paint order and projects identically anywhere in the frame",()=>{
  const bounds={width:1000,height:720,leafWidth:300},leaves=makeLeafPile(7,bounds);
  const leaf=leaves[0];
  pushLeaves(leaves,{x:leaf.x,y:leaf.y},{x:leaf.x+70,y:leaf.y-30},.03,bounds);
  const orders=leaves.map(item=>item.order);
  for(let i=0;i<180;i++) {
    stepLeaves(leaves,1/60,bounds);inside(leaves,bounds);
    assert.deepEqual(leaves.map(item=>item.order),orders,"changing altitude must not reorder neighbours");
    const here=leafProjectedBounds(leaf,bounds),elsewhere=leafProjectedBounds({...leaf,x:leaf.x+90,y:leaf.y-40},bounds);
    assert.ok(Math.abs((elsewhere.left-here.left)-90)<.001);
    assert.ok(Math.abs((elsewhere.bottom-here.bottom)+40)<.001);
  }
});
test("repeated fast strokes keep all rotated silhouettes and shadows inside a phone frame",()=>{
  const bounds={width:337,height:480,leafWidth:148},leaves=makeLeafPile(30,bounds,7);
  inside(leaves,bounds);
  for(let j=0;j<12;j++) {
    pushLeaves(leaves,{x:j%2?337:0,y:240},{x:j%2?0:337,y:j%3?0:480},.016,bounds,true);
    for(let i=0;i<50;i++){stepLeaves(leaves,1/60,bounds);inside(leaves,bounds);}
  }
  let moving=true;
  for(let i=0;i<900&&moving;i++)moving=stepLeaves(leaves,1/60,bounds);
  assert.equal(moving,false);
  for(const leaf of leaves) {
    assert.equal(leaf.z,leaf.base);
    // Both local axes land flat, with the lettered front facing the visitor.
    assert.ok(Math.abs(Math.sin(leaf.rx*Math.PI/180))<.002);
    assert.ok(Math.abs(Math.sin(leaf.ry*Math.PI/180))<.002);
    assert.ok(Math.cos(leaf.rx*Math.PI/180)*Math.cos(leaf.ry*Math.PI/180)>.99);
  }
});
test("a hidden-tab resume or extreme pointer jump cannot explode the simulation",()=>{
  const bounds={width:1000,height:720,leafWidth:300},leaves=makeLeafPile(7,bounds);
  pushLeaves(leaves,{x:0,y:0},{x:1000000,y:1000000},.00001,bounds);
  stepLeaves(leaves,600,bounds);inside(leaves,bounds);
});
test("every quote fits a tapered reading field without losing any words",()=>{
  for(const {text} of [...entries,{text:"A longer future reminder with unexpected details can still fit inside the leaf without escaping its edges"}]) {
    for(const shape of shapes) {
    const {size,lines,lineHeight,capacities}=leafLettering(text,shape);
    assert.equal(lines.join(" "),text);
    assert.ok(lines.length*lineHeight<=leafTextArea.height+.001);
    lines.forEach((line,index)=>assert.ok(leafTextWidth(line,size)<=capacities[index]+.001));
    }
  }
  const newest=leafLettering(entries.at(-1)!.text).lines;
  assert.deepEqual(newest,["Build the","system, enter the","environment, and let","the words flow"]);
});
test("opposite edge grips swing in opposite directions while tracking the contact",()=>{
  const bounds={width:1000,height:720,leafWidth:300};
  for(const side of [-1,1]) {
    const leaf=makeLeafPile(1,bounds)[0];leaf.x=500;leaf.y=360;leaf.rx=leaf.ry=leaf.rz=0;
    const contact={x:500+side*85,y:360},grip=leafGrabPoint(leaf,contact);
    for(let i=0;i<60;i++) dragLeaf(leaf,contact,grip,{x:0,y:0},1/60,bounds);
    assert.equal(Math.sign(leaf.rz),-side);assert.ok(Math.abs(leaf.rz)>20);
    const {a,b,c,d}=leafProjection(leaf);
    assert.ok(Math.abs(leaf.x+grip.x*a+grip.y*c-contact.x)<.001);
    assert.ok(Math.abs(leaf.y+grip.x*b+grip.y*d-contact.y)<.001);
    inside([leaf],bounds);
  }
});
test("a dragged leaf carries release momentum, settles, and stays inside a phone",()=>{
  const bounds={width:337,height:480,leafWidth:148},leaf=makeLeafPile(1,bounds)[0];
  const contact={x:leaf.x+35,y:leaf.y},grip=leafGrabPoint(leaf,contact);
  dragLeaf(leaf,{x:contact.x+22,y:contact.y+12},grip,{x:22,y:12},.03,bounds);
  const released=structuredClone(leaf);assert.ok(leaf.vx>0 && leaf.vy>0 && leaf.wz!==0);
  stepLeaves([leaf],1/60,bounds);
  assert.notEqual(leaf.x,released.x);assert.notEqual(leaf.rz,released.rz);
  let moving=true;
  for(let i=0;i<900&&moving;i++){moving=stepLeaves([leaf],1/60,bounds);inside([leaf],bounds);}
  assert.equal(moving,false);assert.equal(leaf.z,leaf.base);
});
