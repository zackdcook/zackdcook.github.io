import test from "node:test";
import assert from "node:assert/strict";
import { makeLeafPile, pushLeaves, stepLeaves, leafClearance, type LeafBounds, type LeafBody } from "../lib/leaf-physics";

function inside(leaves: LeafBody[], bounds: LeafBounds) {
  for (const leaf of leaves) {
    const radius = leafClearance(leaf,bounds);
    assert.ok(Object.values(leaf).every(Number.isFinite));
    assert.ok(leaf.x-radius >= -.001 && leaf.x+radius <= bounds.width+.001);
    assert.ok(leaf.y-radius >= -.001 && leaf.y+radius <= bounds.height+.001);
    assert.ok(Math.abs(leaf.rx)<=20 && Math.abs(leaf.ry)<=20 && leaf.z<=20);
  }
}
test("a stroke pushes nearby leaves in its travel direction without moving distant leaves", () => {
  const bounds = { width:1000,height:720,leafWidth:300 }, leaves = makeLeafPile(2,bounds);
  leaves[0].x=400; leaves[0].y=350; leaves[1].x=800; leaves[1].y=350;
  assert.equal(pushLeaves(leaves,{x:400,y:350},{x:425,y:350},.03,bounds),true);
  assert.ok(leaves[0].x>400 && leaves[0].vx>0 && leaves[0].z>0 && leaves[0].wy!==0);
  assert.equal(leaves[1].x,800); assert.equal(leaves[1].vx,0);
});
test("a tap without travel does not move the pile", () => {
  const bounds={width:375,height:480,leafWidth:195}, leaves=makeLeafPile(7,bounds), before=structuredClone(leaves);
  assert.equal(pushLeaves(leaves,{x:180,y:240},{x:180,y:240},.1,bounds),false);
  assert.deepEqual(leaves,before);
});
test("fast repeated phone drags keep every leaf and its cast within the frame", () => {
  const bounds={width:375,height:480,leafWidth:195},leaves=makeLeafPile(30,bounds);
  inside(leaves,bounds);
  for(let j=0;j<12;j++) {
    pushLeaves(leaves,{x:j%2?375:0,y:240},{x:j%2?0:375,y:j%3?0:480},.016,bounds);
    for(let i=0;i<50;i++){stepLeaves(leaves,1/60,bounds);inside(leaves,bounds);}
  }
  let moving=true;
  for(let i=0;i<900&&moving;i++)moving=stepLeaves(leaves,1/60,bounds);
  assert.equal(moving,false);
  assert.ok(leaves.every(leaf=>leaf.z===0&&leaf.rx===0&&leaf.ry===0));
});
test("resuming a hidden tab or an extreme pointer jump cannot explode the simulation", () => {
  const bounds={width:1000,height:720,leafWidth:300},leaves=makeLeafPile(7,bounds);
  pushLeaves(leaves,{x:0,y:0},{x:1000000,y:1000000},.00001,bounds);
  stepLeaves(leaves,600,bounds);inside(leaves,bounds);
});
