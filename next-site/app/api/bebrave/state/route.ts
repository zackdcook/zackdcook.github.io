import { beBraveConfigured, currentOpenSession, requestContext, sessionView, visitorRow } from "@/lib/bebrave-server";
import { fallbackBeBraveTreeState } from "@/lib/bebrave-types";
import { serviceSupabase } from "@/lib/supabase";


export async function GET(request: Request) {
  if (!beBraveConfigured()) {
    return Response.json({ enabled: false, state: fallbackBeBraveTreeState, cooldown: null, session: null, serverNow: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const { data, error } = await serviceSupabase().from("bebrave_tree_state").select("height,active_top,active_bottom,revision,completed_count,pending_growth_carvings").eq("id", true).single();
    if (error) throw error;
    const context = await requestContext(request, false);
    const visitor = context ? await visitorRow(context.visitorHash) : null;
    const open = context ? await currentOpenSession(context.visitorHash) : null;
    return Response.json({
      enabled: true,
      state: {
        height: Number(data.height), activeTop: Number(data.active_top), activeBottom: Number(data.active_bottom), revision: Number(data.revision),
        completedCount: Number(data.completed_count), pendingGrowthCarvings: Number(data.pending_growth_carvings), latestSequence: Number(data.completed_count),
      },
      cooldown: visitor?.next_carve_at || null,
      session: sessionView(open),
      serverNow: new Date().toISOString(),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "The tree is resting for a moment. Please try again." }, { status: 503 });
  }
}
