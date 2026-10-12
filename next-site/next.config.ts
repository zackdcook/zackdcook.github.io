import type { NextConfig } from "next";
import { assertDeploymentEnvironment } from "./lib/experimental-environment";
import { testViewportHeaders } from "./lib/test-viewport";
import { canonicalRedirects } from "./lib/canonical-routes";

assertDeploymentEnvironment(process.env);

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
    ]}, ...testViewportHeaders(process.env)];
  },
  async redirects() {
    return canonicalRedirects;
  },
};
export default nextConfig;
