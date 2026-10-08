import {
  beBraveConfigured, currentOpenSession, growthFeetRemaining, requestContext,
  sessionView, treeStateFromRow, visitorRow,
} from "@/lib/bebrave-server";
import { fallbackBeBraveTreeState } from "@/lib/bebrave-types";
import { serviceSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!beBraveConfigured()) {
    return Response.json({
      enabled:false, state:fallbackBeBraveTreeState,
      growthFeetRemaining:0, session:null, serverNow:new Date().toISOString(),
    }, { headers:{ "Cache-Control":"no-store" } });
  }

  try {
    const { data, error } = await serviceSupabase()
      .from("bebrave_tree_state")
      .select("height,active_top,active_bottom,revision,completed_count")
      .eq("id", true).single();
    if (error) throw error;

    const state = treeStateFromRow(data);
    const context = await requestContext(request, false);
    const visitor = context ? await visitorRow(context.visitorHash) : null;
    const open = context ? await currentOpenSession(context.visitorHash) : null;

    return Response.json({
      enabled:true,
      state,
      growthFeetRemaining:await growthFeetRemaining(visitor?.id, state.height),
      session:sessionView(open),
      serverNow:new Date().toISOString(),
    }, { headers:{ "Cache-Control":"no-store" } });
  } catch {
    return Response.json({ error:"The tree is resting for a moment. Please try again." }, { status:503 });
  }
}
