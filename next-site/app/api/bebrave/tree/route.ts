import { serviceSupabase } from "@/lib/supabase";
import { BEBRAVE_SECTION_HEIGHT } from "@/lib/bebrave-types";


export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const section = Number(params.get("section"));
    const cutoff = params.has("cutoff") ? Number(params.get("cutoff")) : undefined;
    const before = params.has("before") ? Number(params.get("before")) : undefined;
    if (!Number.isSafeInteger(section) || section < 0 || section > 1_000_000) return Response.json({ error: "Invalid tree section." }, { status: 400 });
    if (cutoff !== undefined && (!Number.isSafeInteger(cutoff) || cutoff < 0)) return Response.json({ error: "Invalid tree snapshot." }, { status: 400 });
    if (before !== undefined && (!Number.isSafeInteger(before) || before < 1)) return Response.json({ error: "Invalid page cursor." }, { status: 400 });
    const from = section * BEBRAVE_SECTION_HEIGHT, to = from + BEBRAVE_SECTION_HEIGHT;
    let query = serviceSupabase().from("bebrave_sessions")
      .select("id,public_sequence,chosen_rarity,chosen_color,effect_seed,zone_top,zone_bottom")
      .eq("status", "completed")
      .not("public_sequence", "is", null)
      .gt("zone_bottom", from)
      .lt("zone_top", to)
      .order("public_sequence", { ascending: false })
      .limit(80);
    if (cutoff !== undefined) query = query.lte("public_sequence", cutoff);
    if (before !== undefined) query = query.lt("public_sequence", before);
    const { data: sessions, error } = await query;
    if (error) throw error;
    const ids = (sessions || []).map((row) => row.id);
    const chunks = ids.length ? await serviceSupabase().from("bebrave_stroke_chunks").select("session_id,stroke_id,stroke_order,chunk_index,points").in("session_id", ids).order("stroke_order").order("chunk_index") : { data: [], error: null };
    if (chunks.error) throw chunks.error;
    const bySession = new Map<string, Map<string, { strokeId: string; strokeOrder: number; pieces: Array<{ index: number; points: Array<[number, number]> }> }>>();
    for (const row of chunks.data || []) {
      let strokes = bySession.get(row.session_id); if (!strokes) { strokes = new Map(); bySession.set(row.session_id, strokes); }
      let stroke = strokes.get(row.stroke_id); if (!stroke) { stroke = { strokeId: row.stroke_id, strokeOrder: Number(row.stroke_order), pieces: [] }; strokes.set(row.stroke_id, stroke); }
      stroke.pieces.push({ index: Number(row.chunk_index), points: row.points as Array<[number, number]> });
    }
    const drawings = (sessions || []).map((row) => {
      const strokes = [...(bySession.get(row.id)?.values() || [])].sort((a,b)=>a.strokeOrder-b.strokeOrder).map((stroke) => {
        const points:Array<[number,number]> = [];
        for (const piece of stroke.pieces.sort((a,b)=>a.index-b.index)) for (const point of piece.points) {
          const last = points.at(-1); if (!last || last[0] !== point[0] || last[1] !== point[1]) points.push(point);
        }
        return { strokeId: stroke.strokeId, strokeOrder: stroke.strokeOrder, points };
      });
      return { id: row.id, publicSequence: Number(row.public_sequence), rarity: row.chosen_rarity, color: row.chosen_color, effectSeed: Number(row.effect_seed || 0), strokes };
    });
    const nextBefore = drawings.length === 80 ? Math.min(...drawings.map((d) => d.publicSequence)) : null;
    return Response.json({ drawings, more: nextBefore !== null, nextBefore }, { headers: { "Cache-Control": "public, max-age=10, s-maxage=10" } });
  } catch {
    return Response.json({ error: "That stretch of bark could not load." }, { status: 503 });
  }
}
