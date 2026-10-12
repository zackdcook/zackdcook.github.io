/** Public identifiers only. Preview and production storage must never cross. */
export const EXPERIMENTAL_BRANCH = "experiment/immersive-world-2026-10-09";
export const PRODUCTION_BRANCH = "release/immersive-world-2026-10-12";
export const PRODUCTION_SUPABASE_ORIGIN = "https://belqlsqnbexwkpmnptyy.supabase.co";
export const TEST_PROJECT_REF = "qkkgcoejkqvthbjcldcw";
export const TEST_SUPABASE_ORIGIN = `https://${TEST_PROJECT_REF}.supabase.co`;

type Environment = Record<string, string | undefined>;

function isStorage(env: Environment, origin: string) {
  try {
    const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL || "");
    return url.origin === origin && !url.username && !url.password
      && (url.pathname === "/" || url.pathname === "") && !url.search && !url.hash;
  } catch {
    return false;
  }
}

export function isTestStorage(env: Environment) { return isStorage(env, TEST_SUPABASE_ORIGIN); }

export function assertDeploymentEnvironment(env: Environment) {
  if (env.VERCEL_ENV === "production") {
    if (!["main", PRODUCTION_BRANCH].includes(env.VERCEL_GIT_COMMIT_REF ?? "")) {
      throw new Error("Only the reviewed release branch or main may deploy to production.");
    }
    if (!isStorage(env, PRODUCTION_SUPABASE_ORIGIN) || env.BEBRAVE_TEST_MODE === "true" || env.BEBRAVE_TEST_PROJECT_REF) {
      throw new Error("Production requires production storage with all test flags absent.");
    }
    return;
  }
  if (env.NEXT_PUBLIC_SUPABASE_URL && !isTestStorage(env)) {
    throw new Error("Experimental branch requires the isolated test database.");
  }
  if (env.VERCEL_ENV === "preview" && !isTestStorage(env)) {
    throw new Error("Configure isolated test storage before deploying this preview.");
  }
}

export function testModeEnabled(env: Environment) {
  return env.BEBRAVE_TEST_MODE === "true"
    && env.BEBRAVE_TEST_PROJECT_REF === TEST_PROJECT_REF
    && isTestStorage(env)
    && (env.VERCEL_ENV === "preview" || (!env.VERCEL && env.NODE_ENV === "development"));
}
