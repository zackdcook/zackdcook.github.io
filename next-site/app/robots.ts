import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      process.env.SITE_LIVE === "true"
        ? {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/auth/", "/api/"],
          }
        : { userAgent: "*", disallow: "/" },
    sitemap:
      process.env.SITE_LIVE === "true"
        ? "https://zackdcook.com/sitemap.xml"
        : undefined,
  };
}
