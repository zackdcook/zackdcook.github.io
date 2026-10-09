import test from "node:test";
import assert from "node:assert/strict";
import { TEST_PROJECT_REF, TEST_SUPABASE_ORIGIN } from "../lib/experimental-environment";
import { testViewportDocument, testViewportHeaders, VIEWPORT_ROUTES } from "../lib/test-viewport";

const preview = { VERCEL_ENV:"preview", BEBRAVE_TEST_MODE:"true", BEBRAVE_TEST_PROJECT_REF:TEST_PROJECT_REF, NEXT_PUBLIC_SUPABASE_URL:TEST_SUPABASE_ORIGIN };
test("responsive harness and same-origin framing exceptions require isolated test mode", () => {
  for (const env of [{}, {...preview, VERCEL_ENV:"production"}, {...preview, BEBRAVE_TEST_MODE:"false"}, {...preview, NEXT_PUBLIC_SUPABASE_URL:"https://belqlsqnbexwkpmnptyy.supabase.co"}]) {
    assert.equal(testViewportDocument(new URLSearchParams(), env), null);
    assert.deepEqual(testViewportHeaders(env), []);
  }
  const headers = testViewportHeaders(preview);
  assert.equal(headers.length, VIEWPORT_ROUTES.length);
  for (const value of headers) {
    assert.deepEqual(value.has, [{type:"query",key:"_testViewport",value:"true"}]);
    assert.equal(value.headers[0].value, "SAMEORIGIN");
    assert.ok(value.headers[1].value.includes("frame-ancestors 'self'"));
    assert.ok(!value.source.includes("admin") && !value.source.includes("api"));
  }
});
test("harness allows only bounded viewport sizes and exact same-origin site paths", () => {
  const mobile = testViewportDocument(new URLSearchParams({width:"390",path:"/events"}), preview)!;
  assert.ok(mobile.includes("width:390px"));
  assert.ok(mobile.includes('src="/events?_testViewport=true"'));
  for (const path of ['https://evil.test', '//evil.test', '/admin', '/?x=" onload="alert(1)', '/test-viewport']) {
    const html = testViewportDocument(new URLSearchParams({width:"100000",path}), preview)!;
    assert.ok(html.includes('src="/?_testViewport=true"'));
    assert.ok(html.includes("width:390px"));
    assert.ok(!html.includes(path));
  }
});
