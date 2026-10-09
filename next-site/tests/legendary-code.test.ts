import assert from "node:assert/strict";
import test from "node:test";
import {createLegendaryCode,legendaryCodeDigest,normalizeLegendaryCode} from "../lib/bebrave/legendary-code";

test("codes have stable identifiers, 16 alphanumeric symbols, and unique one-way verifiers",()=>{
  const entries=Array.from({length:1000},createLegendaryCode);
  assert.equal(new Set(entries.map(x=>x.id)).size,1000);
  assert.equal(new Set(entries.map(x=>x.code)).size,1000);
  assert.equal(new Set(entries.map(x=>x.digest)).size,1000);
  for(const entry of entries){assert.match(entry.code,/^[A-Z0-9]{16}$/);assert.match(entry.id,/^[a-f0-9-]{36}$/);assert.match(entry.digest,/^[a-f0-9]{64}$/);assert.equal(legendaryCodeDigest(entry.code),entry.digest);}
});
test("validation accepts case/outer whitespace and rejects Unicode confusables, separators and oversized input",()=>{
  assert.equal(normalizeLegendaryCode("  abcdef0123456789\n"),"ABCDEF0123456789");
  for(const invalid of [null,42,"ＡBCDEF0123456789","ABCDEF012345678-","ABC DEF0123456789","x".repeat(100000)])assert.equal(legendaryCodeDigest(invalid),null);
  assert.notEqual(legendaryCodeDigest("ABCDEF0123456789"),legendaryCodeDigest("ABCDEF0123456788"));
});
