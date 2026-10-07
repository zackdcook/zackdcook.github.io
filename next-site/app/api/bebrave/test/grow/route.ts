import {
  beBraveTestMode, growthFeetRemaining, requestContext, treeStateFromRow, visitorRow,
} from "@/lib/bebrave-server";
import { BEBRAVE_RECARVE_GROWTH_HEIGHT } from "@/lib/bebrave-types";
import { serviceSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!beBraveTestMode()) return new Response(null, { status:404 });

  try {
    const context = await requestContext(request, true);
    if (!context) throw new Error("Test identity unavailable.");

    const client = serviceSupabase();
    const { data:before, error:readError } = await client
      .from("bebrave_tree_state")
      .select("height,active_top,active_bottom,revision,completed_count,pending_growth_carvings")
      .eq("id", true).single();
    if (readError) throw readError;

    const { data, error } = await client
      .from("bebrave_tree_state")
      .update({
        height:Number(before.height)+BEBRAVE_RECARVE_GROWTH_HEIGHT,
        active_top:Number(before.active_top)+BEBRAVE_RECARVE_GROWTH_HEIGHT,
        active_bottom:Number(before.active_bottom)+BEBRAVE_RECARVE_GROWTH_HEIGHT,
        revision:Number(before.revision)+5,
        updated_at:new Date().toISOString(),
      })
      .eq("id", true)
      .select("height,active_top,active_bottom,revision,completed_count,pending_growth_carvings")
      .single();
    if (error) throw error;

    const state = treeStateFromRow(data);
    const visitor = await visitorRow(context.visitorHash);

    return Response.json({
      state,
      growthFeetRemaining:await growthFeetRemaining(visitor?.id, state.height),
      serverNow:new Date().toISOString(),
    }, { headers:{ "Cache-Control":"no-store" } });
  } catch {
    return Response.json({ error:"The test tree could not grow." }, { status:500 });
  }
}
