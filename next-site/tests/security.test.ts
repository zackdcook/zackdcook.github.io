import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSharedUrl,
  safeReturnPath,
  validateEntry,
} from "../lib/validation";
import { sealToken, openToken, matchingState } from "../lib/token-crypto";
import nextConfig from "../next.config";

test("all routes receive baseline browser security headers", async () => {
  assert.ok(nextConfig.headers);
  const rules = await nextConfig.headers();
  const rule = rules.find((item) => item.source === "/:path*");
  assert.ok(rule);
  const headers = Object.fromEntries(
    rule.headers.map(({ key, value }) => [key, value]),
  );
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["Referrer-Policy"], "strict-origin-when-cross-origin");
  assert.match(headers["Permissions-Policy"], /camera=\(\)/);
  assert.match(headers["Permissions-Policy"], /microphone=\(\)/);
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.match(headers["Content-Security-Policy"], /object-src 'none'/);
  assert.match(headers["Content-Security-Policy"], /form-action 'self'/);
});

test("shared links accept the iOS text format and remove tracking", () => {
  assert.equal(
    normalizeSharedUrl(
      "Look at this\nhttps://www.instagram.com/p/ABC123/?igsh=tracking&utm_source=share",
    ),
    "https://www.instagram.com/p/ABC123/",
  );
});

test("sharing refuses executable URLs, credentials, and local addresses", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://example.com/",
    "https://user:password@example.com/",
    "https://127.0.0.1/",
    "https://localhost/",
    "https://local.test:3000/",
    "https://router.local/",
  ])
    assert.throws(() => normalizeSharedUrl(url));
});

test("login return paths cannot escape onto another origin", () => {
  for (const path of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\n/evil.example",
    "/%2fevil.example",
    "/%5cevil.example",
    "/%0a/evil.example",
  ])
    assert.equal(safeReturnPath(path), "/admin");
  assert.equal(
    safeReturnPath("/admin/share?url=https%3A%2F%2Fexample.com"),
    "/admin/share?url=https%3A%2F%2Fexample.com",
  );
});

test("a shared entry cannot inject its own published status or category", () => {
  assert.throws(() =>
    validateEntry({
      url: "https://example.com",
      title: "Title",
      category: "admin",
    }),
  );
  assert.equal(
    validateEntry({
      url: "https://example.com",
      title: "Title",
      category: "reading",
      status: "admin",
    }).status,
    "published",
  );
});

test("integration tokens are authenticated ciphertext and reject tampering", () => {
  const key = "a".repeat(64);
  const original = {
    refreshToken: "private-test-value",
    accessToken: "temporary-test-value",
  };
  const sealed = sealToken(original, key);
  assert.ok(!sealed.includes(original.refreshToken));
  assert.deepEqual(openToken(sealed, key), original);
  assert.throws(() => openToken(sealed, "b".repeat(64)));
  const parts = sealed.split(".");
  parts[2] = Buffer.from("tampered").toString("base64url");
  assert.throws(() => openToken(parts.join("."), key));
});

test("Spotify state must match a nonempty value exactly", () => {
  assert.ok(matchingState("valid-state", "valid-state"));
  assert.ok(!matchingState("valid-state", "invalid-state"));
  assert.ok(!matchingState("", ""));
});
