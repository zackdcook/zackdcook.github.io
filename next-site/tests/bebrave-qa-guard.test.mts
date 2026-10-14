import {test,mock} from "node:test";
import assert from "node:assert/strict";
let testMode=false,storageCalls=0;
mock.module("../lib/bebrave-server.ts",{exports:{beBraveTestMode:()=>testMode}});
mock.module("../lib/supabase.ts",{exports:{checkOrigin:()=>{throw new Error("wrong origin");},serviceSupabase:()=>{storageCalls++;throw new Error("Must not access storage.");}}});
const {POST}=await import("../app/api/bebrave/test/security/route.ts");
test("security QA is absent outside isolated mode and rejects foreign origins before any database call",async()=>{
  const req=new Request("https://qa.example/api/bebrave/test/security",{method:"POST"});
  assert.equal((await POST(req)).status,404);assert.equal(storageCalls,0);
  testMode=true;assert.equal((await POST(req)).status,403);assert.equal(storageCalls,0);
});
