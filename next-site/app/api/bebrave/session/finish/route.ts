import {
  assertSessionId, growthFeetRemaining, ownedSession, requestContext,
  sessionView, visitorRow,
} from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const context = await requestContext(request, false);
    if (!context) throw new Error("That carving session expired.");

    const body = await request.json();
    const id = assertSessionId(body.sessionId);

    const { error } = await serviceSupabase().rpc("bebrave_finish_session", {
      p_session:id,
      p_visitor_hash:context.visitorHash,
    });

    if (error) {
      if (error.message.includes("still active")) {
        return Response.json({ error:"still-active", serverNow:new Date().toISOString() }, { status:409 });
      }
      throw new Error("The carving could not be finalized.");
    }

    const visitor = await visitorRow(context.visitorHash);
    const { data:tree, error:treeError } = await serviceSupabase()
      .from("bebrave_tree_state").select("height").eq("id", true).single();
    if (treeError) throw treeError;

    return Response.json({
      session:sessionView(await ownedSession(id, context.visitorHash)),
      growthFeetRemaining:await growthFeetRemaining(visitor?.id, Number(tree.height),Number(visitor?.test_reset_sequence||0)),
      serverNow:new Date().toISOString(),
    }, { headers:{ "Cache-Control":"no-store" } });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "The carving could not be finalized." }, { status:400 });
  }
}
