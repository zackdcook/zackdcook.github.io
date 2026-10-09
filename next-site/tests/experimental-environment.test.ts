import test from "node:test";
import assert from "node:assert/strict";
import { assertExperimentalEnvironment, testModeEnabled, TEST_PROJECT_REF, TEST_SUPABASE_ORIGIN } from "../lib/experimental-environment";

const preview = { VERCEL_ENV:"preview", BEBRAVE_TEST_MODE:"true", BEBRAVE_TEST_PROJECT_REF:TEST_PROJECT_REF, NEXT_PUBLIC_SUPABASE_URL:TEST_SUPABASE_ORIGIN };
test("test bypass requires an exact known project, flag, and nonproduction environment", () => {
  assert.equal(testModeEnabled(preview), true);
  for (const env of [{...preview, VERCEL_ENV:"production"}, {...preview, BEBRAVE_TEST_MODE:"false"}, {...preview, BEBRAVE_TEST_PROJECT_REF:"other"}]) assert.equal(testModeEnabled(env), false);
  for (const url of [`https://evil.test/${TEST_PROJECT_REF}`,`${TEST_SUPABASE_ORIGIN}.evil.test`,`https://user:pass@${TEST_PROJECT_REF}.supabase.co`,`http://${TEST_PROJECT_REF}.supabase.co`,`https://belqlsqnbexwkpmnptyy.supabase.co`]) {
    assert.equal(testModeEnabled({...preview, NEXT_PUBLIC_SUPABASE_URL:url}), false);
    assert.throws(()=>assertExperimentalEnvironment({...preview, NEXT_PUBLIC_SUPABASE_URL:url}));
  }
});
test("unconfigured local visual builds are allowed, production and unconfigured previews fail closed",()=>{
  assert.doesNotThrow(()=>assertExperimentalEnvironment({}));
  assert.doesNotThrow(()=>assertExperimentalEnvironment(preview));
  assert.throws(()=>assertExperimentalEnvironment({VERCEL_ENV:"preview"}));
  assert.throws(()=>assertExperimentalEnvironment({...preview, VERCEL_ENV:"production"}));
});
