"use client";

import { ViewTransition, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/components/site-preferences";

export function OrganicTransition({ children, name }: { children: React.ReactNode; name?: string }) {
  const { reduced } = usePreferences();
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const routeChange = previousPath.current !== pathname;
  useLayoutEffect(() => { previousPath.current = pathname; }, [pathname]);
  // Route changes get a shared bloom. Local form/chart transitions must not
  // snapshot or rescale the whole page (particularly Safari's SVG layers).
  return <ViewTransition name={name} enter={reduced ? "none" : "leaf-unfurl"} exit={reduced ? "none" : "leaf-fold"} update={reduced || (name === "zacks-corner" && !routeChange) ? "none" : "leaf-reshape"} share={reduced ? "none" : "leaf-share"}>{children}</ViewTransition>;
}
