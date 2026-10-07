"use client";

import { useEffect } from "react";

export const kittyRibbonWindEvent="zack:kitty-ribbon-wind";

/* This component no longer transforms the ribbon as one rigid SVG.
   It only measures scrolling and sends a wind impulse to the ribbon's
   per-node cloth simulation. */
export function KittyRibbonBillow(){
  useEffect(()=>{
    let lastY=window.scrollY,lastAt=performance.now();
    const onScroll=()=>{
      const now=performance.now(),y=window.scrollY,dy=y-lastY,dt=Math.max(8,now-lastAt);
      lastY=y;lastAt=now;
      const speed=Math.min(1.35,Math.abs(dy)/Math.max(12,dt*.45));
      if(speed<.03)return;
      window.dispatchEvent(new CustomEvent(kittyRibbonWindEvent,{detail:{strength:speed}}));
    };
    const prime=requestAnimationFrame(()=>window.dispatchEvent(new CustomEvent(kittyRibbonWindEvent,{detail:{strength:.08}})));
    window.addEventListener("scroll",onScroll,{passive:true});
    return()=>{cancelAnimationFrame(prime);window.removeEventListener("scroll",onScroll);};
  },[]);
  return null;
}
