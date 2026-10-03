import test from "node:test";
import assert from "node:assert/strict";
import { makeLeafPile, blowLeaves, stepLeaves } from "../lib/leaf-physics";

test("a gust radiates in every direction and lifts leaves off the ground", () => {
  const bounds = { width: 1000, height: 760, leafWidth: 350 };
  const leaves = makeLeafPile(4, bounds);
  [[300,380],[700,380],[500,200],[500,560]].forEach(([x,y],i) => { leaves[i].x=x; leaves[i].y=y; });
  blowLeaves(leaves,500,380);
  assert.ok(leaves[0].vx < 0 && leaves[1].vx > 0 && leaves[2].vy < 0 && leaves[3].vy > 0);
  stepLeaves(leaves,1/60,bounds);
  assert.ok(leaves.every(leaf => leaf.z > 0 && leaf.rx !== 0 && leaf.ry !== 0 && leaf.rz !== 0));
});

test("repeated gusts settle without losing leaves off a narrow phone screen", () => {
  const bounds = { width: 375, height: 760, leafWidth: 240 };
  const leaves = makeLeafPile(30,bounds);
  for (let j=0;j<5;j++) {
    blowLeaves(leaves,j%2 ? 375 : 0,j%2 ? 760 : 0);
    for (let i=0;i<90;i++) stepLeaves(leaves,1/60,bounds);
  }
  let moving=true;
  for (let i=0;i<900&&moving;i++) moving=stepLeaves(leaves,1/60,bounds);
  assert.equal(moving,false);
  assert.ok(leaves.every(leaf => Object.values(leaf).every(Number.isFinite) && leaf.x >= 100 && leaf.x <= 275 && leaf.y >= 72 && leaf.y <= 688 && leaf.z===0 && leaf.rx===0 && leaf.ry===0));
});

test("a large resumed-frame interval cannot explode the simulation", () => {
  const bounds = { width: 1000, height: 760, leafWidth: 350 };
  const leaves = makeLeafPile(7,bounds); blowLeaves(leaves,500,380);
  stepLeaves(leaves,600,bounds);
  assert.ok(leaves.every(leaf => Object.values(leaf).every(Number.isFinite) && leaf.z < 30));
});
