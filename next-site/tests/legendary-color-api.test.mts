import {test,mock} from "node:test";
import assert from "node:assert/strict";
let owned:Record<string,unknown>|null={chosen_rarity:"legendary",chosen_effect:"blood-v1"};
const colors:string[]=[];const symbols:number[]=[];
mock.module("../lib/bebrave-server.ts",{exports:{
  assertSessionId:(value:unknown)=>String(value),requestContext:async()=>({visitorHash:"owned-test-visitor"}),
  ownedSession:async()=>owned,sessionView:(value:unknown)=>value,validEpicColor:(value:string)=>value==="#00F5FF",
}});
mock.module("../lib/supabase.ts",{exports:{serviceSupabase:()=>({rpc:async(name:string,input:{p_color:string;p_symbol?:number})=>{
  assert.ok(["bebrave_choose_epic_color","bebrave_choose_enchantment"].includes(name));colors.push(input.p_color);if(input.p_symbol!==undefined)symbols.push(input.p_symbol);owned={...owned,chosen_color:input.p_color,chosen_symbol:input.p_symbol};return{error:null};
}})}});
const {POST}=await import("../app/api/bebrave/session/color/route.ts");
const request=(color:string,symbol?:unknown)=>new Request("https://test.example/api/bebrave/session/color",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sessionId:"owned",color,symbol})});
test("blood Legendary stores crimson; other rarities keep their assigned palette and foreign sessions cannot write",async()=>{
  const blood=await POST(request("#00F5FF"));assert.equal(blood.status,200);assert.equal((await blood.json()).session.chosen_color,"#C51D36");
  owned={chosen_rarity:"epic",chosen_effect:"blood-v1"};
  assert.equal((await POST(request("#00F5FF"))).status,200);assert.equal(colors.at(-1),"#00F5FF");
  assert.equal((await POST(request("#C51D36"))).status,400);
  const count=colors.length;owned=null;
  assert.equal((await POST(request("#00F5FF"))).status,400);assert.equal(colors.length,count);
});


test("enchantment chooses one saved symbol and rejects emoji, invalid values and a changed personal dagger",async()=>{
  owned={chosen_tool:"cache",chosen_rarity:"legendary",chosen_effect:"will-o-wisp-v1"};
  assert.equal((await POST(request("#00F5FF",0x2620))).status,200);assert.equal(symbols.at(-1),0x2620);
  const count=symbols.length;
  for(const value of [0x1f600,0x1f5e1,"9733",null])assert.equal((await POST(request("#00F5FF",value))).status,400);
  assert.equal(symbols.length,count);
  owned={chosen_tool:"cache",chosen_rarity:"legendary",chosen_effect:"blood-v1"};
  assert.equal((await POST(request("#00F5FF",0x2665))).status,400);
  assert.equal((await POST(request("#C51D36",0x1f5e1))).status,200);assert.equal(symbols.at(-1),0x1f5e1);
});
