import { serviceSupabase } from "@/lib/supabase";
import { beBraveConfigured, treeStateFromRow } from "@/lib/bebrave-server";
import { fallbackBeBraveTreeState } from "@/lib/bebrave-types";

export async function GET() {
  if (!beBraveConfigured()) return Response.json({ state: fallbackBeBraveTreeState }, { headers: { "Cache-Control": "no-store" } });
  const { data, error } = await serviceSupabase().from("bebrave_tree_state").select("height,active_top,active_bottom,revision,completed_count").eq("id", true).single();
  if (error) return Response.json({ error: "The tree snapshot could not be captured." }, { status: 503 });
  return Response.json({ state: treeStateFromRow(data), serverNow:new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
