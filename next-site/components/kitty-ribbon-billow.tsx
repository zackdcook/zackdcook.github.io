"use client";
import { useEffect } from "react";

export function KittyRibbonBillow() {
  useEffect(() => {
    let lastY = window.scrollY, frame = 0, lastKick = 0;
    const kick = () => {
      frame = 0;
      const now = performance.now(), nextY = window.scrollY;
      const delta = Math.max(-42, Math.min(42, nextY - lastY)); lastY = nextY;
      if (Math.abs(delta) < 1 || now - lastKick < 45) return;
      lastKick = now;
      const svg = document.querySelector<SVGSVGElement>(".kitty-ribbon svg");
      if (!svg || document.documentElement.dataset.effects === "reduced") return;
      const direction = delta > 0 ? 1 : -1, force = Math.min(1, Math.abs(delta) / 24);
      svg.animate([
        { transform: "perspective(900px) rotateX(0deg) rotateY(0deg) skewY(0deg) translateY(0)" },
        { transform: `perspective(900px) rotateX(${2.4*direction*force}deg) rotateY(${-1.5*direction*force}deg) skewY(${.9*direction*force}deg) translateY(${-3*direction*force}px)` },
        { transform: `perspective(900px) rotateX(${-1.5*direction*force}deg) rotateY(${1*direction*force}deg) skewY(${-0.55*direction*force}deg) translateY(${1.5*direction*force}px)` },
        { transform: "perspective(900px) rotateX(0deg) rotateY(0deg) skewY(0deg) translateY(0)" },
      ], { duration: 520 + 180*force, easing: "cubic-bezier(.2,.75,.25,1)" });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(kick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);
  return null;
}
