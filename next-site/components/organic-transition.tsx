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
  const page=name==="zacks-corner";
  useLayoutEffect(()=>{previous.current=pathname;},[pathname]);
  return <ViewTransition name={name} enter={reduced?"none":page?"chapter-open":"leaf-unfurl"} exit={reduced?"none":page?"chapter-close":"leaf-fold"} update={reduced||(page&&!routeChange)?"none":page?"chapter-turn":"leaf-reshape"} share={reduced?"none":page?"chapter-turn":"leaf-share"}>{children}</ViewTransition>;
}
