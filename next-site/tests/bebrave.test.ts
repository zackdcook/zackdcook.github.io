import test from "node:test";
import assert from "node:assert/strict";
import { BEBRAVE_EPIC_PITY_PERCENT, epicChanceForPity, tierFromRoll } from "../lib/bebrave-config";

test("epic pity rises after misses and guarantees the ninth attempt", () => {
  assert.deepEqual(BEBRAVE_EPIC_PITY_PERCENT, [5,8,13,21,34,50,70,90,100]);
  for (let pity=1;pity<BEBRAVE_EPIC_PITY_PERCENT.length;pity++) assert.ok(epicChanceForPity(pity)>epicChanceForPity(pity-1));
  assert.equal(epicChanceForPity(-10),5); assert.equal(epicChanceForPity(999),100);
});

test("rarity thresholds use the 42/35/18/5 base distribution", () => {
  assert.equal(tierFromRoll(0),"common"); assert.equal(tierFromRoll(4199),"common"); assert.equal(tierFromRoll(4200),"uncommon"); assert.equal(tierFromRoll(7699),"uncommon"); assert.equal(tierFromRoll(7700),"superior"); assert.equal(tierFromRoll(9499),"superior"); assert.equal(tierFromRoll(9500),"epic"); assert.equal(tierFromRoll(9999),"epic");
});
