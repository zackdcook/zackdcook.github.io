import { serviceSupabase } from "@/lib/supabase";
import { assembleStrokes, packDrawing, readChunkPages, type StrokeChunk } from "@/lib/bebrave/completed-strokes";
import type { BeBravePublicDrawing } from "@/lib/bebrave-types";


export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const section = Number(params.get("section"));
    const cutoff = params.has("cutoff") ? Number(params.get("cutoff")) : undefined;
    const before = params.has("before") ? Number(params.get("before")) : undefined;
    if (!Number.isSafeInteger(section) || section < 0 || section > 1_000_000) return Response.json({ error: "Invalid tree section." }, { status: 400 });
    if (cutoff !== undefined && (!Number.isSafeInteger(cutoff) || cutoff < 0)) return Response.json({ error: "Invalid tree snapshot." }, { status: 400 });
    if (before !== undefined && (!Number.isSafeInteger(before) || before < 1)) return Response.json({ error: "Invalid page cursor." }, { status: 400 });
    const { data: sessions, error } = await serviceSupabase().rpc("bebrave_completed_in_section",{
      p_section:section,p_before:before??null,p_cutoff:cutoff??null,
    });
    if (error) throw error;
    const ids = (sessions || []).map((row: {id:string}) => row.id);
    const chunks = ids.length ? await readChunkPages(async (afterId) => {
      let chunkQuery = serviceSupabase().from("bebrave_stroke_chunks")
        .select("id,session_id,stroke_id,stroke_order,chunk_index,points")
        .in("session_id", ids).order("id", {ascending:true}).limit(500);
      if(afterId !== null) chunkQuery=chunkQuery.gt("id",afterId);
      const page=await chunkQuery;
      if(page.error)throw page.error;
      return (page.data || []) as StrokeChunk[];
    }, ids.length*320) : [];
    const bySession = assembleStrokes(chunks);
    const drawings = (sessions || []).map((row: {id:string;public_sequence:number;chosen_rarity:BeBravePublicDrawing["rarity"];chosen_color:string;effect_seed:number;chosen_effect:string|null}) => ({
      id:row.id, publicSequence:Number(row.public_sequence), rarity:row.chosen_rarity,
      color:row.chosen_color, effectSeed:Number(row.effect_seed||0), effectId:row.chosen_effect||undefined, strokes:bySession.get(row.id)||[],
    })) as BeBravePublicDrawing[];
    const nextBefore = drawings.length === 12 ? Math.min(...drawings.map((d) => d.publicSequence)) : null;
    return Response.json({ drawings:params.get("format")==="compact-v1"?drawings.map(packDrawing):drawings, more: nextBefore !== null, nextBefore }, { headers: { "Cache-Control": "public, max-age=10, s-maxage=10" } });
  } catch {
    return Response.json({ error: "That stretch of bark could not load." }, { status: 503 });
  }
}
