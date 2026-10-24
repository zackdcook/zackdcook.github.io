import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
mock.module("../components/site-preferences.tsx", { exports: { usePreferences: () => ({ subscribeBook() {}, subscribeNewsletter() {}, bookSubscribed:false, newsletterSubscribed:false, analyticsOptOut: false }) } });
const { BookSignupForm } = await import("../components/book-launch/signup-form.tsx");
const { BookContext } = await import("../components/book-launch/context.ts");
test("both real signup placements initially render an enabled submit without loading verification", () => {
  for (const placement of ["homepage", "menu"] as const) {
    const html = renderToString(createElement(BookContext, { value: { enabled: true, testMode: false, open() {} } },
      createElement(BookSignupForm, { placement, titleId: "test-title", onSuccess() {} })));
    assert.match(html, /type="email"/);
    assert.match(html,/Subscribe to future newsletters, too/);
    assert.match(html,/name="newsletter"/);
    assert.ok(!/name="newsletter"[^>]*checked/.test(html));
    assert.match(html, /type="submit">Count me in/);
    assert.ok(!html.includes('class="human-check"'));
    assert.ok(!html.includes("challenges.cloudflare.com"));
    assert.ok(!html.includes('name="cf-turnstile-response"'));
  }
});
