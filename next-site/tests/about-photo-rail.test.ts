import test from "node:test";
import assert from "node:assert/strict";
import { photoRailPositions } from "../lib/about-photo-rail";

test("incoming photos follow their paragraph and push different-height photos at the same scroll speed",()=>{
  const heights=[380,285,568];
  const before=photoRailPositions([-100,400,1500],heights,100,24,800);
  const after=photoRailPositions([-150,350,1450],heights,100,24,800);
  assert.equal(before[1],400);
  assert.equal(after[1],350);
  assert.equal(before[0],-100);
  assert.equal(after[0],-150);
  assert.ok(before[1]-before[0]>=heights[0]+24);
});
test("a photo stays below the header until its successor pushes it out",()=>{
  assert.deepEqual(photoRailPositions([-100,900],[380,285],100,24,800),[100,900]);
  assert.deepEqual(photoRailPositions([-300,700],[380,285],100,24,800),[0,700]);
  assert.deepEqual(photoRailPositions([-350,650],[380,285],100,24,800),[-50,650]);
});
