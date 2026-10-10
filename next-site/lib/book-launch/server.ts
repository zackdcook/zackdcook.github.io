import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { serviceSupabase } from "@/lib/supabase";
import { country, safeEventProperties } from "./shared";
import { assertExperimentalEnvironment, isTestStorage, testModeEnabled } from "../experimental-environment";

export function signupEnabled() {
  assertExperimentalEnvironment(process.env);
  return process.env.NEXT_PUBLIC_BOOK_LAUNCH_ENABLED === "true";
}
export function signupTestMode() { return testModeEnabled(process.env); }
export function assertBookOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = [process.env.SITE_URL, "https://zackdcook.com", "https://www.zackdcook.com", "https://zackyc.xyz", "https://www.zackyc.xyz"];
  if (process.env.VERCEL_ENV === "preview") {
    for (const key of ["VERCEL_URL", "VERCEL_BRANCH_URL"]) {
      const host = process.env[key];
      if (host) allowed.push(new URL(`https://${host}`).origin);
    }
  }
  if (process.env.NODE_ENV !== "production") allowed.push("http://localhost:3000", "http://127.0.0.1:3000");
  if (!origin || !allowed.includes(origin) || request.headers.get("sec-fetch-site") === "cross-site") throw new Error("request");
}
export function requestCountry(request: Request) {
  return process.env.VERCEL === "1" ? country(request.headers.get("x-vercel-ip-country")) : null;
}
export function analyticsAllowed(request: Request) {
  if (process.env.VERCEL_ENV !== "production" || isTestStorage(process.env)) return false;
  // Fail closed outside the initially reviewed US rollout; an absent trusted
  // region also disables collection. Browser privacy signals override this.
  return process.env.BOOK_ANALYTICS_ENABLED === "true" && requestCountry(request) === "US" &&
    request.headers.get("sec-gpc") !== "1" && request.headers.get("dnt") !== "1";
}
export async function rateLimit(request: Request) {
  const key = process.env.BOOK_LAUNCH_RATE_LIMIT_KEY;
  if (!key || key.length < 32) throw new Error("unavailable");
  const ip = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() : "local";
  if (!ip) throw new Error("request");
  const window = Math.floor(Date.now() / 600000);
  const hash = createHmac("sha256", key).update(`book-launch:${window}:${ip}`).digest("hex");
  const { data, error } = await serviceSupabase().rpc("book_launch_check_limit", { p_bucket: hash });
  if (error) throw new Error("unavailable");
  if (data !== true) throw new Error("rate_limit");
}
export async function captureAccepted(request: Request, properties: Record<string, unknown>, newRecord: boolean, optedOut: boolean) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (optedOut || !analyticsAllowed(request) || !token || !["https://us.i.posthog.com", "https://eu.i.posthog.com"].includes(host || "")) return;
  try {
    // Independent event identity: never the subscriber UUID/email, request IP,
    // rate-limit bucket, or a browser analytics identifier. No person profile.
    const response = await fetch(`${host}/i/v0/e/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: token, event: "book_signup_completed", properties: {
        ...safeEventProperties(properties), new_record: newRecord, distinct_id: randomUUID(),
        $process_person_profile: false, $geoip_disable: true, $ip: null,
      } }), cache: "no-store", signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) console.warn("book_launch_analytics", { category: "delivery" });
  } catch { console.warn("book_launch_analytics", { category: "delivery" }); }
}

export async function smallJson(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("request");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("request");
  const decoder = new TextDecoder();
  let bytes = 0, text = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8192) { await reader.cancel(); throw new Error("request"); }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } catch { throw new Error("request"); }
  finally { reader.releaseLock(); }
}
