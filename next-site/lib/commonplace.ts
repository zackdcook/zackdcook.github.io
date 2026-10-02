import "server-only";
import { createClient } from "@supabase/supabase-js";
import { personalEntries, type CommonplaceEntry } from "@/content/site";
import { authConfigured } from "@/lib/supabase";
import { cacheLife, cacheTag } from "next/cache";

export async function getCommonplace(): Promise<CommonplaceEntry[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });
  cacheTag("commonplace");
  if (!authConfigured()) return personalEntries;
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, options) =>
          fetch(url, {
            ...options,
            signal: AbortSignal.timeout(5000),
            next: { revalidate: 60 },
          }),
      },
    },
  );
  try {
    const { data, error } = await client
      .from("commonplace_entries")
      .select("id,title,note,category,source_url,creator,image_url,created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(50);
    return error
      ? personalEntries
      : [...(data as CommonplaceEntry[]), ...personalEntries];
  } catch {
    return personalEntries;
  }
}
