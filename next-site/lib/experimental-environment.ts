/** Public identifiers only. This branch is deliberately unable to use production storage. */
export const EXPERIMENTAL_BRANCH = "experiment/immersive-world-2026-10-09";
export const TEST_PROJECT_REF = "qkkgcoejkqvthbjcldcw";
export const TEST_SUPABASE_ORIGIN = `https://${TEST_PROJECT_REF}.supabase.co`;

type Environment = Record<string, string | undefined>;

export function isTestStorage(env: Environment) {
  try {
    const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL || "");
    return url.origin === TEST_SUPABASE_ORIGIN && !url.username && !url.password
      && (url.pathname === "/" || url.pathname === "") && !url.search && !url.hash;
  } catch {
    return false;
  }
}

export function assertExperimentalEnvironment(env: Environment) {
  if (env.VERCEL_ENV === "production") throw new Error("Experimental branch cannot deploy to production.");
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
