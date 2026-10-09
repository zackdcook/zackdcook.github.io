"use client";

import { ViewTransition, useRef, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { usePreferences } from "@/components/site-preferences";

/** Keep route and local transitions distinct without measuring whole pages. */
export function OrganicTransition({children,name}:{children:React.ReactNode;name?:string}) {
  const {reduced}=usePreferences();
  const pathname=usePathname();
  const previous=useRef(pathname);
  const routeChange=previous.current!==pathname;
  useLayoutEffect(()=>{previous.current=pathname;},[pathname]);
  return <ViewTransition name={name} enter={reduced?"none":"leaf-unfurl"} exit={reduced?"none":"leaf-fold"} update={reduced||(name==="zacks-corner"&&!routeChange)?"none":"leaf-reshape"} share={reduced?"none":"leaf-share"}>{children}</ViewTransition>;
}
