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

test("random shadows cross the entire original window only from right to left", () => {
  let seed=7421;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const window=kittyWindows.original, heights=new Set<number>();
  assert.ok(within(window.rest,window.clip),"stationary keyboard/reduced-effects shadow stays in the window");
  for(let i=0;i<2000;i++) {
    const flight=shadowFlight(random); heights.add(flight.from[1]);
    assert.ok(flight.from[0] > flight.to[0], "every crossing moves left");
    assert.equal(flight.from[1], flight.to[1], "height stays consistent while the supplied wings animate");
    assert.ok(!within(flight.from,window.clip),"flight starts outside the window");
    assert.ok(!within(flight.to,window.clip),"flight ends outside the opposite side");
    const middle=flight.from.map((value,k)=>(value+flight.to[k])/2);
    assert.ok(within(middle,window.clip),"each crossing passes through the window");
    assert.ok(Math.abs(flight.from[0]-flight.to[0])>.7,"cross the whole window, not hover in its center");
    assert.ok(flight.duration>=5800&&flight.duration<=8800);
    assert.ok(flight.delay>=900&&flight.delay<=2800);
    assert.ok(flight.size>=21&&flight.size<=35);
  }
  assert.equal(heights.size,2000);
});

test("smaller shadows are slower and sizes stay within ±25%",()=>{
  let seed=9712;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const flights=Array.from({length:1000},()=>shadowFlight(random)).sort((a,b)=>a.size-b.size);
  for(let i=1;i<flights.length;i++){
    assert.ok(flights[i].duration <= flights[i-1].duration);
    assert.ok(flights[i].size >= 28*.75 && flights[i].size <= 28*1.25);
  }
  const smallest=shadowFlight(()=>0),largest=shadowFlight(()=>1);
  assert.equal(smallest.size,21); assert.equal(largest.size,35);
  assert.ok(smallest.duration>largest.duration);
});
