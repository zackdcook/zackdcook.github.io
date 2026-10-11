import test from "node:test";
import assert from "node:assert/strict";
import { createPublicMotes, publicMoteY } from "../lib/public-atmosphere";

test("foreground dust keeps a bounded population and survives very long pages and resize", () => {
  let seed=7291;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const motes=createPublicMotes(random);
  assert.equal(motes.length,14);
  assert.equal(new Set(motes.map(mote=>mote.depth)).size,14);
  for(const height of [568,844,1024])for(const scroll of [0,100,1000,100000,1e9])for(const mote of motes){
    const y=publicMoteY(mote.start,mote.depth,scroll,height);
    assert.ok(Number.isFinite(y)&&y>=-.2*height&&y<1.2*height);
  }
  // A nearby scroll advances the foreground at its own depth, independently
  // of page length. Recycling, if needed, occurs outside the visible viewport.
  const a=publicMoteY(.5,.4,0,800),b=publicMoteY(.5,.4,100,800);
  assert.equal(a-b,40);
});
