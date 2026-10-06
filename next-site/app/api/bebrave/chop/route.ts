import { serviceSupabase } from "@/lib/supabase";
import { beBraveConfigured, requestContext, visitorRow } from "@/lib/bebrave-server";
import { BEBRAVE_COOLDOWN_MS } from "@/lib/bebrave-types";

export async function POST(request: Request) {
  if (!beBraveConfigured()) {
    return Response.json({ error: "Be Brave is not configured." }, { status: 503 });
  }
  try {
    const context = await requestContext(request, true);
    if (!context) throw new Error("This browser could not record the chop.");

    const client = serviceSupabase();
    let visitor = await visitorRow(context.visitorHash);
    if (!visitor) {
      const created = await client
        .from("bebrave_visitors")
        .insert({ visitor_hash: context.visitorHash, browser_hint: context.browserHint })
        .select("id,visitor_hash,last_carved_at,next_carve_at")
        .single();
      if (created.error) throw created.error;
      visitor = created.data;
    }

    const now = new Date();
    const existing = visitor.next_carve_at ? Date.parse(visitor.next_carve_at) : 0;

    // Chopping starts the same 28-day interaction cooldown as carving.
    // Re-chopping during an existing cooldown never extends or resets it.
    if (!Number.isFinite(existing) || existing <= now.getTime()) {
      const next = new Date(now.getTime() + BEBRAVE_COOLDOWN_MS).toISOString();
      const updated = await client
        .from("bebrave_visitors")
        .update({ last_carved_at: now.toISOString(), next_carve_at: next, last_seen_at: now.toISOString() })
        .eq("id", visitor.id)
        .select("next_carve_at")
        .single();
      if (updated.error) throw updated.error;
      return Response.json({ cooldown: updated.data.next_carve_at, serverNow: now.toISOString() }, { headers: { "Cache-Control": "no-store" } });
    }

    return Response.json({ cooldown: visitor.next_carve_at, serverNow: now.toISOString() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "The chop could not be recorded." }, { status: 400 });
  }
}
