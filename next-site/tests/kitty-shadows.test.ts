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

for (const escaped of [false,true]) test(`random shadow routes remain inside the ${escaped ? "escaped" : "original"} photograph's window`, () => {
  let seed=7421;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const window=kittyWindows[escaped?"escaped":"original"], directions=new Set<boolean>();
  assert.ok(within(window.rest,window.clip),"stationary keyboard/reduced-effects shadow stays in the window");
  for(let i=0;i<2000;i++) {
    const flight=shadowFlight(escaped,random); directions.add(flight.reverse);
    for(let step=0;step<=10;step++) {
      const t=step/10, point=flight.from.map((value,k)=>value*(1-t)+flight.to[k]*t);
      assert.ok(within(point,window.clip),"a randomly sloped route must not cross the window frame");
    }
    assert.ok(flight.duration>=5800&&flight.duration<=8800);
    assert.ok(flight.delay>=5200&&flight.delay<=11800);
    assert.ok(flight.size>=22&&flight.size<=34);
  }
  assert.equal(directions.size,2);
});
