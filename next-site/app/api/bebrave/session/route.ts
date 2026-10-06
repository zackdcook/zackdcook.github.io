import { beBraveConfigured, assertSessionId, ownedSession, requestContext, secureRoll, sessionDraftStrokes, sessionView, verifyBeBraveTurnstile, visitorRow } from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";


export async function GET(request: Request) {
  if (!beBraveConfigured()) return Response.json({ error: "Carving is not open yet." }, { status: 503 });
  try {
    const context = await requestContext(request, false);
    if (!context) return Response.json({ session: null, cooldown: null, serverNow: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
    const id = assertSessionId(new URL(request.url).searchParams.get("id"));
    const row = await ownedSession(id, context.visitorHash);
    const visitor = await visitorRow(context.visitorHash);
    return Response.json({ session: sessionView(row), draftStrokes: row?.status === "drawing" ? await sessionDraftStrokes(id) : [], cooldown: visitor?.next_carve_at || null, serverNow: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "That carving session could not be loaded." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  if (!beBraveConfigured()) return Response.json({ error: "Carving is not open yet." }, { status: 503 });
  try {
    const form = await request.formData();
    const token = String(form.get("cf-turnstile-response") || "");
    const context = await verifyBeBraveTurnstile(request, token);
    const { data: id, error } = await serviceSupabase().rpc("bebrave_create_or_resume_session", {
      p_visitor_hash: context.visitorHash,
      p_network_hash: context.networkHash,
      p_browser_hint: context.browserHint,
      p_roll_arrowhead: secureRoll(),
      p_roll_nail: secureRoll(),
      p_roll_key: secureRoll(),
    });
    if (error || typeof id !== "string") {
      const visitor = await visitorRow(context.visitorHash);
      if (visitor?.next_carve_at && new Date(visitor.next_carve_at).getTime() > Date.now()) {
        return Response.json({ error: "cooldown", cooldown: visitor.next_carve_at }, { status: 429 });
      }
      throw new Error("The tree could not prepare your tools. Please try again.");
    }
    const row = await ownedSession(id, context.visitorHash);
    const visitor = await visitorRow(context.visitorHash);
    return Response.json({ session: sessionView(row), draftStrokes: row?.status === "drawing" ? await sessionDraftStrokes(id) : [], cooldown: visitor?.next_carve_at || null, serverNow: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "The carving session could not begin." }, { status: 400 });
  }
}
