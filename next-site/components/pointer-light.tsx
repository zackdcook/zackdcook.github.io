"use client";

import { useEffect } from "react";
import { approachLight, materialLight, materialGeometryEvent } from "@/lib/material-light";
import { orientationAPI, recenterTiltEvent, tiltLight, tiltStatusEvent, type TiltReading } from "@/lib/phone-tilt";

const surfacesSelector = ".button,.text-link,.stage-button,.rail-controls button,.feed-copy button,.project-description-toggle,.journal-banner,.shoutout-card,.event-callout,.portrait-frame,.tactile-photo,.kitty-ribbon,.hero h1,.home-tab,.preference-control,.desktop-nav a,.mobile-menu summary,.mobile-menu nav,.mobile-menu nav a,.writing-panel,.signature-pad,.submission-panel,.cypress-carving,.tree-section,.quote-leaf";

// One shared light: mouse on desktop, permission-gated orientation on phones.
// Sensor readings never leave the browser or enter React's animation path.
export function PointerLight() {
  useEffect(() => {
    const surfaces = new Set<HTMLElement>();
    const visible = new Set<HTMLElement>();
    const rectangles = new Map<HTMLElement, DOMRect>();
    const leafSurfaces = new Map<HTMLElement, { gradient: SVGRadialGradientElement; shadow: SVGGElement | null; width: number; height: number; inPile: boolean }>();
    let x = -1000, y = -1000, lastMove = 0, released = false;
    let source: "mouse" | "tilt" = "mouse";
    let reference: TiltReading | null = null, tiltX = 0, tiltY = 0, significantX = 0, significantY = 0;
    let listening = false, orientationAngle = 0;
    const coarse = matchMedia("(pointer: coarse)");
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
      element.style.setProperty("--light-angle", `${Math.atan2(light.rimY, light.rimX) * 180 / Math.PI}deg`);
      const leaf = leafSurfaces.get(element);
      if (leaf) {
        const holder = element.parentElement;
        const a=parseFloat(holder?.style.getPropertyValue("--leaf-a") || "1"), b=parseFloat(holder?.style.getPropertyValue("--leaf-b") || "0");
        const c=parseFloat(holder?.style.getPropertyValue("--leaf-c") || "0"), d=parseFloat(holder?.style.getPropertyValue("--leaf-d") || "1");
        const lift = parseFloat(holder?.style.getPropertyValue("--leaf-lift") || "0");
        const determinant=a*d-b*c;
        const local=(vx:number,vy:number) => ({x:(d*vx-c*vy)/determinant,y:(a*vy-b*vx)/determinant});
        // Invert the exact flat projection used by the physics, so the cast
        // moves opposite the shared light even on a gently banked blade.
        const cast=local(light.shadowX,light.shadowY+lift*.12), units=640/Math.max(1,leaf.width);
        leaf.shadow?.setAttribute("transform",`translate(${(cast.x*units).toFixed(2)} ${(cast.y*units).toFixed(2)})`);
        const dx = x - bounds.left - bounds.width / 2, dy = y - bounds.top - bounds.height / 2;
        const limit = (value: number) => Math.max(-1,Math.min(2,value));
        const point=local(dx,dy);
        leaf.gradient.setAttribute("cx", String(limit(.5 + point.x / Math.max(1,leaf.width))));
        leaf.gradient.setAttribute("cy", String(limit(.5 + point.y / Math.max(1,leaf.height))));
      }
      if (element.classList.contains("kitty-ribbon") && bounds.width) {
        element.style.setProperty("--ribbon-light-x", px(light.lightX * 640 / bounds.width));
        element.style.setProperty("--ribbon-light-y", px(light.lightY * 640 / bounds.width));
      }
      // Preserve the existing tree's light hooks without changing its behavior.
      element.style.setProperty("--cast-x", px(light.shadowX));
      element.style.setProperty("--cast-y", px(light.shadowY));
    }
    function resetSurface(element: HTMLElement) {
      element.style.setProperty("--light-strength", "0");
      for (const name of ["--shadow-x", "--shadow-y", "--shadow-blur", "--rim-x", "--rim-y", "--cast-x", "--cast-y"]) element.style.removeProperty(name);
      leafSurfaces.get(element)?.shadow?.setAttribute("transform","translate(0 10)");
    }
    function collect() {
      collectionFrame = 0;
      const next = new Set(document.querySelectorAll<HTMLElement>(surfacesSelector));
      for (const element of surfaces) if (!next.has(element)) {
        observer.unobserve(element); resize.unobserve(element);
        surfaces.delete(element); visible.delete(element); rectangles.delete(element); leafSurfaces.delete(element);
      }
      for (const element of next) if (!surfaces.has(element)) {
        surfaces.add(element); resetSurface(element);
        const gradient = element.classList.contains("quote-leaf") ? element.querySelector<SVGRadialGradientElement>(".leaf-edge-light") : null;
        if (gradient) leafSurfaces.set(element, { gradient, shadow: element.querySelector<SVGGElement>(".leaf-shadow"), width: 0, height: 0, inPile: Boolean(element.closest(".folly-ground")) });
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
      const target = hasLight && !released && now - lastMove <= 240 ? 1 : 0;
      const elapsed = previousTime ? Math.min(64, now - previousTime) : 0;
      intensity = approachLight(intensity, target, elapsed);
      if (source === "tilt") {
        const easing = 1 - Math.exp(-elapsed / 90);
        x += (tiltX - x) * easing; y += (tiltY - y) * easing;
      }
      previousTime = now;
      const readerOpen=Boolean(document.querySelector(".leaf-reader[open]"));
      if (dirty) {
        // Read all bounds together before writing any style. Re-measure after
        // scroll/resize/pointer motion, including moved ribbons and nested rails.
        for (const element of visible) {
          if (readerOpen && leafSurfaces.get(element)?.inPile) continue;
          rectangles.set(element, element.getBoundingClientRect());
          const leaf = leafSurfaces.get(element);
          if (leaf) { leaf.width = element.clientWidth; leaf.height = element.clientHeight; }
        }
        dirty = false;
      }
      for (const element of visible) {
        if (readerOpen && leafSurfaces.get(element)?.inPile) continue;
        const bounds = rectangles.get(element);
        if (bounds) paint(element, bounds, intensity);
      }
      if (intensity > 0 || target > 0) frame = requestAnimationFrame(tick);
      else previousTime = 0;
    }
    function start() { if (!frame && !reduced()) frame = requestAnimationFrame(tick); }
    const move = (event: PointerEvent) => {
      // Touches remain ordinary taps/scrolling, never a hold-to-light gesture.
      if (event.pointerType !== "mouse" || source === "tilt" || reduced()) return;
      x = event.clientX; y = event.clientY; lastMove = performance.now();
      source = "mouse"; released = false; dirty = true; hasLight = true; start();
    };
    const release = (event: PointerEvent) => {
      if (source === "mouse" && event.pointerType === "mouse" && (event.type === "pointerleave" || event.type === "pointercancel")) {
        released = true; start();
      }
    };
    const screenAngle = () => window.screen.orientation?.angle ?? (window as Window & { orientation?: number }).orientation ?? 0;
    const orientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma) || document.hidden || reduced()) return;
      const reading = { beta: event.beta, gamma: event.gamma }, angle = screenAngle();
      if (angle !== orientationAngle) { reference = null; orientationAngle = angle; }
      const first = reference === null;
      if (first) reference = reading;
      const point = tiltLight(reading, reference!, angle, innerWidth, innerHeight);
      if (!point) return;
      if (first) {
        // A valid sensor reading claims the shared source until tilt is disabled.
        reset(); source = "tilt";
        x = point.x; y = point.y;
        document.documentElement.dataset.tiltStatus = "active";
        window.dispatchEvent(new Event(tiltStatusEvent));
      }
      tiltX = point.x; tiltY = point.y;
      // Ignore sensor chatter. Slow intentional changes accumulate until they
      // cross this threshold, allowing the same rest fade as the mouse.
      if (first || Math.hypot(point.x - significantX, point.y - significantY) > 5) {
        significantX = point.x; significantY = point.y; lastMove = performance.now();
        source = "tilt"; hasLight = true; released = false; start();
      }
    };
    const recenter = () => { reference = null; };
    const syncTilt = () => {
      const enabled = coarse.matches && Boolean(orientationAPI()) && document.documentElement.dataset.tilt !== "false" && !reduced();
      if (enabled === listening) return;
      listening = enabled; reference = null;
      if (enabled) window.addEventListener("deviceorientation", orientation, { passive: true });
      else {
        window.removeEventListener("deviceorientation", orientation);
        if (source === "tilt") {
          reset(); source = "mouse"; hasLight = false; released = true;
        }
        delete document.documentElement.dataset.tiltStatus;
        window.dispatchEvent(new Event(tiltStatusEvent));
      }
    };
    const geometry = () => { dirty = true; start(); };
    const visibility = () => { if (document.hidden) reset(); };
    const changes = new MutationObserver(() => {
      if (!collectionFrame) collectionFrame = requestAnimationFrame(collect);
    });
    const settings = new MutationObserver(() => { syncTilt(); if (reduced()) reset(); else { dirty = true; start(); } });
    collect();
    changes.observe(document.body, { subtree: true, childList: true });
    settings.observe(document.documentElement, { attributes: true, attributeFilter: ["data-effects", "data-theme", "data-timeline", "data-tilt"] });
    syncTilt(); coarse.addEventListener("change", syncTilt);
    window.addEventListener(recenterTiltEvent, recenter);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("pointerup", release, { passive: true });
    window.addEventListener("pointercancel", release, { passive: true });
    document.documentElement.addEventListener("pointerleave", release, { passive: true });
    document.addEventListener("scroll", geometry, { passive: true, capture: true });
    window.addEventListener("resize", geometry, { passive: true });
    window.addEventListener(materialGeometryEvent, geometry, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      reset(); cancelAnimationFrame(collectionFrame);
      observer.disconnect(); resize.disconnect(); changes.disconnect(); settings.disconnect();
      coarse.removeEventListener("change", syncTilt); window.removeEventListener("deviceorientation", orientation);
      window.removeEventListener(recenterTiltEvent, recenter);
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointerup", release); window.removeEventListener("pointercancel", release);
      document.documentElement.removeEventListener("pointerleave", release);
      document.removeEventListener("scroll", geometry, true); window.removeEventListener("resize", geometry);
      window.removeEventListener(materialGeometryEvent, geometry);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return null;
}
