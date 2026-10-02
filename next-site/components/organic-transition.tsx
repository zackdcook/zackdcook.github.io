"use client";

import { ViewTransition } from "react";
import { usePreferences } from "@/components/site-preferences";

export function OrganicTransition({ children, name }: { children: React.ReactNode; name?: string }) {
  const { reduced } = usePreferences();
  return <ViewTransition name={name} enter={reduced ? "none" : "leaf-unfurl"} exit={reduced ? "none" : "leaf-fold"} update={reduced ? "none" : "leaf-reshape"} share={reduced ? "none" : "leaf-share"}>{children}</ViewTransition>;
}
