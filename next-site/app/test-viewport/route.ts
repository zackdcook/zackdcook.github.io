import { testViewportDocument } from "@/lib/test-viewport";

export function GET(request: Request) {
  const document = testViewportDocument(new URL(request.url).searchParams, process.env);
  return new Response(document, {
    status: document ? 200 : 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-src 'self'; frame-ancestors 'none'; base-uri 'none'",
    },
  });
}
