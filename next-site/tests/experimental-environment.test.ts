import test from "node:test";
import assert from "node:assert/strict";
import { assertDeploymentEnvironment, testModeEnabled, TEST_PROJECT_REF, TEST_SUPABASE_ORIGIN, PRODUCTION_BRANCH, PRODUCTION_SUPABASE_ORIGIN } from "../lib/experimental-environment";

const preview = { VERCEL_ENV:"preview", BEBRAVE_TEST_MODE:"true", BEBRAVE_TEST_PROJECT_REF:TEST_PROJECT_REF, NEXT_PUBLIC_SUPABASE_URL:TEST_SUPABASE_ORIGIN, PRODUCTION_BRANCH, PRODUCTION_SUPABASE_ORIGIN };
test("test bypass requires an exact known project, flag, and nonproduction environment", () => {
  assert.equal(testModeEnabled(preview), true);
  for (const env of [{...preview, VERCEL_ENV:"production"}, {...preview, BEBRAVE_TEST_MODE:"false"}, {...preview, BEBRAVE_TEST_PROJECT_REF:"other"}]) assert.equal(testModeEnabled(env), false);
  for (const url of [`https://evil.test/${TEST_PROJECT_REF}`,`${TEST_SUPABASE_ORIGIN}.evil.test`,`https://user:pass@${TEST_PROJECT_REF}.supabase.co`,`http://${TEST_PROJECT_REF}.supabase.co`,`https://belqlsqnbexwkpmnptyy.supabase.co`]) {
    assert.equal(testModeEnabled({...preview, NEXT_PUBLIC_SUPABASE_URL:url}), false);
    assert.throws(()=>assertDeploymentEnvironment({...preview, NEXT_PUBLIC_SUPABASE_URL:url}));
  }
});
test("unconfigured local visual builds are allowed, production and unconfigured previews fail closed",()=>{
  assert.doesNotThrow(()=>assertDeploymentEnvironment({}));
  assert.doesNotThrow(()=>assertDeploymentEnvironment(preview));
  assert.throws(()=>assertDeploymentEnvironment({VERCEL_ENV:"preview"}));
  assert.throws(()=>assertDeploymentEnvironment({...preview, VERCEL_ENV:"production"}));
});

test("the reviewed production release requires exact production storage and no test flags", () => {
  const release = { VERCEL_ENV: "production", VERCEL_GIT_COMMIT_REF: PRODUCTION_BRANCH, NEXT_PUBLIC_SUPABASE_URL: PRODUCTION_SUPABASE_ORIGIN };
  assert.doesNotThrow(() => assertDeploymentEnvironment(release));
  assert.doesNotThrow(() => assertDeploymentEnvironment({ ...release, VERCEL_GIT_COMMIT_REF: "main" }));
  assert.equal(testModeEnabled(release), false);
  for (const change of [
    { NEXT_PUBLIC_SUPABASE_URL: TEST_SUPABASE_ORIGIN }, { NEXT_PUBLIC_SUPABASE_URL: undefined },
    { NEXT_PUBLIC_SUPABASE_URL: PRODUCTION_SUPABASE_ORIGIN + ".evil.test" },
    { VERCEL_GIT_COMMIT_REF: "experiment/immersive-world-2026-10-09" }, { VERCEL_GIT_COMMIT_REF: undefined },
    { BEBRAVE_TEST_MODE: "true" }, { BEBRAVE_TEST_PROJECT_REF: TEST_PROJECT_REF }, { VERCEL_ENV: "preview" },
  ]) assert.throws(() => assertDeploymentEnvironment({ ...release, ...change }));
});
