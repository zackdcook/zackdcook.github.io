import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      process.env.SITE_LIVE === "true" && process.env.VERCEL_ENV !== "preview"
        ? {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/auth/", "/api/"],
          }
        : { userAgent: "*", disallow: "/" },
    sitemap:
      process.env.SITE_LIVE === "true" && process.env.VERCEL_ENV !== "preview"
        ? "https://zackdcook.com/sitemap.xml"
        : undefined,
  };
}
