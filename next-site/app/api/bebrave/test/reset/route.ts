import { beBraveTestMode, requestContext } from "@/lib/bebrave-server";
import { serviceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!beBraveTestMode()) return new Response(null, { status:404 });
  try {
    const context = await requestContext(request, false);
    if (context) {
      const { error } = await serviceSupabase().rpc("bebrave_test_reset_limit", {p_visitor_hash:context.visitorHash});
      if(error) throw new Error("The test carving identity could not be reset.");
    }
    return Response.json({ reset:true }, { headers:{ "Cache-Control":"no-store" } });
  } catch {
    return Response.json({ error:"The test carving identity could not be reset." }, { status:500 });
  }
}
