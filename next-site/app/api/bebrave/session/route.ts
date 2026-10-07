import {
  assertSessionId, beBraveConfigured, growthFeetRemaining, ownedSession,
  requestContext, secureRoll, sessionDraftStrokes, sessionView,
  verifyBeBraveTurnstile, visitorRow,
} from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";

async function remaining(visitorHash: string) {
  const visitor = await visitorRow(visitorHash);
  if (!visitor) return 0;
  const { data, error } = await serviceSupabase()
    .from("bebrave_tree_state").select("height").eq("id", true).single();
  if (error) throw error;
  return growthFeetRemaining(visitor.id, Number(data.height));
}

export async function GET(request: Request) {
  if (!beBraveConfigured()) return Response.json({ error:"Carving is not open yet." }, { status:503 });
  try {
    const context = await requestContext(request, false);
    if (!context) return Response.json({
      session:null, growthFeetRemaining:0, serverNow:new Date().toISOString(),
    }, { headers:{ "Cache-Control":"no-store" } });

    const id = assertSessionId(new URL(request.url).searchParams.get("id"));
    const row = await ownedSession(id, context.visitorHash);

    return Response.json({
      session:sessionView(row),
      draftStrokes:row?.status === "drawing" ? await sessionDraftStrokes(id) : [],
      growthFeetRemaining:await remaining(context.visitorHash),
      serverNow:new Date().toISOString(),
    }, { headers:{ "Cache-Control":"no-store" } });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "That carving session could not be loaded." }, { status:400 });
  }
}

export async function POST(request: Request) {
  if (!beBraveConfigured()) return Response.json({ error:"Carving is not open yet." }, { status:503 });

  try {
    const form = await request.formData();
    const token = String(form.get("cf-turnstile-response") || "");
    const context = await verifyBeBraveTurnstile(request, token);

    const { data:id, error } = await serviceSupabase().rpc("bebrave_create_or_resume_session", {
      p_visitor_hash:context.visitorHash,
      p_network_hash:context.networkHash,
      p_browser_hint:context.browserHint,
      p_roll_arrowhead:secureRoll(),
      p_roll_nail:secureRoll(),
      p_roll_key:secureRoll(),
    });

    if (error || typeof id !== "string") {
      const match = error?.message?.match(/growth:(\d+)/);
      if (match) {
        return Response.json({
          error:"growth",
          growthFeetRemaining:Number(match[1]),
        }, { status:429 });
      }
      throw new Error("The tree could not prepare your tools. Please try again.");
    }

    const row = await ownedSession(id, context.visitorHash);
    return Response.json({
      session:sessionView(row),
      draftStrokes:row?.status === "drawing" ? await sessionDraftStrokes(id) : [],
      growthFeetRemaining:0,
      serverNow:new Date().toISOString(),
    }, { headers:{ "Cache-Control":"no-store" } });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "The carving session could not begin." }, { status:400 });
  }
}
