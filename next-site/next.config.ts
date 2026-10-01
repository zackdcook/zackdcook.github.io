import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
