import { serviceSupabase } from "@/lib/supabase";
import { beBraveConfigured } from "@/lib/bebrave-server";
import { fallbackBeBraveTreeState } from "@/lib/bebrave-types";


export async function GET() {
  if (!beBraveConfigured()) return Response.json({ state: fallbackBeBraveTreeState }, { headers: { "Cache-Control": "no-store" } });
  const { data, error } = await serviceSupabase().from("bebrave_tree_state").select("height,active_top,active_bottom,revision,completed_count,pending_growth_carvings").eq("id", true).single();
  if (error) return Response.json({ error: "The tree snapshot could not be captured." }, { status: 503 });
  return Response.json({ state: { height:Number(data.height),activeTop:Number(data.active_top),activeBottom:Number(data.active_bottom),revision:Number(data.revision),completedCount:Number(data.completed_count),pendingGrowthCarvings:Number(data.pending_growth_carvings),latestSequence:Number(data.completed_count) }, serverNow:new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
