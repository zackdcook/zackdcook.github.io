import { test } from "node:test";
import assert from "node:assert/strict";
import { bookVisibility, savedChoice, normalizeEmail, campaign, referral, sourcePage, safeEventProperties, bookCopy, consentVersion } from "../lib/book-launch/shared";

test("homepage and menu retain the three independent visitor states on repeated visits", () => {
  for (let visit = 0; visit < 4; visit++) {
    assert.deepEqual(bookVisibility(savedChoice(null), savedChoice(null)), { homepage: true, menu: true });
    assert.deepEqual(bookVisibility(savedChoice("true"), false), { homepage: false, menu: true });
    assert.deepEqual(bookVisibility(false, savedChoice("true")), { homepage: false, menu: false });
    assert.deepEqual(bookVisibility(true, true), { homepage: false, menu: false });
  }
  for (const value of ["false", "1", "{}", "yes", null, true]) assert.equal(savedChoice(value), false);
});
test("email normalization deduplicates case and whitespace without removing meaningful characters", () => {
  assert.equal(normalizeEmail("  Zack+book@Example.COM  "), "zack+book@example.com");
  for (const email of [null, [], {}, "", "@example.com", "zack@example", "zack@example..com", "zack@-example.com", "zack@example.com@evil.com", "zack\n@example.com", ".zack@example.com", "zack..cook@example.com", "a".repeat(65) + "@example.com"]) assert.throws(() => normalizeEmail(email));
});
test("attribution excludes personal text, arbitrary paths, executable schemes, and URL secrets", () => {
  assert.equal(campaign("Book_Drop-1"), "book_drop-1");
  for (const value of ["zack@example.com", "hello world", "token=secret", "https://example.com", "x".repeat(65)]) assert.equal(campaign(value), null);
  assert.equal(referral("https://user-id.search.example.com/?email=private@example.com#secret"), "example.com");
  assert.equal(referral("https://news.example.co.uk/article"), "example.co.uk");
  for (const value of ["https://secret@example.com/", "javascript:evil()", "http://127.0.0.1", "https://localhost"]) assert.equal(referral(value), null);
  assert.equal(sourcePage("/events?email=private@example.com"), "/events");
  assert.equal(sourcePage("/admin/book-launch"), "/other");
});
test("analytics allowlist cannot transmit subscriber identities or sensitive URL parameters", () => {
  const properties = safeEventProperties({ page: "/?email=zack@example.com", email: "private@example.com", subscriber_id: "secret", distinct_id: "secret", token: "secret", $set: { email: "secret" }, browser_family: "custom-user-agent", utm_source: "email@example.com", placement: "menu", new_record: false, referrer_domain: "https://google.com?q=secret" });
  const json = JSON.stringify(properties);
  assert.ok(!json.includes("secret")); assert.ok(!json.includes("@"));
  assert.equal(properties.page, "/"); assert.equal(properties.placement, "menu"); assert.equal(properties.new_record, false);
  assert.equal(properties.browser_family, undefined);
  assert.equal(safeEventProperties({engaged_seconds: -500}).engaged_seconds, 0);
  assert.equal(safeEventProperties({engaged_seconds: 99999}).engaged_seconds, 3600);
});
test("consent evidence contains the approved promise verbatim", () => {
  assert.equal(bookCopy.headline, "Wanna know when the first edition of my debut novel drops?");
  assert.equal(bookCopy.supporting, "Gimme your email. I’ll send you exactly one email when it does.");
  assert.equal(consentVersion, `book-launch.v1\n${bookCopy.headline}\n${bookCopy.supporting}`);
});
