import {
  assertSessionId, ownedSession, requestContext, sessionDraftStrokes, sessionView,
} from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const context = await requestContext(request, false);
    if (!context) throw new Error("Start a carving session first.");

    const body = await request.json();
    const id = assertSessionId(body.sessionId);

    const { error } = await serviceSupabase().rpc("bebrave_start_drawing", {
      p_session:id,
      p_visitor_hash:context.visitorHash,
    });

    if (error) {
      const match = error.message?.match(/growth:(\d+)/);
      if (match) return Response.json({
        error:"growth", growthFeetRemaining:Number(match[1]),
      }, { status:429 });
      throw new Error("The carving could not start.");
    }

    const row = await ownedSession(id, context.visitorHash);
    return Response.json({
      session:sessionView(row),
      draftStrokes:row?.status === "drawing" ? await sessionDraftStrokes(id) : [],
      growthFeetRemaining:0,
      serverNow:new Date().toISOString(),
    }, { headers:{ "Cache-Control":"no-store" } });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "The carving could not start." }, { status:400 });
  }
}
