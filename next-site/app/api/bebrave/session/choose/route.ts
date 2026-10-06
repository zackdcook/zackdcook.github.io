import { assertSessionId, ownedSession, requestContext, secureColor, secureSeed, sessionView, toolTier } from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";
import type { BeBraveNormalTool } from "@/lib/bebrave-types";

export async function POST(request: Request) {
  try {
    const context = await requestContext(request, false);
    if (!context) throw new Error("Start a carving session first.");
    const body = await request.json();
    const id = assertSessionId(body.sessionId);
    const tool = String(body.tool || "") as BeBraveNormalTool;
    if (!(["arrowhead", "nail", "key"] as string[]).includes(tool)) throw new Error("Choose one of the three tools.");
    let row = await ownedSession(id, context.visitorHash);
    if (!row) throw new Error("That carving session could not be found.");
    if (!row.chosen_tool) {
      const rarity = toolTier(row, tool);
      const color = secureColor(rarity);
      const { error } = await serviceSupabase().rpc("bebrave_choose_tool", { p_session: id, p_visitor_hash: context.visitorHash, p_tool: tool, p_color: color, p_seed: secureSeed() });
      if (error) throw new Error("Your tool choice could not be locked in.");
      row = await ownedSession(id, context.visitorHash);
    }
    return Response.json({ session: sessionView(row), serverNow: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "That tool could not be selected." }, { status: 400 });
  }
}
