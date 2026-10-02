"use client";

import { useEffect } from "react";

// One controller. Pointer movement writes CSS variables, never React state.
export function PointerLight() {
  useEffect(() => {
    const selector = ".button,.text-link,.journal-banner,.shoutout-card,.event-callout,.portrait-frame,.photo-label,.desktop-nav a,.writing-panel,.guestbook-invitation,.signature-pad,.submission-panel,.cypress-carving,.tree-section";
    let surfaces: HTMLElement[] = [], visible = new Set<HTMLElement>();
    const rectangles = new Map<HTMLElement, DOMRect>();
    let x = -1000, y = -1000, lastMove = 0, released = false, frame = 0, dirty = true, queued = false;
    const reduced = () => document.documentElement.dataset.effects === "reduced";
    const observer = new IntersectionObserver(entries => {
      for (const e of entries) e.isIntersecting ? visible.add(e.target as HTMLElement) : visible.delete(e.target as HTMLElement);
      dirty = true;
    }, { rootMargin: "80px" });
    function collect() {
      observer.disconnect(); visible.clear(); rectangles.clear();
      surfaces = [...document.querySelectorAll<HTMLElement>(selector)].slice(0, 200);
      surfaces.forEach(el => { el.style.setProperty("--light-strength", "0"); observer.observe(el); });
      dirty = true; queued = false;
    }
    function reset() { surfaces.forEach(el => el.style.setProperty("--light-strength", "0")); cancelAnimationFrame(frame); frame = 0; }
    function tick(now: number) {
      frame = 0;
      if (reduced() || document.hidden) { reset(); return; }
      const elapsed = now - lastMove;
      const strength = Math.max(0, 1 - Math.max(0, elapsed - (released ? 0 : 220)) / 1050);
      if (dirty) { for (const el of visible) rectangles.set(el, el.getBoundingClientRect()); dirty = false; }
      // Batch all reads above, then writes; no repeated layout reads in the hot path.
      for (const el of visible) {
        const rect = rectangles.get(el);
        if (!rect) continue;
        const dx = Math.max(-11, Math.min(11, (rect.x + rect.width / 2 - x) / 42));
        const dy = Math.max(-7, Math.min(13, (rect.y + rect.height / 2 - y) / 48));
        const proximity = Math.max(0, 1 - Math.hypot(x - rect.x - rect.width / 2, y - rect.y - rect.height / 2) / 900);
        el.style.setProperty("--light-x", `${Math.round(x - rect.x)}px`);
        el.style.setProperty("--light-y", `${Math.round(y - rect.y)}px`);
        el.style.setProperty("--cast-x", `${dx.toFixed(1)}px`);
        el.style.setProperty("--cast-y", `${dy.toFixed(1)}px`);
        el.style.setProperty("--light-strength", (strength * proximity).toFixed(3));
      }
      if (strength > 0) frame = requestAnimationFrame(tick);
    }
    const start = () => { if (!frame && !reduced()) frame = requestAnimationFrame(tick); };
    const move = (event: PointerEvent) => {
      x = event.clientX; y = event.clientY; lastMove = performance.now(); released = false; start();
    };
    const release = () => { lastMove = performance.now(); released = true; start(); };
    const geometry = () => { dirty = true; start(); };
    const visibility = () => { if (document.hidden) reset(); };
    const changes = new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(collect); } });
    const settings = new MutationObserver(() => { if (reduced()) reset(); });
    collect();
    changes.observe(document.body, { subtree: true, childList: true });
    settings.observe(document.documentElement, { attributes: true, attributeFilter: ["data-effects"] });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
    document.documentElement.addEventListener("pointerleave", release, { passive: true });
    window.addEventListener("scroll", geometry, { passive: true });
    window.addEventListener("resize", geometry, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      reset(); observer.disconnect(); changes.disconnect(); settings.disconnect();
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", move); window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release);
      document.documentElement.removeEventListener("pointerleave", release); window.removeEventListener("scroll", geometry); window.removeEventListener("resize", geometry); document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return null;
}
