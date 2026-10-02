import type { MetadataRoute } from "next";
import { publishedJournalPosts, site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SITE_LIVE !== "true") return [];
  return [
    "/",
    "/writing",
    "/journal",
    ...publishedJournalPosts().map(post => `/journal/${post.slug}`),
    "/commonplace",
    "/about",
    "/events",
    "/shoutouts",
  ].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: path === "/commonplace" ? "weekly" : "monthly",
  }));
}
