"use client";

import { useEffect } from "react";
import { usePreferences } from "@/components/site-preferences";

export function SiteIcons() {
  const { timeline, hydrated } = usePreferences();
  const palette = timeline.kind;
  useEffect(() => {
    if (!hydrated) return;
    const icon = `/images/brand/favicon-${palette}.svg`;
    const apple = `/images/brand/apple-${palette}.png`;
    const update = () => {
      for (const link of document.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"],link[rel="apple-touch-icon"]')) {
        const href = link.rel === "icon" ? icon : apple;
        if (link.getAttribute("href") !== href) link.setAttribute("href", href);
        link.type = link.rel === "icon" ? "image/svg+xml" : "image/png";
        link.sizes.value = link.rel === "icon" ? "any" : "180x180";
      }
    };
    update();
    // Next may replace metadata during navigation; retain the local timeline.
    const observer = new MutationObserver(update);
    observer.observe(document.head, { childList: true });
    return () => observer.disconnect();
  }, [palette, hydrated]);
  return null;
}
