import test from "node:test";
import assert from "node:assert/strict";
import {assembleStrokes,packDrawing,unpackDrawing,readChunkPages,type StrokeChunk} from "../lib/bebrave/completed-strokes";

const chunk=(id:number,index:number,points:Array<[number,number]>):StrokeChunk=>({id,session_id:"visitor-session",stroke_id:"stroke",stroke_order:0,chunk_index:index,points});
test("more than one thousand stored chunks are all read despite short database pages",async()=>{
  const rows=Array.from({length:1793},(_,i)=>chunk(i+1,i,[[i,8000],[i+1,8000]]));
  const read=await readChunkPages(async after=>rows.filter(r=>r.id>(after||0)).slice(0,317),2000);
  assert.equal(read.length,1793);assert.deepEqual(read.at(-1),rows.at(-1));
});
test("a stalled cursor and a maliciously oversized session stop bounded database reads",async()=>{
  const row=chunk(1,0,[[1,2],[2,2]]);
  await assert.rejects(()=>readChunkPages(async()=>[row],320),/cursor/);
  await assert.rejects(()=>readChunkPages(async after=>[chunk((after||0)+1,0,[])],1),/budget/);
});
test("chunk reconstruction preserves session identity, chunk boundaries and paint order",()=>{
  const strokes=assembleStrokes([chunk(2,1,[[2,4],[3,5]]),chunk(1,0,[[1,2],[2,4]])]).get("visitor-session")!;
  assert.deepEqual(strokes[0].points,[[1,2],[2,4],[3,5]]);
  const drawing={id:"visitor-session",publicSequence:123,rarity:"epic" as const,color:"#FF2BD6",effectSeed:999,strokes};
  assert.deepEqual(unpackDrawing(packDrawing(drawing)),drawing);
  assert.deepEqual(unpackDrawing(drawing),drawing);
});
