import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Use the installed TypeScript compiler API, keeping build-time checks on
  // without depending on a separate CLI process for reading tsconfig.
  experimental: { useTypeScriptCli: false },
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
            // nonces. This is not a complete script-src/XSS policy. Spotify may
            // still embed its player; other sites cannot frame this website.
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
      { source: "/bio.html", destination: "/about", permanent: true },
      { source: "/about.html", destination: "/about", permanent: true },
      { source: "/works.html", destination: "/writing", permanent: true },
      { source: "/writing.html", destination: "/writing", permanent: true },
      { source: "/blog/index.html", destination: "/journal", permanent: true },
      { source: "/field-notes.html", destination: "/journal", permanent: true },
      {
        source: "/blog/its-not-too-late.html",
        destination: "/journal/its-not-too-late",
        permanent: true,
      },
      { source: "/beta.html", destination: "/writing", permanent: false },
    ];
  },
};

export default nextConfig;
