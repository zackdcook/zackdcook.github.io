import { assertSessionId, ownedSession, requestContext, sessionView, validEpicColor } from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";
import { legendaryColor,legendaryEffect } from "@/lib/bebrave/effects";

export async function POST(request: Request) {
  try {
    const context = await requestContext(request, false);
    if (!context) throw new Error("Start a carving session first.");
    const body = await request.json();
    const id = assertSessionId(body.sessionId);
    const requested = String(body.color || "").toUpperCase();
    const owned=await ownedSession(id,context.visitorHash);
    if(!owned)throw new Error("Start a carving session first.");
    const blood=owned.chosen_rarity==="legendary"&&legendaryEffect(owned.chosen_effect)==="blood-v1";
    if (!validEpicColor(requested)&&!(blood&&requested==="#C51D36")) throw new Error("Choose one of the available colors.");
    const color=blood?legendaryColor(owned.chosen_effect,requested):requested;
    const { error } = await serviceSupabase().rpc("bebrave_choose_epic_color", { p_session: id, p_visitor_hash: context.visitorHash, p_color: color });
    if (error) throw new Error("That color could not be chosen.");
    return Response.json({ session: sessionView(await ownedSession(id, context.visitorHash)), serverNow: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "That color could not be chosen." }, { status: 400 });
  }
}
