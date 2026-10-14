import {test,mock,after} from "node:test";
import assert from "node:assert/strict";
let cookie:string|undefined;let requestHeaders=new Headers();
const claims=new Set<string>();const calls:Array<{name:string;args:Record<string,unknown>}>=[];
let outcome:Record<string,unknown>={session_id:"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"};
let providerChecks=0;let provider="ok";
mock.module("server-only",{exports:{default:{}}});
mock.module("next/headers",{exports:{
  headers:async()=>requestHeaders,
  cookies:async()=>({get:()=>cookie?{value:cookie}:undefined,set:(_name:string,value:string)=>{cookie=value;}}),
}});
mock.module("../lib/supabase.ts",{exports:{serviceSupabase:()=>({
  rpc:async(name:string,args:Record<string,unknown>)=>{
    calls.push({name,args});
    if(name==="bebrave_claim_challenge"){
      const hash=String(args.p_token_hash);const fresh=!claims.has(hash);claims.add(hash);return{data:fresh,error:null};
    }
    if(name==="bebrave_prepare_session"||name==="bebrave_begin_drawing")return{data:outcome,error:null};
    return {data:true,error:null};
  },
  from:()=>{const query:any={select:()=>query,eq:()=>query,in:()=>query,not:()=>query,gt:()=>query,order:()=>query,limit:()=>query,
    maybeSingle:async()=>({data:null,error:null}),single:async()=>({data:{height:8640},error:null})};return query;},
})}});
Object.assign(process.env,{VERCEL:"1",VERCEL_ENV:"preview",VERCEL_URL:"security-preview.vercel.app",NEXT_PUBLIC_SUPABASE_URL:"https://qkkgcoejkqvthbjcldcw.supabase.co",SUPABASE_SECRET_KEY:"test-placeholder",BEBRAVE_HMAC_KEY:"isolated-unit-test-security-key-32bytes",TURNSTILE_SECRET_KEY:"isolated-unit-test-provider-secret",NEXT_PUBLIC_TURNSTILE_SITE_KEY:"test-site-key"});
delete process.env.BEBRAVE_TEST_MODE;delete process.env.BEBRAVE_TEST_PROJECT_REF;
const originalFetch=globalThis.fetch;
globalThis.fetch=(async(url:unknown)=>{
  assert.equal(String(url),"https://challenges.cloudflare.com/turnstile/v0/siteverify");providerChecks++;
  return Response.json({success:provider!=="rejected",hostname:provider==="wrong-host"?"wrong.example":"security-preview.vercel.app",action:provider==="wrong-action"?"book_launch":"bebrave"});
}) as typeof fetch;
after(()=>{globalThis.fetch=originalFetch;});
const {requestContext}=await import("../lib/bebrave-server.ts");
const {POST:prepare}=await import("../app/api/bebrave/session/route.ts");
const {POST:start}=await import("../app/api/bebrave/session/start/route.ts");
function request(token:string,origin="https://security-preview.vercel.app"){
  requestHeaders=new Headers({origin,"x-vercel-forwarded-for":"192.0.2.1","x-forwarded-for":"203.0.113.77","user-agent":"Test Browser"});
  const form=new FormData();if(token)form.set("cf-turnstile-response",token);
  return new Request("https://security-preview.vercel.app/api/bebrave/session",{method:"POST",headers:requestHeaders,body:form});
}

test("clearing cookies changes ownership but not the trusted network budget",async()=>{
  const r=request("context-only");cookie="a".repeat(64);const first=await requestContext(r);
  cookie=undefined;const fresh=await requestContext(r);
  assert.notEqual(first!.visitorHash,fresh!.visitorHash);assert.equal(first!.networkHash,fresh!.networkHash);
  requestHeaders.set("x-forwarded-for","198.51.100.9");
  assert.equal((await requestContext(r))!.networkHash,first!.networkHash,"caller-supplied proxy values cannot replace the Vercel signal");
  requestHeaders.delete("x-vercel-forwarded-for");requestHeaders.delete("x-forwarded-for");await assert.rejects(()=>requestContext(r));
});

test("blank, replayed, wrong-host and wrong-action challenges never prepare tools",async()=>{
  calls.length=0;assert.equal((await prepare(request(""))).status,400);assert.equal(calls.length,0);
  cookie="b".repeat(64);assert.equal((await prepare(request("single-use-valid-token"))).status,200);
  const before=providerChecks;const preparations=calls.filter(c=>c.name==="bebrave_prepare_session").length;
  cookie=undefined;assert.equal((await prepare(request("single-use-valid-token"))).status,400);
  assert.equal(providerChecks,before);assert.equal(calls.filter(c=>c.name==="bebrave_prepare_session").length,preparations);
  for(const state of ["wrong-host","wrong-action","rejected"]){provider=state;assert.equal((await prepare(request(`bad-${state}`))).status,400);}
  assert.equal(calls.filter(c=>c.name==="bebrave_prepare_session").length,preparations);provider="ok";
  assert.equal((await prepare(request("cross-site-token","https://evil.example"))).status,400);
});

test("fresh-cookie participation rejection is rendered as 429 instead of an invitation to reroll",async()=>{
  outcome={error:"participation_limit",retry_seconds:600};cookie=undefined;
  const response=await prepare(request("limited-token"));assert.equal(response.status,429);
  assert.equal(response.headers.get("Retry-After"),"600");
  assert.equal((await response.json()).category,"participation_limit");
});

test("drawing starts pass the same trusted network signal to the atomic database gate",async()=>{
  const contextRequest=request("start-context");cookie="c".repeat(64);const context=await requestContext(contextRequest);
  outcome={error:"network_growth",growth_feet_remaining:2};
  const response=await start(new Request("https://security-preview.vercel.app/api/bebrave/session/start",{method:"POST",headers:requestHeaders,body:JSON.stringify({sessionId:"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",deadline:"2099-01-01T00:00:00Z",networkHash:"forged"})}));
  assert.equal(response.status,429);
  const call=calls.findLast(c=>c.name==="bebrave_begin_drawing")!;
  assert.equal(call.args.p_network_hash,context!.networkHash);assert.equal("deadline" in call.args,false);
});
