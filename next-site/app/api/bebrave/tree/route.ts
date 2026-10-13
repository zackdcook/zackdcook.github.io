import { serviceSupabase } from "@/lib/supabase";
import { completedStrokes,completedProjections } from "@/lib/bebrave/completed-storage";
import { BEBRAVE_SECTION_HEIGHT,type BeBravePublicDrawing } from "@/lib/bebrave-types";


export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const section = Number(params.get("section"));
    const cutoff = params.has("cutoff") ? Number(params.get("cutoff")) : undefined;
    const before = params.has("before") ? Number(params.get("before")) : undefined;
    const windowed=params.has("from");
    if(windowed&&params.get("format")!=="compact-v1")return Response.json({error:"Invalid tree window format."},{status:400});
    const first=windowed?Number(params.get("from")):section,last=windowed?Number(params.get("to")):section;
    if(!Number.isSafeInteger(first)||!Number.isSafeInteger(last)||first<0||last<first||last>1_000_000||last-first>15)return Response.json({error:"Invalid tree window."},{status:400});
    if (!Number.isSafeInteger(section) || section < 0 || section > 1_000_000) return Response.json({ error: "Invalid tree section." }, { status: 400 });
    if (cutoff !== undefined && (!Number.isSafeInteger(cutoff) || cutoff < 0)) return Response.json({ error: "Invalid tree snapshot." }, { status: 400 });
    if (before !== undefined && (!Number.isSafeInteger(before) || before < 1)) return Response.json({ error: "Invalid page cursor." }, { status: 400 });
    let query=serviceSupabase().from("bebrave_sessions").select("id,public_sequence,chosen_rarity,chosen_color,effect_seed,chosen_effect")
      .eq("status","completed").lt("zone_top",(last+1)*BEBRAVE_SECTION_HEIGHT).gt("zone_bottom",first*BEBRAVE_SECTION_HEIGHT).order("public_sequence",{ascending:false}).limit(24);
    if(cutoff!==undefined)query=query.lte("public_sequence",cutoff);
    if(before!==undefined)query=query.lt("public_sequence",before);
    const { data: sessions, error } = windowed?await query:await serviceSupabase().rpc("bebrave_completed_in_section",{
      p_section:section,p_before:before??null,p_cutoff:cutoff??null,
    });
    if (error) throw error;
    const ids = (sessions || []).map((row: {id:string}) => row.id);
    const compact=params.get("format")==="compact-v1";
    const projections=compact?await completedProjections(ids):undefined;
    const bySession = compact?undefined:await completedStrokes(ids.slice(0,12),false);
    const drawings = (sessions || []).map((row: {id:string;public_sequence:number;chosen_rarity:BeBravePublicDrawing["rarity"];chosen_color:string;effect_seed:number;chosen_effect:string|null}) => ({
      id:row.id, publicSequence:Number(row.public_sequence), rarity:row.chosen_rarity,
      color:row.chosen_color, effectSeed:Number(row.effect_seed||0), effectId:row.chosen_effect||undefined, strokes:compact?projections!.get(row.id)||[]:bySession!.get(row.id)||[],
    }));
    const nextBefore = drawings.length === (windowed?24:12) ? Math.min(...drawings.map((d:{publicSequence:number}) => d.publicSequence)) : null;
    return Response.json({ drawings, more: nextBefore !== null, nextBefore }, { headers: { "Cache-Control": cutoff!==undefined&&compact?"public, max-age=3600, s-maxage=86400, immutable":"public, max-age=10, s-maxage=10" } });
  } catch {
    return Response.json({ error: "That stretch of bark could not load." }, { status: 503 });
  }
}
