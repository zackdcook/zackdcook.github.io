"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { BeBravePublicDrawing } from "@/lib/bebrave-types";
import { EnchantmentPainter, type EnchantmentCamera } from "@/lib/bebrave/enchantment-painter";
import { createEnchantmentLoop } from "@/lib/bebrave/enchantment-loop";
import { AdaptiveEffectQuality } from "@/lib/bebrave/effect-quality";

export function useCarvingEnchantments({ scene, camera, drawings, liveDrawing, totalHeight, enabled }:{
  scene:RefObject<HTMLElement|null>; camera:RefObject<EnchantmentCamera>;
  drawings:BeBravePublicDrawing[]; liveDrawing:()=>BeBravePublicDrawing|undefined;
  totalHeight:number; enabled:boolean;
}) {
  const auraRef = useRef<HTMLCanvasElement>(null), motesRef = useRef<HTMLCanvasElement>(null);
  const latest = useRef({drawings, liveDrawing, totalHeight}); latest.current = {drawings, liveDrawing, totalHeight};
  const running = useRef<ReturnType<typeof createEnchantmentLoop>|null>(null);
  const renderer = useRef<EnchantmentPainter|null>(null);
  const quality = useRef<AdaptiveEffectQuality|null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const [canvasReady,setCanvasReady]=useState(false);
  const followCamera = useCallback(()=>renderer.current?.followCamera(camera.current),[camera]);
  const wake = useCallback((interactive=false)=>{
    if(interactive){
      quality.current?.interact(performance.now());
      clearTimeout(idleTimer.current);
      idleTimer.current=setTimeout(()=>running.current?.wake(),460);
    }
    running.current?.wake();
  },[]);

  useEffect(()=>{
    const root = scene.current, aura = auraRef.current?.getContext("2d"), motes = motesRef.current?.getContext("2d");
    if (!enabled || !root || !aura || !motes) return;
    const painter = new EnchantmentPainter(aura, motes);
    renderer.current = painter;
    const device = navigator as Navigator & {deviceMemory?:number};
    const adaptive = new AdaptiveEffectQuality(device.hardwareConcurrency || 4,device.deviceMemory ?? 4);
    quality.current = adaptive;
    const reduced = () => document.documentElement.dataset.effects === "reduced" || document.documentElement.dataset.motion === "reduced";
    let frames = 0;
    const loop = createEnchantmentLoop({
      request:frame=>requestAnimationFrame(frame), cancel:id=>cancelAnimationFrame(id),
      allowed:()=>document.visibilityState === "visible" && !reduced(),
      // Native scrolling and gesture transforms run at the display's cadence;
      // the independently budgeted magical animation aims for 30 fps.
      interval:33,
      onFrame:gap=>adaptive.frame(gap),
      paint:time=>{
        const start = performance.now(), detail = adaptive.detail(time);
        const input = latest.current, local = input.liveDrawing();
        const result = painter.paint(local?[local,...input.drawings]:input.drawings, camera.current, input.totalHeight, time/1000,detail);
        adaptive.painted(performance.now()-start,time);
        root.dataset.enchantmentRenderer = "canvas";
        root.dataset.enchantmentFrames = String(++frames);
        root.dataset.enchantmentAuras = String(result.auras);
        root.dataset.enchantmentParticles = String(result.particles);
        root.dataset.enchantmentQuality = detail.quality;
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
      loop.dispose(); running.current=null; renderer.current=null;quality.current=null;observer.disconnect();clearTimeout(idleTimer.current);
      document.removeEventListener("visibilitychange",sync); painter.dispose();
      delete root.dataset.enchantmentRenderer;
      delete root.dataset.enchantmentQuality;
    };
  },[enabled,scene,camera]);
  useEffect(()=>wake(),[drawings,totalHeight,wake]);
  return {auraRef,motesRef,wake,followCamera,canvasReady};
}
