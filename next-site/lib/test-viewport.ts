import { testModeEnabled } from "./experimental-environment";

// A QA viewport, not a site route or navigation item. Only the isolated Preview
// may embed these documents, and only into its own origin with the explicit flag.
export const VIEWPORT_QUERY = "_testViewport";
export const VIEWPORT_ROUTES = ["/", "/creative-works", "/creativeworks", "/events", "/about-me", "/aboutme", "/words-of-folly", "/shoutouts", "/bebrave"] as const;
const widths = new Set([320, 375, 390, 768, 1024]);
const heights = new Set([568, 667, 844, 1024]);

export function testViewportHeaders(env: Record<string, string | undefined>) {
  return testModeEnabled(env) ? VIEWPORT_ROUTES.map(source => ({
    source,
    has: [{ type: "query" as const, key: VIEWPORT_QUERY, value: "true" }],
    headers: [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Content-Security-Policy", value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ],
  })) : [];
}

export function testViewportDocument(params: URLSearchParams, env: Record<string, string | undefined>) {
  if (!testModeEnabled(env)) return null;
  const requested = Number(params.get("width"));
  const width = widths.has(requested) ? requested : 390;
  const requestedHeight = Number(params.get("height"));
  const height = heights.has(requestedHeight) ? `${requestedHeight}px` : "calc(100dvh - 28px)";
  const path = params.get("path") ?? "/";
  const route = VIEWPORT_ROUTES.find(value => value === path) ?? "/";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Zack Cook</title><style>html,body{margin:0;min-height:100%;background:#202824}body{display:grid;justify-content:center;padding:14px;box-sizing:border-box}iframe{display:block;border:0;width:${width}px;height:${height};background:#f6f1e6;box-shadow:0 0 0 1px #62756a}</style></head><body><iframe title="Zack Cook" src="${route}?${VIEWPORT_QUERY}=true"></iframe></body></html>`;
}
