import test from "node:test";
import assert from "node:assert/strict";
import { lightIntensity, materialLight } from "../lib/material-light";
import { createRibbon, ribbonPaths, stepRibbon } from "../lib/ribbon-physics";

const button = { left: 100, top: 100, width: 160, height: 50 };
test("a single virtual source casts to the opposite side in all eight directions", () => {
  for (const [dx, dy] of [[-100, 0], [100, 0], [0, -100], [0, 100], [-100, -100], [-100, 100], [100, -100], [100, 100]]) {
    const light = materialLight(button, 180 + dx, 125 + dy, 1);
    if (dx) assert.equal(Math.sign(light.shadowX), -Math.sign(dx));
    if (dy) assert.equal(Math.sign(light.shadowY), -Math.sign(dy));
    assert.ok(Math.abs(light.shadowX) <= 15 && Math.abs(light.shadowY) <= 15);
    assert.equal(light.lightX, 80 + dx);
    assert.equal(light.lightY, 25 + dy);
  }
});
test("the same point lights each surface according to its own position, then rests", () => {
  const left = materialLight({ ...button, left: 0 }, 180, 125, 1);
  const right = materialLight({ ...button, left: 200 }, 180, 125, 1);
  assert.ok(left.shadowX < 0 && right.shadowX > 0);
  const rested = materialLight(button, 999, 999, 0);
  assert.equal(rested.shadowX, 0); assert.equal(rested.shadowY, 5);
  assert.equal(rested.rimX, 0); assert.equal(rested.rimY, 1);
  assert.equal(lightIntensity(240, false), 1);
  assert.ok(lightIntensity(240, true) < 1);
  assert.equal(lightIntensity(1400, false), 0);
});
test("a grabbed ribbon bends instead of translating rigidly and settles after release", () => {
  const nodes = createRibbon();
  const initial = ribbonPaths(nodes).body;
  for (let i = 0; i < 100; i++) stepRibbon(nodes, { index: 4, x: 60, y: -70 }, 16.67);
  assert.ok(nodes[4].restY - nodes[4].y > nodes[0].restY - nodes[0].y + 20);
  assert.notEqual(ribbonPaths(nodes).body, initial);
  for (let i = 0; i < 350; i++) stepRibbon(nodes, null, 16.67);
  for (const node of nodes) assert.ok(Math.hypot(node.x - node.restX, node.y - node.restY) < .05);
});
test("reduced effects keeps placement usable without spring oscillation", () => {
  const nodes = createRibbon();
  assert.equal(stepRibbon(nodes, { index: 4, x: 30, y: 20 }, 10000, true), false);
  assert.equal(nodes[4].x, nodes[4].restX + 30);
  assert.equal(nodes[4].y, nodes[4].restY + 20);
  assert.equal(stepRibbon(nodes, null, 16.67, true), false);
  for (const node of nodes) assert.equal(node.x, node.restX);
});
