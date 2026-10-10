"use client";
import type { PostHog } from "posthog-js";
import { analyticsOptOutKey, campaign, referral, safeEventProperties, sourcePage, type BookEvent } from "./shared";
let client: PostHog | null = null;
let visitAttribution: { referrer: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null } | null = null;
export function setAnalyticsClient(value: PostHog | null) { client = value; }
export function privacySignal() {
  return navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}
export function optedOut() {
  try { return localStorage.getItem(analyticsOptOutKey) === "true" || privacySignal(); } catch { return true; }
}
export function attribution() {
  const params = new URLSearchParams(location.search);
  // Keep only coarse acquisition values in memory while this tab is open.
  // Navigation must not erase the campaign that led to a menu signup.
  visitAttribution ??= {
    referrer: referral(document.referrer),
    utm_source: campaign(params.get("utm_source")), utm_medium: campaign(params.get("utm_medium")), utm_campaign: campaign(params.get("utm_campaign")),
  };
  const ua = navigator.userAgent;
  return {
    page: sourcePage(location.pathname), ...visitAttribution,
    theme: document.documentElement.dataset.theme,
    timeline: document.documentElement.dataset.timeline,
    device_category: /iPad|Tablet/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)) ? "tablet" : /Mobile|Android|iPhone/i.test(ua) ? "mobile" : "desktop",
    browser_family: /Edg/i.test(ua) ? "Edge" : /Firefox|FxiOS/i.test(ua) ? "Firefox" : /Chrome|CriOS/i.test(ua) ? "Chrome" : /Safari/i.test(ua) ? "Safari" : "Other",
  };
}
export function bookEvent(event: BookEvent, properties: Record<string, unknown> = {}) {
  if (!client || optedOut() || event === "book_signup_completed" || /^\/(admin|login|auth|api)(\/|$)/.test(location.pathname)) return false;
  const context = attribution();
  client.capture(event, safeEventProperties({ ...context, referrer_domain: context.referrer, ...properties }));
  return true;
}
