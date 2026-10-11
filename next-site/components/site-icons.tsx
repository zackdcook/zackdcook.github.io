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
      // Safari's surrounding chrome follows the actual semantic background,
      // including local timeline/theme changes, rather than a stale default.
      const background = getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim();
      if (background) {
        let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.append(meta); }
        if (meta.content !== background) meta.content = background;
      }
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
    const appearance = new MutationObserver(update);
    appearance.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-timeline"] });
    return () => { observer.disconnect(); appearance.disconnect(); };
  }, [palette, hydrated]);
  return null;
}
