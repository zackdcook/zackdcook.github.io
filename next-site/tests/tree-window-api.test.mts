import {test,mock} from "node:test";
import assert from "node:assert/strict";
const calls:Array<[string,...unknown[]]>=[];
const rows=[{id:"published",public_sequence:45,chosen_rarity:"epic",chosen_color:"#00F5FF",effect_seed:18,chosen_effect:null}];
const query:any={then:(resolve:any)=>resolve({data:rows,error:null})};
for(const method of ["select","eq","lt","gt","lte","order","limit"])query[method]=(...args:unknown[])=>{calls.push([method,...args]);return query;};
mock.module("../lib/supabase.ts",{exports:{serviceSupabase:()=>({from:(table:string)=>{assert.equal(table,"bebrave_sessions");return query;},rpc:async()=>({data:rows,error:null})})}});
const projected=[{strokeId:"stroke",strokeOrder:0,geometry:{version:1,encoding:"test"}}];
mock.module("../lib/bebrave/completed-storage.ts",{exports:{completedProjections:async(ids:string[])=>{assert.deepEqual(ids,["published"]);return new Map([["published",projected]]);},completedStrokes:async()=>new Map()}});
const {GET}=await import("../app/api/bebrave/tree/route.ts");
test("a viewport uses one bounded public query and passes sealed compact geometry straight through",async()=>{
  const response=await GET(new Request("https://test.example/api/bebrave/tree?from=20&to=25&cutoff=45&format=compact-v1"));
  assert.equal(response.status,200);const json=await response.json();
  assert.deepEqual(json.drawings[0].strokes,projected);
  assert.ok(calls.some(c=>c[0]==="eq"&&c[1]==="status"&&c[2]==="completed"));
  assert.ok(calls.some(c=>c[0]==="lte"&&c[1]==="public_sequence"&&c[2]===45));
  assert.ok(calls.some(c=>c[0]==="limit"&&c[1]===24));
  assert.match(response.headers.get("cache-control")||"",/immutable/);
});
test("invalid or unbounded windows never query the database",async()=>{
  const before=calls.length;
  for(const q of ["from=1&to=100&format=compact-v1","from=-1&to=2&format=compact-v1","from=5&to=4&format=compact-v1","from=1&to=2"]){assert.equal((await GET(new Request(`https://test.example/api/bebrave/tree?${q}`))).status,400);}
  assert.equal(calls.length,before);
});
