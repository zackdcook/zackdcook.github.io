import test from "node:test";
import assert from "node:assert/strict";
import { additionalStrike, beginAdditionalStrikes, livingTimeline, normalizeTimeline } from "../lib/local-timeline";
import { fallenPoint, treeBounds, treeLandmark } from "../lib/tree-space";
const now="2026-10-02T20:08:00.000Z";
test("each 1d4 result takes exactly that many additional strikes and survives storage",()=>{
  for(let roll=1;roll<=4;roll++){
    let story=beginAdditionalStrikes({...livingTimeline,hacked:true},roll);
    assert.equal(beginAdditionalStrikes(story,4).roll,roll,"an unfinished roll cannot be rerolled");
    for(let hit=1;hit<=roll;hit++){
      story=normalizeTimeline(JSON.parse(JSON.stringify(story)));
      story=additionalStrike(story,183,now);
      assert.equal(story.kind,hit===roll?"felled":"living");
      assert.equal(story.remaining,roll-hit);
    }
    assert.equal(story.felledAtGuestNumber,183);
    assert.equal(story.felledAt,now);
    assert.deepEqual(additionalStrike(story,537,now),story,"future communal growth must not change a local snapshot");
  }
});
test("malformed local stories cannot invent unsafe geometry or a strike budget",()=>{
  assert.equal(normalizeTimeline({kind:"felled",felledAtGuestNumber:-1}).kind,"living");
  assert.equal(normalizeTimeline({kind:"felled",felledAtGuestNumber:Infinity}).kind,"living");
  assert.equal(normalizeTimeline({kind:"felled",felledAtGuestNumber:0}).kind,"felled","an empty tree is still a valid snapshot");
  assert.equal(normalizeTimeline({roll:4,remaining:999}).remaining,0);
  assert.equal(normalizeTimeline({carvingId:"<script>"}).carvingId,null);
  assert.throws(()=>beginAdditionalStrikes(livingTimeline,5));
  assert.throws(()=>additionalStrike(beginAdditionalStrikes(livingTimeline,1),-1,now));
});
test("falling rotates the existing world rigidly; neighbors and landmarks keep their distances",()=>{
  const height=treeBounds(183).height, a={x:200,y:1000}, b={x:360,y:1100};
  const af=fallenPoint(a.x,a.y,height),bf=fallenPoint(b.x,b.y,height);
  assert.equal(Math.hypot(af.x-bf.x,af.y-bf.y),Math.hypot(a.x-b.x,a.y-b.y));
  const landmark=treeLandmark(3);
  assert.deepEqual(treeLandmark(3),landmark);
  assert.deepEqual(fallenPoint(a.x,a.y,height),af,"the cutoff's height is stable after later approvals");
  assert.ok(treeBounds(537).height>height);
});
test("reset returns a fresh local story while retaining the communal coordinate model",()=>{
  const world=treeBounds(183),landmark=treeLandmark(8);
  const reset=normalizeTimeline(null);
  assert.deepEqual(reset,livingTimeline);
  assert.deepEqual(treeBounds(183),world);
  assert.deepEqual(treeLandmark(8),landmark);
});
