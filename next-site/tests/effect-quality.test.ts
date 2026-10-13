import test from "node:test";
import assert from "node:assert/strict";
import { AdaptiveEffectQuality } from "../lib/bebrave/effect-quality";

test("scrolling reduces effect work and idle restores detail without resizing each gesture",()=>{
  const adaptive=new AdaptiveEffectQuality(8,8);
  assert.equal(adaptive.detail(0).quality,"high");
  adaptive.interact(20);
  const active=adaptive.detail(100);
  assert.equal(active.quality,"medium");assert.equal(active.pixelBudget,900_000);
  assert.ok(active.particles<adaptive.detail(1000).particles);
  assert.equal(adaptive.detail(1000).quality,"high");
});

test("sustained CPU or frame-delivery pressure backs off; healthy idle recovers gradually",()=>{
  const adaptive=new AdaptiveEffectQuality(8,8);
  for(let frame=0;frame<16;frame++){adaptive.frame(40);adaptive.painted(24,frame*40);}
  assert.equal(adaptive.detail(700).quality,"low");
  assert.equal(adaptive.detail(700).pixelBudget,450_000);
  for(let frame=0;frame<240;frame++){adaptive.frame(16.7);adaptive.painted(2,800+frame*33);}
  assert.equal(adaptive.detail(9000).quality,"high");
});

test("conservative device start, hidden gaps and the minimum retain magical identities",()=>{
  assert.equal(new AdaptiveEffectQuality(2,2).detail(0).quality,"low");
  const adaptive=new AdaptiveEffectQuality(8,8);adaptive.frame(5000);
  for(let frame=0;frame<30;frame++)adaptive.painted(2,frame*33);
  assert.equal(adaptive.detail(1000).quality,"high");
  const low=new AdaptiveEffectQuality(2,2).detail(0);
  assert.ok(low.particles>0);assert.equal(low.ribbons,false);assert.ok(low.pixelBudget>0);
});
