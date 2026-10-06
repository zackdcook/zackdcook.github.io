import { assertSessionId, requestContext } from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 48_000) throw new Error("That carving chunk is too large.");
    const context = await requestContext(request, false);
    if (!context) throw new Error("That carving session expired.");
    const body = await request.json();
    const id = assertSessionId(body.sessionId);
    const strokeId = String(body.strokeId || "");
    if (!/^[a-f0-9-]{36}$/i.test(strokeId)) throw new Error("Invalid stroke.");
    const strokeOrder = Number(body.strokeOrder), chunkIndex = Number(body.chunkIndex);
    if (!Number.isSafeInteger(strokeOrder) || !Number.isSafeInteger(chunkIndex) || !Array.isArray(body.points)) throw new Error("Invalid stroke data.");
    const { data, error } = await serviceSupabase().rpc("bebrave_append_chunk", { p_session: id, p_visitor_hash: context.visitorHash, p_stroke_id: strokeId, p_stroke_order: strokeOrder, p_chunk_index: chunkIndex, p_points: body.points });
    if (error) {
      if (error.message.includes("deadline")) return Response.json({ error: "deadline" }, { status: 409 });
      throw new Error("That part of the carving could not be saved.");
    }
    return Response.json({ stored: data === "stored" || data === "duplicate", serverNow: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "That carving chunk could not be saved." }, { status: 400 });
  }
}
