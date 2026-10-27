import { NextResponse, after } from "next/server";
import { serviceSupabase } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";
import { assertBookOrigin, captureAccepted, rateLimit, requestCountry, signupEnabled, signupTestMode, smallJson } from "@/lib/book-launch/server";
import { bookCopy, campaign, consentVersion, newsletterConsentVersion, subscriptionChoices, normalizeEmail, referral, sourcePage } from "@/lib/book-launch/shared";

export async function POST(request: Request) {
  let category = "request";
  try {
    assertBookOrigin(request);
    const body = await smallJson(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("request");
    if (body.action !== "unsubscribe_newsletter" && !signupEnabled()) throw new Error("unavailable");
    await rateLimit(request);
    if (body.website !== "") throw new Error("request");
    if (body.action === "unsubscribe_newsletter") {
      if (typeof body.unsubscribe_token !== "string" || !/^[a-f0-9]{64}$/.test(body.unsubscribe_token)) throw new Error("validation");
      const { error } = await serviceSupabase().from("newsletter_subscribers").update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
        .eq("unsubscribe_token", body.unsubscribe_token).eq("status", "active");
      if (error) throw new Error("unavailable");
      // Generic and idempotent; never reveal an address or membership.
      return NextResponse.json({ accepted: true }, { headers: { "Cache-Control": "no-store" } });
    }
    if (body.action !== undefined) throw new Error("validation");
    category = "validation";
    const email = normalizeEmail(body.email);
    const choices = subscriptionChoices(body.book, body.newsletter);
    if (body.placement !== "homepage" && body.placement !== "menu") throw new Error("validation");
    category = "challenge";
    if (typeof body.token !== "string") throw new Error("challenge");
    if (!signupTestMode()) await verifyTurnstile(body.token, new URL(request.headers.get("origin")!).hostname, "book_launch");
    category = "unavailable";
    const { data, error } = await serviceSupabase().rpc("register_email_subscriptions", {
      p_email: email, p_book: choices.book, p_newsletter: choices.newsletter,
      p_book_consent: consentVersion, p_newsletter_consent: newsletterConsentVersion,
      p_metadata: { page: sourcePage(body.page), placement: body.placement,
        referrer_domain: referral(body.referrer), utm_source: campaign(body.utm_source),
        utm_medium: campaign(body.utm_medium), utm_campaign: campaign(body.utm_campaign), country: requestCountry(request) },
    });
    if (error) throw new Error("unavailable");
    // Duplicates retain their original consent, status and attribution.
    // Only the requested success footnote distinguishes a repeated book signup.
    const newRecord = data?.book_added === true;
    if (choices.book) after(() => captureAccepted(request, {
      ...body, referrer_domain: body.referrer,
    }, newRecord, body.analytics_opt_out !== false));
    return NextResponse.json({ accepted: true, already_subscribed: choices.book && !newRecord }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && ["request", "validation", "challenge", "rate_limit", "unavailable"].includes(error.message)) category = error.message;
    console.warn("book_launch_signup", { category });
    return NextResponse.json({ accepted: false, message: bookCopy.error, category }, {
      status: category === "rate_limit" ? 429 : category === "unavailable" ? 503 : 400,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
