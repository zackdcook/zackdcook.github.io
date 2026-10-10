export const bookCopy = {
  headline: "Wanna know when the first edition of my debut novel drops?",
  supporting: "Gimme your email. I’ll send you exactly one email when it does.",
  placeholder: "Email address",
  submit: "Count me in",
  success: "You’re on the list! I’ll email you when the book drops.",
  error: "Something went wrong. Mind trying again?",
} as const;
export const consentVersion = `book-launch.v1\n${bookCopy.headline}\n${bookCopy.supporting}`;
export const bookDismissedKey = "zack.book-launch.dismissed.v1";
export const bookSubscribedKey = "zack.book-launch.subscribed.v1";
export const analyticsOptOutKey = "zack.analytics.opt-out.v1";
export type Placement = "homepage" | "menu";
export function savedChoice(value: unknown) { return value === "true"; }
export function bookVisibility(dismissed: boolean, subscribed: boolean) {
  return { homepage: !dismissed && !subscribed, menu: !subscribed };
}
export function normalizeEmail(value: unknown) {
  if (typeof value !== "string") throw new Error("validation");
  const email = value.trim().toLowerCase();
  const [local, domain, extra] = email.split("@");
  if (extra !== undefined || email.length > 254 || !local || local.length > 64 ||
      !/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/.test(local) || local.startsWith(".") || local.endsWith(".") || local.includes("..") ||
      !domain || domain.length > 253 || !domain.includes(".") || domain.split(".").some(part => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(part))) throw new Error("validation");
  return email;
}
// Deliberately reject free-form URLs/campaign text. Attribution never contains email,
// query strings, fragments, credentials, or arbitrary user-supplied paths.
export function campaign(value: unknown): string | null {
  return typeof value === "string" && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value) ? value.toLowerCase() : null;
}
export function sourcePage(value: unknown) {
  const publicPaths = ["/", "/creative-works", "/creativeworks", "/writing", "/writing/first-novel", "/about-me", "/aboutme", "/about", "/events", "/words-of-folly", "/shoutouts", "/bebrave", "/privacy", "/rss"];
  return typeof value === "string" && publicPaths.includes(value.split(/[?#]/)[0]) ? value.split(/[?#]/)[0] : "/other";
}
export function referral(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(/^[a-z0-9.-]+$/i.test(value) ? `https://${value}` : value);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || !/^[a-z0-9.-]+$/i.test(url.hostname) || !url.hostname.includes(".") || /^(localhost|127\.|192\.168\.|10\.)/.test(url.hostname)) return null;
    // Remove subdomains, which can encode personal identifiers. Public-suffix edge
    // cases are intentionally coarse; this is referral attribution, not identity.
    const labels = url.hostname.toLowerCase().split(".");
    const suffix = labels.slice(-2).join(".");
    return /^(co|com|org|net)\.[a-z]{2}$/.test(suffix) ? labels.slice(-3).join(".") : suffix;
  } catch { return null; }
}
export function country(value: unknown) { return typeof value === "string" && /^[A-Z]{2}$/.test(value) ? value : null; }
export const eventNames = ["$pageview", "book_cta_viewed", "book_cta_dismissed", "book_cta_opened", "book_signup_started", "book_signup_attempted", "book_signup_completed", "book_signup_failed", "visit_engagement"] as const;
export type BookEvent = typeof eventNames[number];
export function safeEventProperties(value: Record<string, unknown>) {
  const result: Record<string, string | boolean | number | null> = {
    schema_version: 1, cta_version: "book-launch.v1", variant: "original",
    page: sourcePage(value.page),
  };
  for (const key of ["utm_source", "utm_medium", "utm_campaign"]) result[key] = campaign(value[key]);
  result.referrer_domain = referral(value.referrer_domain);
  if (value.placement === "homepage" || value.placement === "menu") result.placement = value.placement;
  if (value.theme === "light" || value.theme === "dark") result.theme = value.theme;
  if (value.timeline === "living" || value.timeline === "felled") result.timeline = value.timeline;
  if (["mobile", "tablet", "desktop"].includes(String(value.device_category))) result.device_category = String(value.device_category);
  if (["Safari", "Firefox", "Chrome", "Edge", "Other"].includes(String(value.browser_family))) result.browser_family = String(value.browser_family);
  if (["validation", "challenge", "rate_limit", "unavailable", "network", "request"].includes(String(value.error_category))) result.error_category = String(value.error_category);
  if (typeof value.new_record === "boolean") result.new_record = value.new_record;
  if (typeof value.engaged_seconds === "number" && Number.isFinite(value.engaged_seconds)) result.engaged_seconds = Math.max(0, Math.min(3600, Math.round(value.engaged_seconds / 5) * 5));
  if (value.previous_page) result.previous_page = sourcePage(value.previous_page);
  return result;
}
