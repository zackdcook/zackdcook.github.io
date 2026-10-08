import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  experimental: { useTypeScriptCli: false, serverActions: { bodySizeLimit: "64kb" } },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'" },
    ]}];
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/writing", destination: "/creative-works", permanent: true },
      { source: "/about", destination: "/about-me", permanent: true },
      { source: "/bio.html", destination: "/about-me", permanent: true },
      { source: "/about.html", destination: "/about-me", permanent: true },
      { source: "/works.html", destination: "/creative-works", permanent: true },
      { source: "/writing.html", destination: "/creative-works", permanent: true },
      { source: "/blog/index.html", destination: "/words-of-folly", permanent: true },
      { source: "/field-notes.html", destination: "/words-of-folly", permanent: true },
      { source: "/blog/its-not-too-late.html", destination: "/words-of-folly", permanent: true },
      { source: "/beta.html", destination: "/creative-works", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/creative-works", destination: "/creativeworks" },
      { source: "/about-me", destination: "/aboutme" },
    ];
  },
};
export default nextConfig;
