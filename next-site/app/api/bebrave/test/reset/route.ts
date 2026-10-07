import { beBraveTestMode, requestContext, resetBeBraveTestVisitor, visitorRow } from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!beBraveTestMode()) return new Response(null, { status:404 });
  try {
    const context = await requestContext(request, false);
    if (context) {
      const visitor = await visitorRow(context.visitorHash);
      if (visitor) await serviceSupabase().from("bebrave_sessions").update({ status:"cancelled", updated_at:new Date().toISOString() }).eq("visitor_id", visitor.id).in("status", ["tool_select","epic_color","ready","drawing"]);
    }
    await resetBeBraveTestVisitor();
    return Response.json({ reset:true }, { headers:{ "Cache-Control":"no-store" } });
  } catch {
    return Response.json({ error:"The test carving identity could not be reset." }, { status:500 });
  }
}
