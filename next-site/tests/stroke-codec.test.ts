import test from "node:test";
import assert from "node:assert/strict";
import {encodePoints,decodePoints,simplifyPoints,type Point} from "../lib/bebrave/stroke-codec";

test("decimal strokes round-trip exactly at large heights, negative deltas, taps and boundaries",()=>{
  const fixtures:Point[][]=[[],[[0,0]],[[720,1_000_000_000],[0,999_999_999.9],[.3,1_000_000_000]],[[2,4],[2.3,4]],Array.from({length:30000},(_,i)=>[Math.round((360+350*Math.sin(i*.01))*10)/10,Math.round((8640+i*.5)*10)/10])];
  for(const points of fixtures)assert.deepEqual(decodePoints(encodePoints(points)),points);
});
test("higher-precision legacy coordinates remain lossless",()=>{
  const points:Point[]=[[1.23456789,500],[.999999999,500.123456789]];
  const encoded=encodePoints(points);assert.equal(encoded.encoding,"raw-v1");assert.deepEqual(decodePoints(encoded),points);
});
test("malformed and oversized transports cannot allocate unbounded geometry",()=>{
  for(const value of [{encoding:"delta-v1",count:30001,data:""},{encoding:"delta-v1",count:1,data:"AA=="},{encoding:"delta-v1",count:0,data:"AAAA"},{encoding:"delta-v1",count:1,data:"////"},{encoding:"delta-v1",count:1,data:"$$$$"},{encoding:"unknown"}]) assert.throws(()=>decodePoints(value as never));
  assert.throws(()=>encodePoints([[Number.NaN,1]]));assert.throws(()=>encodePoints([[-1,1]]));
});
test("render simplification preserves endpoints, sharp corners, and short taps without mutating originals",()=>{
  const points:Point[]=[[0,0],[.1,0],[.2,0],[1,0],[1,1],[1,2]],before=structuredClone(points);
  assert.deepEqual(simplifyPoints(points,.1),[[0,0],[1,0],[1,2]]);assert.deepEqual(points,before);
  assert.deepEqual(simplifyPoints([[2,2],[2.3,2]],.5),[[2,2],[2.3,2]]);
});
test("typical completed stroke transport uses under half the raw JSON bytes",()=>{
  const points:Point[]=Array.from({length:1000},(_,i)=>[Math.round((300+80*Math.sin(i*.02))*10)/10,Math.round((8000+i*.3)*10)/10]);
  assert.ok(JSON.stringify(encodePoints(points)).length<JSON.stringify(points).length*.5);
});
