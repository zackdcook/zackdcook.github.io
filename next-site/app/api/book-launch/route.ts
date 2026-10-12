import { NextResponse, after } from "next/server";
import { serviceSupabase } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";
import { assertBookOrigin, captureAccepted, rateLimit, requestCountry, signupEnabled, signupTestMode, smallJson } from "@/lib/book-launch/server";
import { bookCopy, campaign, consentVersion, normalizeEmail, referral, sourcePage } from "@/lib/book-launch/shared";

export async function POST(request: Request) {
  let category = "request";
  try {
    assertBookOrigin(request);
    if (!signupEnabled()) throw new Error("unavailable");
    const body = await smallJson(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("request");
    await rateLimit(request);
    if (body.website !== "") throw new Error("request");
    category = "validation";
    const email = normalizeEmail(body.email);
    if (body.placement !== "homepage" && body.placement !== "menu") throw new Error("validation");
    category = "challenge";
    if (typeof body.token !== "string") throw new Error("challenge");
    if (!signupTestMode()) await verifyTurnstile(body.token, new URL(request.headers.get("origin")!).hostname, "book_launch");
    category = "unavailable";
    const { data, error } = await serviceSupabase().from("book_launch_subscribers").upsert({
      email, consent_at: new Date().toISOString(), consent_version: consentVersion,
      source_page: sourcePage(body.page), source_placement: body.placement,
      referrer_domain: referral(body.referrer), utm_source: campaign(body.utm_source),
      utm_medium: campaign(body.utm_medium), utm_campaign: campaign(body.utm_campaign),
      country: requestCountry(request),
    }, { onConflict: "email", ignoreDuplicates: true }).select("id");
    if (error) throw new Error("unavailable");
    // ON CONFLICT DO NOTHING: no existing consent/status/attribution is changed.
    // Identical success for active, suppressed, and notified duplicates.
    const newRecord = Boolean(data?.length);
    after(() => captureAccepted(request, {
      ...body, referrer_domain: body.referrer,
    }, newRecord, body.analytics_opt_out !== false));
    return NextResponse.json({ accepted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && ["request", "validation", "challenge", "rate_limit", "unavailable"].includes(error.message)) category = error.message;
    console.warn("book_launch_signup", { category });
    return NextResponse.json({ accepted: false, message: bookCopy.error, category }, {
      status: category === "rate_limit" ? 429 : category === "unavailable" ? 503 : 400,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
