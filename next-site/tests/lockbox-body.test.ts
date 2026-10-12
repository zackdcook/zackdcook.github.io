import assert from "node:assert/strict";
import test from "node:test";
import {readLockboxBody} from "../lib/bebrave/request-body";
test("lockbox input is bounded without trusting Content-Length",async()=>{
  const make=(body:string)=>new Request("https://example.test",{method:"POST",body});
  assert.deepEqual(await readLockboxBody(make('{"code":"ABCDEF0123456789"}')),{code:"ABCDEF0123456789"});
  await assert.rejects(()=>readLockboxBody(make(JSON.stringify({code:"a".repeat(3000)}))));
  await assert.rejects(()=>readLockboxBody(make("[]")));
  await assert.rejects(()=>readLockboxBody(make("invalid")));
});
