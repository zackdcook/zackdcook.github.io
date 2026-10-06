import { assertSessionId, cacheCodeDigest, ownedSession, requestContext, secureSeed, sessionView } from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";
import { BEBRAVE_EPIC_COLORS } from "@/lib/bebrave-config";

export async function POST(request: Request) {
  try {
    const context = await requestContext(request, false);
    if (!context) throw new Error("Start a carving session first.");
    const body = await request.json();
    const id = assertSessionId(body.sessionId);
    const digest = cacheCodeDigest(String(body.code || ""));
    const { data: valid, error } = await serviceSupabase().rpc("bebrave_redeem_cache", { p_session: id, p_visitor_hash: context.visitorHash, p_network_hash: context.networkHash, p_code_digest: digest, p_seed: secureSeed() });
    if (error || valid !== true) return Response.json({ valid: false, message: "Nothing happened." }, { status: 200, headers: { "Cache-Control": "no-store" } });
    const row = await ownedSession(id, context.visitorHash);
    return Response.json({ valid: true, session: sessionView(row), colors: BEBRAVE_EPIC_COLORS, serverNow: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ valid: false, message: "Nothing happened." }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
