import assert from "node:assert/strict";
import test from "node:test";
import {SectionCache} from "../lib/bebrave/section-cache";
test("rapid exploration stays bounded and late replies cannot repopulate evicted sections",async()=>{
  const replies:Array<()=>void>=[];
  const cache=new SectionCache<number>((key,signal)=>new Promise(resolve=>{replies.push(()=>resolve(key));}));
  const pending:Promise<number>[]=[];
  for(let first=0;first<1000;first+=5){cache.setWindow(first,first+4);for(let n=first;n<=first+4;n++)pending.push(cache.load(n));assert.ok(cache.pendingCount<=11);}
  replies.forEach(reply=>reply());await Promise.all(pending);
  assert.equal(cache.size,8);assert.equal(cache.pendingCount,0);
  cache.dispose();assert.equal(cache.size,0);
});
test("nearby revisits share a request and a new snapshot has no stale geometry",async()=>{
  let requests=0;
  const cache=new SectionCache(async key=>{requests++;return key;});cache.setWindow(20,24);
  await Promise.all([cache.load(22),cache.load(22)]);assert.equal(requests,1);
  await cache.load(22);assert.equal(requests,1);
  await assert.rejects(cache.load(1));
  cache.dispose();await cache.load(22);assert.equal(requests,2);
});
