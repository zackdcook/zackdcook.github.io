import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { shareRecords } from "@/lib/page-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SITE_LIVE !== "true" || process.env.VERCEL_ENV === "preview") return [];
  const paths=[...new Set([...shareRecords.map(record=>record.path),"/privacy","/rss"])];
  return paths.map(path => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
  }));
}
