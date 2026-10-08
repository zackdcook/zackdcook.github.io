import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { serviceSupabase } from "@/lib/supabase";
import shoutouts from "@/content/shoutouts.json";

const configured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));

export async function getShoutouts() {
  "use cache";
  cacheLife({ stale: 30, revalidate: 30, expire: 600 });
  cacheTag("shoutouts");
  if (!configured()) return shoutouts;
  const { data } = await serviceSupabase().from("shoutout_suggestions").select("id,name,summary,url").eq("status", "approved").order("approved_at", { ascending: false }).limit(100);
  return [...shoutouts, ...(data || []).map(row => ({ ...row, subtitle: "", note: row.summary, groupName: "" }))];
}
