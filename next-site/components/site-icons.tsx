"use client";

import { useEffect } from "react";
import { usePreferences } from "@/components/site-preferences";

export function SiteIcons() {
  const { hydrated } = usePreferences();
  useEffect(() => {
    if (!hydrated) return;
    const update = () => {
      // Safari's surrounding chrome follows the actual semantic background,
      // including local timeline/theme changes, rather than a stale default.
      const background = getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim();
      if (background) {
        let meta = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        if (!meta) { meta = document.createElement("meta"); meta.name = "theme-color"; document.head.append(meta); }
        if (meta.content !== background) meta.content = background;
      }
      // Browser-tab SVG follows the browser's own media query. Do not replace
      // it with a site-theme bitmap or overwrite Next's versioned icon URLs.
    };
    update();
    // Next may replace metadata during navigation; retain the local timeline.
    const observer = new MutationObserver(update);
    observer.observe(document.head, { childList: true });
    const appearance = new MutationObserver(update);
    appearance.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-timeline"] });
    return () => { observer.disconnect(); appearance.disconnect(); };
  }, [hydrated]);
  return null;
}
