import { randomBytes } from "node:crypto";
import { beBraveTestMode } from "@/lib/bebrave-server";
import { checkOrigin, serviceSupabase } from "@/lib/supabase";

/** Isolated preview QA only. Never accepts caller identities or real game data. */
export async function POST(request: Request) {
  if (!beBraveTestMode()) return Response.json({error:"Not found."},{status:404});
  try { checkOrigin(request); } catch { return Response.json({error:"Use the test page."},{status:403}); }
  const db=serviceSupabase();
  const hash=()=>randomBytes(32).toString("hex");
  const network=hash(),actors=Array.from({length:10},hash),token=hash();
  const sessions:string[]=[];
  const report:Record<string,unknown>={};
  function check(condition:unknown,message:string):asserts condition { if(!condition)throw new Error(message); }
  async function rpc(name:string,args:Record<string,unknown>) {
    const result=await db.rpc(name,args);if(result.error)throw new Error(`${name} failed.`);return result.data;
  }
  async function prepare(actor:string,roll=0){return rpc("bebrave_prepare_session",{
    p_visitor_hash:actor,p_network_hash:network,p_browser_hint:actor,
    p_roll_arrowhead:roll,p_roll_nail:roll,p_roll_key:roll,
  });}
  async function row(id:string){const r=await db.from("bebrave_sessions").select("*").eq("id",id).single();check(!r.error&&r.data,"Fixture missing.");return r.data;}
  try {
    const attempts=await Promise.all(actors.map(actor=>prepare(actor)));
    attempts.forEach(value=>{if(value.session_id)sessions.push(value.session_id);});
    const accepted=attempts.filter(value=>value.session_id).length,rejected=attempts.filter(value=>value.error==="participation_limit").length;
    check(accepted===4&&rejected===6,"Concurrent fresh identities exceeded the allowance.");
    report.freshIdentities={requests:10,accepted,rejected};
    const actor=actors[attempts.findIndex(value=>value.session_id)],id=sessions[0];
    await rpc("bebrave_choose_tool",{p_session:id,p_visitor_hash:actor,p_tool:"arrowhead",p_color:"#40271C",p_seed:42});
    const starts=await Promise.all(Array.from({length:6},()=>rpc("bebrave_begin_drawing",{p_session:id,p_visitor_hash:actor,p_network_hash:network})));
    const deadlines=new Set(starts.map(value=>value.deadline));
    check(deadlines.size===1&&starts.every(value=>value.deadline),"Concurrent starts extended a deadline.");
    check(new Date(starts[0].deadline).getTime()-new Date(starts[0].started_at).getTime()===60000,"Timer was not sixty seconds.");
    report.concurrentStarts={requests:6,uniqueDeadlines:deadlines.size,seconds:60};
    check(await rpc("bebrave_finish_session",{p_session:id,p_visitor_hash:actor})==="empty","Blank fixture did not finish.");
    const empty=await row(id);
    const retried=await prepare(actor,9999);check(retried.session_id&&retried.session_id!==id,"Blank attempt was not cloned.");
    sessions.push(retried.session_id);const retry=await row(retried.session_id);
    const fields=["roll_arrowhead","roll_nail","roll_key","chosen_tool","chosen_rarity","chosen_color","effect_seed","chosen_effect","chosen_symbol"];
    check(fields.every(key=>retry[key]===empty[key]),"Blank retry changed tool results or effects.");
    check(retry.retry_of===id&&retry.attempt_root_id===id,"Blank retry lost its attempt lineage.");
    const different=await db.rpc("bebrave_choose_tool",{p_session:retry.id,p_visitor_hash:actor,p_tool:"key",p_color:"#00F5FF",p_seed:99});
    check(different.error?.message.includes("tool already chosen"),"Blank retry allowed a different tool.");
    report.blankRetry={sameTool:true,sameRolls:true,sameEffects:true,differentToolRejected:true};
    const others=attempts.map((value,index)=>({value,actor:actors[index]})).filter(entry=>entry.value.session_id&&entry.value.session_id!==id);
    await Promise.all(others.map(entry=>rpc("bebrave_choose_tool",{p_session:entry.value.session_id,p_visitor_hash:entry.actor,p_tool:"arrowhead",p_color:"#40271C",p_seed:42})));
    const independent=await Promise.all(others.map(entry=>rpc("bebrave_begin_drawing",{p_session:entry.value.session_id,p_visitor_hash:entry.actor,p_network_hash:network})));
    check(independent.filter(value=>value.deadline).length===1&&independent.filter(value=>value.error==="network_growth").length===2,"Two-attempt growth allowance was exceeded.");
    report.growthCycle={independentAttempts:2,additionalConcurrentStarts:3,accepted:1,rejected:2};
    const claims=await Promise.all(Array.from({length:6},()=>rpc("bebrave_claim_challenge",{p_token_hash:token})));
    check(claims.filter(Boolean).length===1,"Challenge claim replay succeeded.");
    report.tokenReplay={requests:6,accepted:1,rejected:5};
    await rpc("bebrave_begin_drawing",{p_session:retry.id,p_visitor_hash:actor,p_network_hash:network});
    const expired=new Date(Date.now()-1000).toISOString();
    const altered=await db.from("bebrave_sessions").update({drawing_deadline:expired}).eq("id",retry.id).eq("point_count",0).is("public_sequence",null);
    check(!altered.error,"Could not expire disposable test timer.");
    const ended=await rpc("bebrave_begin_drawing",{p_session:retry.id,p_visitor_hash:actor,p_network_hash:network});
    check(ended.error==="finished","Expired timer restarted.");
    const after=await row(retry.id);check(after.status==="empty"&&new Date(after.drawing_deadline).getTime()<=Date.now(),"Expired timer received more time.");
    report.expiredDeadline={restartRejected:true};
    const fixtures=await db.from("bebrave_sessions").select("point_count,public_sequence").in("id",sessions);
    check(!fixtures.error&&fixtures.data?.every(value=>value.point_count===0&&value.public_sequence===null),"QA published an unexpected mark.");
    return Response.json({passed:true,productionTouched:false,drawingsCreated:0,checks:report},{headers:{"Cache-Control":"no-store"}});
  } catch(error) {
    return Response.json({passed:false,error:error instanceof Error?error.message:"QA failed.",checks:report},{status:500,headers:{"Cache-Control":"no-store"}});
  } finally {
    // Reversible cancellation of only random, zero-point QA fixtures. Security
    // ledgers expire normally; no existing carving, code or archive is deleted.
    const owners=await db.from("bebrave_visitors").select("id").in("visitor_hash",actors);
    if(owners.data?.length)await db.from("bebrave_sessions").update({status:"cancelled"})
      .in("visitor_id",owners.data.map(value=>value.id)).eq("point_count",0).is("public_sequence",null)
      .in("status",["tool_select","epic_color","ready","drawing"]);
  }
}
