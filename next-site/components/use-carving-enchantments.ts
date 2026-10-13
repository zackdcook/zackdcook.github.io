"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { BeBravePublicDrawing } from "@/lib/bebrave-types";
import { EnchantmentPainter, type EnchantmentCamera } from "@/lib/bebrave/enchantment-painter";
import { createEnchantmentLoop } from "@/lib/bebrave/enchantment-loop";

export function useCarvingEnchantments({ scene, camera, drawings, liveDrawing, totalHeight, enabled }:{
  scene:RefObject<HTMLElement|null>; camera:RefObject<EnchantmentCamera>;
  drawings:BeBravePublicDrawing[]; liveDrawing:()=>BeBravePublicDrawing|undefined;
  totalHeight:number; enabled:boolean;
}) {
  const auraRef = useRef<HTMLCanvasElement>(null), motesRef = useRef<HTMLCanvasElement>(null);
  const latest = useRef({drawings, liveDrawing, totalHeight}); latest.current = {drawings, liveDrawing, totalHeight};
  const running = useRef<ReturnType<typeof createEnchantmentLoop>|null>(null);
  const [canvasReady,setCanvasReady]=useState(false);
  const wake = useCallback(()=>running.current?.wake(),[]);

  useEffect(()=>{
    const root = scene.current, aura = auraRef.current?.getContext("2d"), motes = motesRef.current?.getContext("2d");
    if (!enabled || !root || !aura || !motes) return;
    const painter = new EnchantmentPainter(aura, motes);
    const reduced = () => document.documentElement.dataset.effects === "reduced" || document.documentElement.dataset.motion === "reduced";
    let frames = 0;
    const loop = createEnchantmentLoop({
      request:frame=>requestAnimationFrame(frame), cancel:id=>cancelAnimationFrame(id),
      allowed:()=>document.visibilityState === "visible" && !reduced(),
      interval:matchMedia("(pointer:coarse)").matches?33:16,
      paint:time=>{
        const input = latest.current, local = input.liveDrawing();
        const result = painter.paint(local?[local,...input.drawings]:input.drawings, camera.current, input.totalHeight, time/1000);
        root.dataset.enchantmentRenderer = "canvas";
        root.dataset.enchantmentFrames = String(++frames);
        root.dataset.enchantmentAuras = String(result.auras);
        root.dataset.enchantmentParticles = String(result.particles);
        return result.auras > 0;
      },
    });
    running.current = loop;
    const sync = () => {
      if (reduced()) { loop.pause(); painter.clear(); root.dataset.enchantmentRenderer = "static";setCanvasReady(false); }
      else if (document.visibilityState !== "visible") loop.pause();
      else {setCanvasReady(true);loop.wake();}
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-effects","data-motion","data-theme"]});
    document.addEventListener("visibilitychange",sync);
    sync();
    return()=>{
      loop.dispose(); running.current=null; observer.disconnect();
      document.removeEventListener("visibilitychange",sync); painter.dispose();
      delete root.dataset.enchantmentRenderer;
    };
  },[enabled,scene,camera]);
  useEffect(()=>wake(),[drawings,totalHeight,wake]);
  return {auraRef,motesRef,wake,canvasReady};
}
