import test from "node:test";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { buildArchive, restoreArchive, sha256, parseCanonical, MAX_ARCHIVE_SOURCE_BYTES } from "../lib/bebrave/archive-codec";
import { assembleStrokes, unpackDrawing } from "../lib/bebrave/completed-strokes";
import { sparklePoints } from "../lib/bebrave/effect-anchors";

const sessionId="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",strokeId="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const document={version:1,sessionId,chunks:[{id:19,session_id:sessionId,stroke_id:strokeId,stroke_order:2,chunk_index:0,points:[[10.123456789,8400.123456789],[20.1,8401.1]],created_at:"2026-10-09T10:12:13.123456+00:00",future_note:"preserved"}]};
const source=JSON.stringify(document).replace("20.1,","20.1000,");

test("canonical archives round-trip original bytes, numeric precision, IDs and all metadata",async()=>{
  const archive=await buildArchive(source,"legendary",1984,sha256(source));
  const restored=await restoreArchive(Buffer.from(archive.gzipBase64,"base64"),archive.sourceSha256,archive.payloadSha256);
  assert.equal(restored.source,source);
  assert.deepEqual(restored.document,document);
  assert.equal(archive.chunkCount,1);assert.equal(archive.pointCount,2);
});

test("corrupt containers and incorrect source hashes fail before canonical replacement",async()=>{
  await assert.rejects(()=>buildArchive(source,"common",0,"0".repeat(64)),/checksum/);
  const archive=await buildArchive(source,"common",0),bytes=Buffer.from(archive.gzipBase64,"base64");
  bytes[12]^=1;
  await assert.rejects(()=>restoreArchive(bytes,archive.sourceSha256,archive.payloadSha256),/payload checksum/);
  await assert.rejects(()=>restoreArchive(Buffer.from(archive.gzipBase64,"base64"),"0".repeat(64),archive.payloadSha256),/source checksum/);
});

test("canonical bounds reject identity drift, repeated pieces and decompression bombs",async()=>{
  assert.throws(()=>parseCanonical(JSON.stringify({...document,sessionId:"different-session"})),/canonical/);
  assert.throws(()=>parseCanonical(JSON.stringify({...document,chunks:[document.chunks[0],{...document.chunks[0],id:20}]})),/Inconsistent/);
  assert.throws(()=>parseCanonical(JSON.stringify({...document,chunks:[{...document.chunks[0],points:[[NaN,0],[1,1]]}]})),/point/);
  const bomb=gzipSync(" ".repeat(MAX_ARCHIVE_SOURCE_BYTES+1));
  await assert.rejects(()=>restoreArchive(bomb,sha256("unused"),sha256(bomb)));
});

test("render simplification keeps seeded effects on the original path and canonical points intact",async()=>{
  const points=Array.from({length:160},(_,i)=>[i*4,8100+Math.sin(i)*.03]);
  const full={...document,chunks:[{...document.chunks[0],points}]};
  const text=JSON.stringify(full),archive=await buildArchive(text,"legendary",1984);
  const projected=unpackDrawing({id:sessionId,publicSequence:1,rarity:"legendary",color:"#CDAAFF",effectSeed:1984,strokes:archive.renderStrokes});
  assert.equal(projected.strokes[0].points.length,2);
  assert.deepEqual(projected.strokes[0].sparkles,sparklePoints(points as Array<[number,number]>,1984,2));
  const restored=await restoreArchive(Buffer.from(archive.gzipBase64,"base64"),archive.sourceSha256,archive.payloadSha256);
  assert.equal(restored.source,text);
  assert.deepEqual(assembleStrokes(restored.document.chunks).get(sessionId)?.[0].points,points);
});
