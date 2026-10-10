"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/components/site-preferences";
import { bookEvent, optedOut, setAnalyticsClient } from "@/lib/book-launch/analytics";
import { eventNames, safeEventProperties, sourcePage } from "@/lib/book-launch/shared";
export function PrivacyAnalytics() {
  const { analyticsOptOut, hydrated } = usePreferences();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const previous = useRef<string | null>(null);
  useEffect(() => {
    setReady(false); setAnalyticsClient(null);
    if (!hydrated || analyticsOptOut || optedOut()) return;
    let cancelled = false;
    const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!token || !["https://us.i.posthog.com", "https://eu.i.posthog.com"].includes(host || "")) return;
    async function initialize() {
      try {
        const response = await fetch("/api/analytics/config", { cache: "no-store" });
        if (!response.ok || !(await response.json()).enabled || cancelled || optedOut()) return;
        const { PostHog } = await import("posthog-js");
        if (cancelled || optedOut()) return;
        const instance = new PostHog();
        instance.init(token!, {
          api_host: host, cookieless_mode: "always", person_profiles: "never",
          persistence: "memory", disable_persistence: true, autocapture: false,
          capture_pageview: false, capture_pageleave: false, disable_session_recording: true,
          capture_heatmaps: false, capture_performance: false, capture_dead_clicks: false,
          capture_exceptions: false, rageclick: false, advanced_enable_surveys: false,
          advanced_disable_flags: true, advanced_disable_feature_flags: true,
          ip: false, request_batching: false, respect_dnt: true,
          before_send: event => {
            if (!event || optedOut() || !eventNames.includes(event.event as typeof eventNames[number])) return null;
            const safe = safeEventProperties(event.properties);
            // The SDK's cookieless transport marker and placeholder are required
            // for ingestion; everything else comes from our explicit allowlist.
            event.properties = { ...safe, distinct_id: event.properties.distinct_id,
              $cookieless_mode: event.properties.$cookieless_mode, token, $process_person_profile: false, $geoip_disable: true,
              $current_url: `${location.origin}${sourcePage(location.pathname)}`,
              $lib: "web", $lib_version: event.properties.$lib_version, $ip: null,
              $host: location.hostname, $pathname: sourcePage(location.pathname),
            };
            return event;
          },
          loaded: () => { if (!cancelled) { setAnalyticsClient(instance); setReady(true); window.dispatchEvent(new Event("book-analytics-ready")); } },
        });
      } catch { /* Analytics availability never blocks signup or navigation. */ }
    }
    void initialize();
    return () => { cancelled = true; setAnalyticsClient(null); };
  }, [hydrated, analyticsOptOut]);
  useEffect(() => {
    if (!ready) return;
    bookEvent("$pageview", { page: pathname, previous_page: previous.current });
    previous.current = pathname;
    // Coarse visible time only; no persisted visit identifier or activity stream.
    let visibleAt = document.hidden ? 0 : Date.now(), elapsed = 0, sent = false;
    function accumulate() { if (visibleAt) elapsed += Date.now() - visibleAt; visibleAt = document.hidden ? 0 : Date.now(); }
    function send() { if (sent) return; accumulate(); visibleAt = 0; sent = true; bookEvent("visit_engagement", { page: pathname, engaged_seconds: elapsed / 1000 }); }
    document.addEventListener("visibilitychange", accumulate);
    window.addEventListener("pagehide", send);
    const resume = () => { sent = false; elapsed = 0; visibleAt = document.hidden ? 0 : Date.now(); };
    window.addEventListener("pageshow", resume);
    return () => { send(); document.removeEventListener("visibilitychange", accumulate); window.removeEventListener("pagehide", send); window.removeEventListener("pageshow", resume); };
  }, [pathname, ready]);
  return null;
}
export function AnalyticsChoice() {
  const { analyticsOptOut, setAnalyticsOptOut } = usePreferences();
  return <label className="preference-row"><span>Opt out of anonymous analytics</span><input type="checkbox" checked={analyticsOptOut} onChange={event => setAnalyticsOptOut(event.target.checked)} /></label>;
}
