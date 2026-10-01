import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SITE_LIVE !== "true") return [];
  return [
    "/",
    "/writing",
    "/journal",
    "/journal/its-not-too-late",
    "/commonplace",
    "/about",
    "/events",
  ].map((path) => ({
    url: `https://zackdcook.com${path}`,
    changeFrequency: path === "/commonplace" ? "weekly" : "monthly",
  }));
}
