import { test, mock } from "node:test";
import assert from "node:assert/strict";
const records = new Map<string, Record<string, unknown>>();
let attempts = 0, dbUnavailable = false, inserted: Record<string, unknown> | null = null;
const tasks: (() => Promise<void>)[] = [];
mock.module("server-only", { exports: { default: {} } });
mock.module("../lib/supabase.ts", { exports: {
  serviceSupabase: () => ({
    rpc: async () => ({ data: ++attempts <= 6, error: dbUnavailable ? { code: "unavailable" } : null }),
    from: (table: string) => {
      assert.equal(table, "book_launch_subscribers");
      return { upsert: (row: Record<string, unknown>, options: Record<string, unknown>) => {
        assert.deepEqual(options, { onConflict: "email", ignoreDuplicates: true });
        return { select: async (columns: string) => {
          assert.equal(columns, "id");
          if (dbUnavailable) return { data: null, error: {} };
          const email = String(row.email);
          if (records.has(email)) return { data: [], error: null };
          inserted = row; records.set(email, { ...row, status: "active" });
          return { data: [{ id: "private-record-id" }], error: null };
        } };
      } };
    },
  }),
} });
mock.module("next/server", { exports: { after: (callback: () => Promise<void>) => tasks.push(callback), NextResponse: { json: Response.json } } });
process.env.NEXT_PUBLIC_BOOK_LAUNCH_ENABLED = "true";
process.env.TURNSTILE_SECRET_KEY = "unit-test-only";
process.env.BOOK_LAUNCH_RATE_LIMIT_KEY = "unit-test-only-key".repeat(3);
process.env.VERCEL = "1";
process.env.BOOK_ANALYTICS_ENABLED = "false";
const { POST } = await import("../app/api/book-launch/route.ts");
const originalFetch = globalThis.fetch;
let challenge = "valid", verified = 0;
globalThis.fetch = (async (url: string | URL | Request) => {
  assert.equal(String(url), "https://challenges.cloudflare.com/turnstile/v0/siteverify");
  verified++;
  return Response.json({ success: challenge === "valid", hostname: challenge === "wrong-host" ? "evil.example" : "zackdcook.com", action: challenge === "wrong-action" ? "bebrave" : "book_launch" });
}) as typeof fetch;
function request(overrides: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return new Request("https://zackdcook.com/api/book-launch", { method: "POST", headers: {
    origin: "https://zackdcook.com", "content-type": "application/json", "x-vercel-forwarded-for": "192.0.2.1", ...headers,
  }, body: JSON.stringify({ email: "Reader@Example.com", website: "", token: "single-use-test-token", placement: "homepage", page: "/?email=private", referrer: "https://news.example.com/?secret=1", utm_source: "book-drop", ...overrides }) });
}
test("signup route accepts one normalized record and gives identical responses to active and suppressed duplicates", async () => {
  attempts = 0;
  const first = await POST(request());
  assert.equal(first.status, 200);
  const response = await first.json();
  assert.deepEqual(response, { accepted: true });
  assert.equal(records.size, 1);
  assert.equal(inserted?.email, "reader@example.com");
  assert.equal(inserted?.source_page, "/");
  assert.equal(inserted?.referrer_domain, "example.com");
  const original = structuredClone(records.get("reader@example.com"));
  assert.deepEqual(await (await POST(request())).json(), response);
  assert.deepEqual(records.get("reader@example.com"), original);
  records.get("reader@example.com")!.status = "suppressed";
  const suppressed = structuredClone(records.get("reader@example.com"));
  assert.deepEqual(await (await POST(request({ placement: "menu" }))).json(), response);
  assert.deepEqual(records.get("reader@example.com"), suppressed);
  assert.ok(!JSON.stringify(response).includes("record"));
});
test("origin, body size, honeypot, validation, and challenge failures cannot insert records", async () => {
  attempts = 0;
  const before = records.size;
  assert.equal((await POST(request({}, {origin: "https://evil.example"}))).status, 400);
  assert.equal((await POST(request({token:"x".repeat(9000)}))).status, 400);
  assert.equal((await POST(request({website:"bot"}))).status, 400);
  assert.equal((await POST(request({email:"bad"}))).status, 400);
  assert.equal((await POST(request({placement:"private"}))).status, 400);
  for (const state of ["expired", "wrong-host", "wrong-action"]) {
    attempts = 0; challenge = state;
    assert.equal((await POST(request({email:"other@example.com"}))).status, 400);
  }
  challenge = "valid";
  assert.equal(records.size, before);
});
test("distributed rate limit fails closed before verifying Turnstile or writing subscribers", async () => {
  attempts = 6; const previousChecks = verified;
  const result = await POST(request({ email: "other@example.com" }));
  assert.equal(result.status, 429);
  assert.equal((await result.json()).category, "rate_limit");
  assert.equal(verified, previousChecks);
  assert.equal(records.has("other@example.com"), false);
  attempts = 0; dbUnavailable = true;
  assert.equal((await POST(request())).status, 503);
  dbUnavailable = false;
});
test("disabled signup fails closed and no delivery provider is called", async () => {
  process.env.NEXT_PUBLIC_BOOK_LAUNCH_ENABLED = "false";
  assert.equal((await POST(request())).status, 503);
  process.env.NEXT_PUBLIC_BOOK_LAUNCH_ENABLED = "true";
  for (const task of tasks) await task();
  globalThis.fetch = originalFetch;
});
