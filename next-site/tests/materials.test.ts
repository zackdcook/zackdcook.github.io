import test from "node:test";
import assert from "node:assert/strict";
import { approachLight, materialLight } from "../lib/material-light";
import { createRibbon, dropRibbon, ribbonPaths, ribbonSpacing, stepRibbon } from "../lib/ribbon-physics";
import { tiltLight } from "../lib/phone-tilt";
import { normalizePreferences } from "../lib/preferences";

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
});
test("light resumes and rests at the same speed without jumping on direction changes", () => {
  assert.equal(approachLight(0, 1, 550), .5);
  assert.equal(approachLight(1, 0, 550), .5);
  assert.equal(approachLight(.4, 1, 110), .5);
  assert.ok(Math.abs(approachLight(.4, 0, 110) - .3) < 1e-12);
  assert.equal(approachLight(0, 1, 0), 0);
  assert.equal(approachLight(.9, 1, 5000), 1);
  assert.equal(approachLight(.1, 0, 5000), 0);
});
test("the grip is the apex while free satin ends hang under gravity and expose their reverse", () => {
  const nodes = createRibbon();
  const initial = ribbonPaths(nodes).body;
  for (let i = 0; i < 240; i++) stepRibbon(nodes, { index: 12, x: 300, y: 180, phase: 1 }, 16.67);
  assert.equal(nodes[12].x, 300); assert.equal(nodes[12].y, 180);
  assert.ok(nodes[0].y > nodes[12].y + 180 && nodes[24].y > nodes[12].y + 180);
  assert.ok(ribbonPaths(nodes).back.length > 0);
  assert.notEqual(ribbonPaths(nodes).body, initial);
  for (let i = 1; i < nodes.length; i++) assert.ok(Math.hypot(nodes[i].x - nodes[i - 1].x, nodes[i].y - nodes[i - 1].y, nodes[i].z - nodes[i - 1].z) < ribbonSpacing * 1.05);
});
test("release lands on the page and stays near its drop, without returning to its starting place", () => {
  const nodes = createRibbon();
  for (let i = 0; i < 180; i++) stepRibbon(nodes, { index: 12, x: 300, y: 180, phase: 1 }, 16.67);
  dropRibbon(nodes);
  let moving = true;
  for (let i = 0; i < 600 && moving; i++) moving = stepRibbon(nodes, null, 16.67);
  assert.equal(moving, false);
  assert.ok(Math.hypot(nodes[12].x - 300, nodes[12].y - 180) < 20);
  assert.ok(nodes[12].y < 220);
  assert.ok(nodes.every(node => node.z < .2));
});
test("a quick upward drag drops near the hand rather than flinging the grip up the page", () => {
  const nodes = createRibbon();
  for (let i = 0; i < 30; i++) stepRibbon(nodes, { index: 12, x: 380, y: 444 - i * 9, phase: 1 }, 16.67);
  const released = { x: nodes[12].x, y: nodes[12].y };
  dropRibbon(nodes);
  let moving = true;
  for (let i = 0; i < 600 && moving; i++) moving = stepRibbon(nodes, null, 16.67);
  assert.equal(moving, false);
  assert.ok(Math.hypot(nodes[12].x - released.x, nodes[12].y - released.y) < 40);
});
test("fast movement carries momentum instead of teleporting the free ends", () => {
  const nodes = createRibbon();
  for (let i = 0; i < 180; i++) stepRibbon(nodes, { index: 12, x: 300, y: 180 }, 16.67);
  const before = { ...nodes[0] };
  stepRibbon(nodes, { index: 12, x: 430, y: 120 }, 16.67);
  assert.equal(nodes[12].x, 430);
  assert.ok(Math.abs(nodes[0].x - before.x) < 100);
  for (let i = 0; i < 50; i++) stepRibbon(nodes, { index: 12, x: 430, y: 120 }, 16.67);
  assert.ok(nodes.every(node => [node.x, node.y, node.z, node.twist].every(Number.isFinite)));
});
test("reduced effects keeps placement usable without spring oscillation", () => {
  const nodes = createRibbon();
  assert.equal(stepRibbon(nodes, { index: 12, x: 300, y: 220 }, 10000, true), false);
  assert.equal(nodes[12].x, 300); assert.equal(nodes[12].y, 220);
  const placed = nodes.map(node => ({ ...node }));
  assert.equal(stepRibbon(nodes, null, 16.67, true), false);
  assert.deepEqual(nodes, placed);
});
test("phone lighting centers on the comfortable pose and responds in every direction", () => {
  const neutral = { beta: 55, gamma: 0 };
  assert.deepEqual(tiltLight(neutral, neutral, 0, 400, 800), { x: 200, y: 400 });
  for (const [roll, pitch] of [[15, 0], [-15, 0], [0, 15], [0, -15], [15, 15], [-15, -15], [-15, 15], [15, -15]]) {
    const light = tiltLight({ beta: 55 + pitch, gamma: roll }, neutral, 0, 400, 800)!;
    if (roll) assert.equal(Math.sign(light.x - 200), Math.sign(roll));
    if (pitch) assert.equal(Math.sign(light.y - 400), -Math.sign(pitch));
  }
});
test("tilt handles landscape, angular wrap and malformed sensor readings", () => {
  const landscape = tiltLight({ beta: 20, gamma: 0 }, { beta: 0, gamma: 0 }, 90, 800, 400)!;
  assert.ok(landscape.x > 400); assert.ok(Math.abs(landscape.y - 200) < .0001);
  const wrap = tiltLight({ beta: -179, gamma: 0 }, { beta: 179, gamma: 0 }, 0, 400, 800)!;
  assert.ok(wrap.y < 400 && wrap.y > 350);
  assert.equal(tiltLight({ beta: NaN, gamma: 0 }, { beta: 0, gamma: 0 }, 0, 400, 800), null);
  assert.equal(tiltLight({ beta: 0, gamma: 0 }, { beta: 0, gamma: 0 }, 0, 0, 800), null);
});
test("legacy preferences enable available tilt while an explicit opt-out survives", () => {
  assert.equal(normalizePreferences({ theme: "dark" }).tiltLighting, true);
  assert.equal(normalizePreferences({ tiltLighting: false }).tiltLighting, false);
});
