import test from "node:test";
import assert from "node:assert/strict";
import { publicPostEmbed } from "../lib/embeds";

test("public social posts get canonical embed URLs without tracking", () => {
  assert.deepEqual(publicPostEmbed("https://www.instagram.com/p/ABC-123/?igsh=tracking"), { provider: "Instagram", source: "https://www.instagram.com/p/ABC-123/", url: "https://www.instagram.com/p/ABC-123/embed/captioned/" });
  assert.equal(publicPostEmbed("https://www.instagram.com/reel/ABC123/")?.provider, "Instagram");
  assert.equal(publicPostEmbed("https://www.threads.net/@zackyc.xyz/post/ABC123/?utm_source=share")?.url, "https://www.threads.com/t/ABC123/embed/");
});
test("unsafe URLs and unrelated paths never create frames", () => {
  for (const url of [null, "not a URL", "http://instagram.com/p/ABC123", "https://instagram.com.evil.example/p/ABC123", "https://user:password@instagram.com/p/ABC123", "https://instagram.com:8443/p/ABC123", "https://instagram.com/zackyc.xyz/", "https://threads.com/login", "https://threads.com/t/ABC123/embed/", "https://localhost/p/ABC123", "https://instagram.com/p/%3Cscript%3E"]) assert.equal(publicPostEmbed(url), null, String(url));
});
