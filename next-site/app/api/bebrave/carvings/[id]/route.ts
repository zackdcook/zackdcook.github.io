import { serviceSupabase } from "@/lib/supabase";
import { completedStrokes } from "@/lib/bebrave/completed-storage";

/** Selective original-geometry read. No visitor identity or private reward data. */
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params;
    if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id))return Response.json({error:"Invalid tree snapshot."},{status:400});
    const row=await serviceSupabase().from("bebrave_sessions").select("id,public_sequence,chosen_tool,chosen_rarity,chosen_color,effect_seed,chosen_effect,drawing_finished_at,zone_top,zone_bottom").eq("id",id).eq("status","completed").not("public_sequence","is",null).maybeSingle();
    if(row.error)throw row.error;
    if(!row.data)return Response.json({error:"That stretch of bark could not load."},{status:404});
    const strokes=(await completedStrokes([id],false)).get(id)||[];
    return Response.json({drawing:{id,publicSequence:Number(row.data.public_sequence),tool:row.data.chosen_tool,rarity:row.data.chosen_rarity,color:row.data.chosen_color,effectSeed:Number(row.data.effect_seed),effectId:row.data.chosen_effect||undefined,finishedAt:row.data.drawing_finished_at,zoneTop:row.data.zone_top,zoneBottom:row.data.zone_bottom,strokes}},{headers:{"Cache-Control":"public, max-age=86400, s-maxage=86400, immutable"}});
  } catch {
    return Response.json({error:"That stretch of bark could not load."},{status:503});
  }
}
