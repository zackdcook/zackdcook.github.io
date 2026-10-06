import { assertSessionId, ownedSession, requestContext, sessionView, visitorRow } from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const context = await requestContext(request, false);
    if (!context) throw new Error("That carving session expired.");
    const body = await request.json();
    const id = assertSessionId(body.sessionId);
    const { error } = await serviceSupabase().rpc("bebrave_finish_session", { p_session: id, p_visitor_hash: context.visitorHash });
    if (error) {
      if (error.message.includes("still active")) return Response.json({ error: "still-active", serverNow: new Date().toISOString() }, { status: 409 });
      throw new Error("The carving could not be finalized.");
    }
    const visitor = await visitorRow(context.visitorHash);
    return Response.json({ session: sessionView(await ownedSession(id, context.visitorHash)), cooldown: visitor?.next_carve_at || null, serverNow: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "The carving could not be finalized." }, { status: 400 });
  }
}
