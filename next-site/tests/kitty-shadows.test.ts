import test from "node:test";
import assert from "node:assert/strict";
import { kittyWindows, shadowFlight } from "../lib/kitty-shadows";

function within(point: number[], polygon: number[][]) {
  let inside = false;
  for (let i=0,j=polygon.length-1; i<polygon.length; j=i++) {
    const a=polygon[i], b=polygon[j];
    if ((a[1]>point[1]) !== (b[1]>point[1]) && point[0] < (b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0]) inside=!inside;
  }
  return inside;
}

test("random shadows cross the entire original window in both directions", () => {
  let seed=7421;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const window=kittyWindows.original, directions=new Set<boolean>();
  assert.ok(within(window.rest,window.clip),"stationary keyboard/reduced-effects shadow stays in the window");
  for(let i=0;i<2000;i++) {
    const flight=shadowFlight(random); directions.add(flight.reverse);
    assert.ok(!within(flight.from,window.clip),"flight starts outside the window");
    assert.ok(!within(flight.to,window.clip),"flight ends outside the opposite side");
    const middle=flight.from.map((value,k)=>(value+flight.to[k])/2);
    assert.ok(within(middle,window.clip),"each crossing passes through the window");
    assert.ok(Math.abs(flight.from[0]-flight.to[0])>.7,"cross the whole window, not hover in its center");
    assert.ok(flight.duration>=5800&&flight.duration<=8800);
    assert.ok(flight.delay>=5200&&flight.delay<=11800);
    assert.ok(flight.size>=22&&flight.size<=34);
  }
  assert.equal(directions.size,2);
});
