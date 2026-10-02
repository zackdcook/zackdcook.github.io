import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { shareRecords } from "@/lib/page-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SITE_LIVE !== "true" || process.env.VERCEL_ENV === "preview") return [];
  return shareRecords.map(({ path }) => ({
    url: `${site.url}${path}`,
    changeFrequency: path === "/commonplace" ? "weekly" : "monthly",
  }));
}
