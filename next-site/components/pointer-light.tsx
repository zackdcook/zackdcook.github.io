"use client";

import { useEffect } from "react";
import { approachLight, materialLight } from "@/lib/material-light";

const surfacesSelector = ".button,.text-link,.stage-button,.rail-controls button,.feed-copy button,.project-description-toggle,.journal-banner,.shoutout-card,.event-callout,.portrait-frame,.tactile-photo,.photo-label,.hero h1,.home-tab,.preference-control,.desktop-nav a,.mobile-menu summary,.mobile-menu nav,.mobile-menu nav a,.writing-panel,.signature-pad,.submission-panel,.cypress-carving,.tree-section";

// Shared mouse/touch light. The animation path never updates React state.
export function PointerLight() {
  useEffect(() => {
    const surfaces = new Set<HTMLElement>();
    const visible = new Set<HTMLElement>();
    const rectangles = new Map<HTMLElement, DOMRect>();
    let x = -1000, y = -1000, lastMove = 0, released = false, touching = false;
    let intensity = 0, previousTime = 0;
    let frame = 0, collectionFrame = 0, dirty = true, hasLight = false;
    const reduced = () => document.documentElement.dataset.effects === "reduced";
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(element);
        else { visible.delete(element); resetSurface(element); }
      }
      dirty = true;
      start();
    }, { rootMargin: "80px" });
    const resize = new ResizeObserver(() => { dirty = true; start(); });

    function paint(element: HTMLElement, bounds: DOMRect, strength: number) {
      const light = materialLight(bounds, x, y, strength);
      const px = (value: number) => `${value.toFixed(2)}px`;
      element.style.setProperty("--light-strength", light.strength.toFixed(3));
      element.style.setProperty("--light-x", px(light.lightX));
      element.style.setProperty("--light-y", px(light.lightY));
      element.style.setProperty("--shadow-x", px(light.shadowX));
      element.style.setProperty("--shadow-y", px(light.shadowY));
      element.style.setProperty("--shadow-blur", px(light.blur));
      element.style.setProperty("--rim-x", px(light.rimX));
      element.style.setProperty("--rim-y", px(light.rimY));
      // Preserve the existing tree's light hooks without changing its behavior.
      element.style.setProperty("--cast-x", px(light.shadowX));
      element.style.setProperty("--cast-y", px(light.shadowY));
    }
    function resetSurface(element: HTMLElement) {
      element.style.setProperty("--light-strength", "0");
      for (const name of ["--shadow-x", "--shadow-y", "--shadow-blur", "--rim-x", "--rim-y", "--cast-x", "--cast-y"]) element.style.removeProperty(name);
    }
    function collect() {
      collectionFrame = 0;
      const next = new Set(document.querySelectorAll<HTMLElement>(surfacesSelector));
      for (const element of surfaces) if (!next.has(element)) {
        observer.unobserve(element); resize.unobserve(element);
        surfaces.delete(element); visible.delete(element); rectangles.delete(element);
      }
      for (const element of next) if (!surfaces.has(element)) {
        surfaces.add(element); resetSurface(element);
        observer.observe(element); resize.observe(element);
      }
      // A stage label changing must not extinguish the light on every surface.
      dirty = true;
      start();
    }
    function reset() {
      for (const element of surfaces) resetSurface(element);
      cancelAnimationFrame(frame); frame = 0;
      intensity = 0; previousTime = 0;
    }
    function tick(now: number) {
      frame = 0;
      if (reduced() || document.hidden) { reset(); return; }
      const target = hasLight && !released && (touching || now - lastMove <= 240) ? 1 : 0;
      intensity = approachLight(intensity, target, previousTime ? now - previousTime : 0);
      previousTime = now;
      if (dirty) {
        // Read all bounds together before writing any style. Re-measure after
        // scroll/resize/pointer motion, including moved ribbons and nested rails.
        for (const element of visible) rectangles.set(element, element.getBoundingClientRect());
        dirty = false;
      }
      for (const element of visible) {
        const bounds = rectangles.get(element);
        if (bounds) paint(element, bounds, intensity);
      }
      if (intensity > 0 || target > 0) frame = requestAnimationFrame(tick);
      else previousTime = 0;
    }
    function start() { if (!frame && !reduced()) frame = requestAnimationFrame(tick); }
    const move = (event: PointerEvent) => {
      x = event.clientX; y = event.clientY; lastMove = performance.now();
      if (event.pointerType !== "mouse") touching = true;
      released = false; dirty = true; hasLight = true; start();
    };
    const release = (event: PointerEvent) => {
      // Mouse clicks do not extinguish a still-hovered light. Touch leaves an
      // afterglow once the finger is lifted.
      if (event.type === "pointerleave" || event.type === "pointercancel" || event.pointerType !== "mouse") {
        lastMove = performance.now(); released = true; touching = false; start();
      }
    };
    const geometry = () => { dirty = true; start(); };
    const visibility = () => { if (document.hidden) reset(); };
    const changes = new MutationObserver(() => {
      if (!collectionFrame) collectionFrame = requestAnimationFrame(collect);
    });
    const settings = new MutationObserver(() => { if (reduced()) reset(); else { dirty = true; start(); } });
    collect();
    changes.observe(document.body, { subtree: true, childList: true });
    settings.observe(document.documentElement, { attributes: true, attributeFilter: ["data-effects", "data-theme"] });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
    document.documentElement.addEventListener("pointerleave", release, { passive: true });
    document.addEventListener("scroll", geometry, { passive: true, capture: true });
    window.addEventListener("resize", geometry, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      reset(); cancelAnimationFrame(collectionFrame);
      observer.disconnect(); resize.disconnect(); changes.disconnect(); settings.disconnect();
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release);
      document.documentElement.removeEventListener("pointerleave", release);
      document.removeEventListener("scroll", geometry, true); window.removeEventListener("resize", geometry);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return null;
}
