import test from "node:test";
import assert from "node:assert/strict";
import { makeLeafPile, pushLeaves, stepLeaves, leafProjectedBounds, leafProjection, leafBankLimit, type LeafBounds, type LeafBody } from "../lib/leaf-physics";
import { leafLettering,leafTextArea,leafTextWidth } from "../lib/leaf-lettering";
import entries from "../content/folly.json";

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
test("every full quote fits its two reading bands with the central vein clear",()=>{
  for(const {text} of [...entries,{text:"A longer future reminder with unexpected details can still fit inside the leaf without escaping its edges"}]) {
    const {size,lines,lineHeight}=leafLettering(text);
    assert.equal(lines.flat().join(" "),text);
    for(const band of lines) {
      assert.ok(band.length*lineHeight<=leafTextArea.height+.001);
      for(const line of band) assert.ok(leafTextWidth(line,size)<=leafTextArea.width+.001);
    }
  }
});
