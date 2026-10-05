import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingIncludes: { "/*": ["./public/fonts/geometry/*.json"] },
  // Use the installed TypeScript compiler API, keeping build-time checks on
  // without depending on a separate CLI process for reading tsconfig.
  experimental: { useTypeScriptCli: false, serverActions: { bodySizeLimit: "64kb" } },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Content-Security-Policy",
            // Baseline protections without inline-script exceptions or dynamic
            // nonces. This is not a complete script-src/XSS policy. Curated
            // public posts can embed; other sites cannot frame this website.
            value:
              "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/writing", destination: "/creativeworks", permanent: true },
      { source: "/about", destination: "/aboutme", permanent: true },
      { source: "/bio.html", destination: "/aboutme", permanent: true },
      { source: "/about.html", destination: "/aboutme", permanent: true },
      { source: "/works.html", destination: "/creativeworks", permanent: true },
      { source: "/writing.html", destination: "/creativeworks", permanent: true },
      { source: "/blog/index.html", destination: "/journal", permanent: true },
      { source: "/field-notes.html", destination: "/journal", permanent: true },
      {
        source: "/blog/its-not-too-late.html",
        destination: "/journal/its-not-too-late",
        permanent: true,
      },
      { source: "/beta.html", destination: "/creativeworks", permanent: false },
    ];
  },
};

export default nextConfig;
