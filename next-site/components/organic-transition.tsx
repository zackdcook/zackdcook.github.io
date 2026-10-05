"use client";

import {
  ViewTransition,
  useLayoutEffect,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/components/site-preferences";

/*
 * Nominal speed of the page-stack pan.
 *
 * 360ms means roughly one viewport every .36 seconds.
 * Very tall pages are capped so About Me doesn't take forever.
 */
const MS_PER_VIEWPORT = 180;
const MIN_DURATION = 325;
const MAX_DURATION = 900;

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
      const pageSheet = document.getElementById("page-sheet");
      const header = document.querySelector<HTMLElement>(".site-header");

      if (pageSheet) {
        /*
         * The sticky header remains stationary above the transition.
         * Its bottom edge becomes the top edge of our virtual page viewport.
         */
        const headerBottom = Math.max(
          0,
          header?.getBoundingClientRect().bottom ?? 0,
        );

        const availableViewportHeight = Math.max(
          1,
          window.innerHeight - headerBottom,
        );

        /*
         * getBoundingClientRect().height matches the actual rendered box
         * that the View Transition API snapshots.
         */
        const incomingPageHeight = Math.max(
          pageSheet.getBoundingClientRect().height,
          availableViewportHeight,
        );

        /*
         * Base duration on distance, then cap extremely long routes.
         */
        const rawDuration =
          (incomingPageHeight / availableViewportHeight) *
          MS_PER_VIEWPORT;

        const duration = Math.min(
          MAX_DURATION,
          Math.max(MIN_DURATION, rawDuration),
        );

        const root = document.documentElement;

        root.style.setProperty(
          "--page-pan-top",
          `${headerBottom}px`,
        );

        root.style.setProperty(
          "--page-pan-viewport",
          `${availableViewportHeight}px`,
        );

        root.style.setProperty(
          "--page-pan-distance",
          `${incomingPageHeight}px`,
        );

        root.style.setProperty(
          "--page-pan-duration",
          `${duration}ms`,
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
