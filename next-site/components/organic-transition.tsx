"use client";

import {
  ViewTransition,
  useLayoutEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/components/site-preferences";

const VIEWPORT_DURATION = 1050;

export function OrganicTransition({
  children,
  name,
}: {
  children: React.ReactNode;
  name?: string;
}) {
  const { reduced } = usePreferences();
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  const routeChange = previousPath.current !== pathname;

  useLayoutEffect(() => {
    if (routeChange && name === "zacks-corner") {
      const main = document.getElementById("main");

      if (main) {
        const viewportHeight = window.innerHeight;

        /*
         * scrollHeight is the complete incoming page, not merely the
         * currently visible viewport.
         */
        const pageHeight = Math.max(
          main.scrollHeight,
          viewportHeight,
        );

        /*
         * 1050 ms per viewport gives every page the same apparent
         * vertical velocity regardless of its total height.
         */
        const duration =
          (pageHeight / viewportHeight) * VIEWPORT_DURATION;

        /*
         * The old page only needs to travel one viewport before it is
         * completely gone. This percentage tells its animation when
         * that should happen relative to the complete incoming-page pan.
         */
        const oldExitPercent =
          Math.min(100, (viewportHeight / pageHeight) * 100);

        const root = document.documentElement;

        root.style.setProperty(
          "--page-pan-duration",
          `${duration}ms`,
        );

        root.style.setProperty(
          "--old-page-exit",
          `${oldExitPercent}%`,
        );
      }
    }

    previousPath.current = pathname;
  }, [pathname, routeChange, name]);

  return (
    <ViewTransition
      name={name}
      enter={reduced ? "none" : "leaf-unfurl"}
      exit={reduced ? "none" : "leaf-fold"}
      update={
        reduced ||
        (name === "zacks-corner" && !routeChange)
          ? "none"
          : "leaf-reshape"
      }
      share={reduced ? "none" : "leaf-share"}
    >
      {children}
    </ViewTransition>
  );
}