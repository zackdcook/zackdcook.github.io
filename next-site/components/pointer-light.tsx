"use client";

import { useEffect } from "react";
import { approachLight, followLight, materialLight, panelLight, materialPose, glassReflection, materialGeometryEvent } from "@/lib/material-light";
import { orientationAPI, recenterTiltEvent, tiltLight, tiltStatusEvent, type TiltReading } from "@/lib/phone-tilt";
import { publicMoteY } from "@/lib/public-atmosphere";

const surfacesSelector = "[data-material-surface],[data-light-source],.calendar-dialog,.zacky-c-preview,.bebrave-human-modal,.bebrave-timer,.folly-latest .quote-leaf,.leaf-reader .reader-leaf,.button,.icon-button,.stage-button,.rail-controls button,.feed-copy button,.project-description-toggle,.portrait-frame,.tactile-photo,.preference-control,.bebrave-rpg-dialogue,.bebrave-home-button";
const panelsSelector = ".bebrave-human-modal,.desk-section > .shell,.bio-section > .life-section,.shoutouts-section > .shell,.about-biography > .shell,.folly-panel,.shoutout-card,.event-callout,.writing-panel,.bebrave-rpg-dialogue";
const dynamicProperties = ["--shadow-x","--shadow-y","--shadow-blur","--cast-x","--cast-y","--rim-x","--rim-y","--material-pitch","--material-yaw","--material-cast-x","--material-cast-y"];

/** One event-driven light source. Read geometry together, then update only
 * changed local styles; scroll never changes inherited root lighting values. */
export function PointerLight() {
  useEffect(() => {
    const root = document.documentElement;
    const surfaces = new Set<HTMLElement>(), visible = new Set<HTMLElement>();
    const rectangles = new Map<HTMLElement, DOMRect>();
    let motes: HTMLElement[] = [], ambient: HTMLElement | null = null;
    let x = -1000, y = -1000, targetX = 0, targetY = 0, significantX = 0, significantY = 0;
    let source: "mouse" | "tilt" = "mouse", reference: TiltReading | null = null;
    let released = false, hasLight = false, listening = false, orientationAngle = 0;
    let intensity = 0, previousTime = 0, frame = 0, collectionFrame = 0, dirty = true;
    const coarse = matchMedia("(pointer: coarse)");
    const reduced = () => root.dataset.effects === "reduced";
    const px = (value: number) => `${value.toFixed(2)}px`;

    function style(element: HTMLElement, name: string, value: string) {
      // Inline reads do not force layout. Stationary surfaces need no writes.
      if (element.style.getPropertyValue(name) !== value) element.style.setProperty(name, value);
    }
    function resetSurface(element: HTMLElement) {
      style(element, "--light-strength", "0");
      for (const name of dynamicProperties) element.style.removeProperty(name);
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(element);
        else { visible.delete(element); rectangles.delete(element); resetSurface(element); }
      }
      dirty = true; start();
    }, { rootMargin: "80px" });
    const resize = new ResizeObserver(() => { dirty = true; start(); });

    function paint(element: HTMLElement, bounds: DOMRect, strength: number) {
      const light = element.dataset.materialKind === "panel"
        ? panelLight(bounds, x, y, strength, innerHeight) : materialLight(bounds, x, y, strength);
      style(element, "--light-strength", light.strength.toFixed(3));
      style(element, "--light-x", px(light.lightX)); style(element, "--light-y", px(light.lightY));
      // Cursor moves reflections; phone tilt also moves the small physical cast.
      const dynamicCast = source === "tilt";
      style(element, "--shadow-x", dynamicCast ? px(light.shadowX) : "0px");
      style(element, "--shadow-y", dynamicCast ? px(light.shadowY) : "0px");
      style(element, "--shadow-blur", dynamicCast ? px(light.blur) : "0px");
      style(element, "--rim-x", px(light.rimX)); style(element, "--rim-y", px(light.rimY));
      style(element, "--light-angle", `${Math.atan2(light.rimY, light.rimX) * 180 / Math.PI}deg`);
      style(element, "--cast-x", dynamicCast ? px(light.shadowX) : "0px");
      style(element, "--cast-y", dynamicCast ? px(light.shadowY) : "0px");
      const reflection = glassReflection(bounds, x, y);
      style(element, "--glass-x", `${reflection.x.toFixed(2)}%`);
      style(element, "--glass-y", `${reflection.y.toFixed(2)}%`);
      if (element.hasAttribute("data-material-surface") && !element.matches(".tactile-photo,.icon-button")) {
        const pose = materialPose(bounds, x, y, light.strength);
        style(element, "--material-yaw", `${pose.yaw.toFixed(2)}deg`);
        style(element, "--material-pitch", `${pose.pitch.toFixed(2)}deg`);
        style(element, "--material-cast-x", px(pose.castX)); style(element, "--material-cast-y", px(pose.castY));
      }
    }
    function collect() {
      collectionFrame = 0;
      motes = Array.from(document.querySelectorAll<HTMLElement>("[data-public-mote]"));
      ambient = document.querySelector<HTMLElement>("[data-public-light]");
      // Text-action rules and the fourth-wall discovery stay matte.
      const next = new Set(Array.from(document.querySelectorAll<HTMLElement>(surfacesSelector))
        .filter(element => !element.matches(".text-link") && !element.closest("[data-brave-dialogue]")));
      for (const element of surfaces) if (!next.has(element)) {
        observer.unobserve(element); resize.unobserve(element);
        surfaces.delete(element); visible.delete(element); rectangles.delete(element);
      }
      for (const element of next) if (!surfaces.has(element)) {
        surfaces.add(element); resetSurface(element);
        element.dataset.material = "surface";
        if (element.matches(panelsSelector)) element.dataset.materialKind = "panel";
        observer.observe(element); resize.observe(element);
      }
      dirty = true; start();
    }
    function reset() {
      for (const element of surfaces) resetSurface(element);
      if (ambient) style(ambient, "--world-light-strength", "0");
      cancelAnimationFrame(frame); frame = 0; intensity = 0; previousTime = 0;
    }
    function tick(now: number) {
      frame = 0;
      if (reduced() || document.hidden) { reset(); return; }
      const target = hasLight && !released ? 1 : 0;
      const elapsed = previousTime ? Math.min(64, now - previousTime) : 0;
      intensity = approachLight(intensity, target, elapsed);
      if (target) { const point = followLight({x,y}, {x:targetX,y:targetY}, elapsed); x = point.x; y = point.y; }
      previousTime = now;
      const dialog = document.querySelector<HTMLDialogElement>("dialog[open]");
      // All geometry reads precede writes; behind a modal only its faces matter.
      if (dirty) {
        for (const element of visible) if (!dialog || dialog.contains(element))
          rectangles.set(element, element.getBoundingClientRect());
      }
      if (dirty && !dialog) for (const mote of motes) {
        const position = publicMoteY(Number(mote.dataset.moteStart), Number(mote.dataset.moteDepth), scrollY, innerHeight);
        const transform = `translate3d(0,${position.toFixed(2)}px,0)`;
        if (mote.style.transform !== transform) mote.style.transform = transform;
      }
      dirty = false;
      if (ambient) {
        style(ambient, "--world-light-strength", dialog ? "0" : intensity.toFixed(3));
        if (intensity > 0 && !dialog) {
          const reflection = glassReflection({left:0,top:0,width:innerWidth,height:innerHeight}, x, y);
          style(ambient, "--world-light-x", px(innerWidth * reflection.x / 100));
          style(ambient, "--world-light-y", px(innerHeight * reflection.y / 100));
        }
      }
      if (hasLight || intensity > 0) for (const element of visible) {
        if (dialog && !dialog.contains(element)) continue;
        const bounds = rectangles.get(element);
        if (bounds) paint(element, bounds, intensity);
      }
      const settling = Boolean(target) && Math.hypot(targetX - x, targetY - y) > .2;
      if (Math.abs(intensity - target) > .001 || settling) frame = requestAnimationFrame(tick);
      else previousTime = 0;
    }
    function start() { if (!frame && !reduced() && !document.hidden) frame = requestAnimationFrame(tick); }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || source === "tilt" || reduced()) return;
      if (!hasLight || released) { x = event.clientX; y = event.clientY; }
      targetX = event.clientX; targetY = event.clientY;
      source = "mouse"; released = false; hasLight = true; start();
    };
    const release = (event: PointerEvent) => {
      if (source === "mouse" && event.pointerType === "mouse" && (event.type === "pointerleave" || event.type === "pointercancel")) {
        released = true; start();
      }
    };
    const screenAngle = () => window.screen.orientation?.angle ?? (window as Window & {orientation?:number}).orientation ?? 0;
    const orientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma) || document.hidden || reduced()) return;
      const reading = {beta:event.beta,gamma:event.gamma}, angle = screenAngle();
      if (angle !== orientationAngle) { reference = null; orientationAngle = angle; }
      const first = reference === null;
      if (first) { reference = reading; reset(); }
      const point = tiltLight(reading, reference!, angle, innerWidth, innerHeight);
      if (!point) return;
      if (first) {
        source = "tilt"; x = point.x; y = point.y; root.dataset.tiltStatus = "active";
        window.dispatchEvent(new Event(tiltStatusEvent));
      }
      targetX = point.x; targetY = point.y;
      if (first || Math.hypot(point.x-significantX,point.y-significantY) > 2) {
        significantX = point.x; significantY = point.y; source = "tilt"; hasLight = true; released = false; start();
      }
    };
    const recenter = () => { reference = null; };
    const syncTilt = () => {
      const enabled = coarse.matches && Boolean(orientationAPI()) && root.dataset.tilt !== "false" && !reduced();
      if (enabled === listening) return;
      listening = enabled; reference = null;
      if (enabled) window.addEventListener("deviceorientation", orientation, {passive:true});
      else {
        window.removeEventListener("deviceorientation", orientation);
        if (source === "tilt") { reset(); source = "mouse"; hasLight = false; released = true; }
        delete root.dataset.tiltStatus; window.dispatchEvent(new Event(tiltStatusEvent));
      }
    };
    const geometry = () => { dirty = true; start(); };
    const visibility = () => { if (document.hidden) reset(); else geometry(); };
    const changes = new MutationObserver(records => {
      const changedSurfaces = records.some(record => record.type === "childList" &&
        [...record.addedNodes,...record.removedNodes].some(node => node instanceof Element &&
          (node.matches(`${surfacesSelector},[data-public-mote],[data-public-light]`) ||
           node.querySelector(`${surfacesSelector},[data-public-mote],[data-public-light]`))));
      if (changedSurfaces && !collectionFrame) collectionFrame = requestAnimationFrame(collect);
      if (records.some(record => record.type === "attributes")) geometry();
    });
    const settings = new MutationObserver(() => { syncTilt(); if (reduced()) reset(); else geometry(); });
    collect();
    changes.observe(document.body, {subtree:true,childList:true,attributes:true,attributeFilter:["open"]});
    settings.observe(root, {attributes:true,attributeFilter:["data-effects","data-theme","data-timeline","data-tilt"]});
    syncTilt(); coarse.addEventListener("change", syncTilt);
    window.addEventListener(recenterTiltEvent, recenter);
    window.addEventListener("pointermove", move, {passive:true});
    window.addEventListener("pointerdown", move, {passive:true});
    window.addEventListener("pointercancel", release, {passive:true});
    root.addEventListener("pointerleave", release, {passive:true});
    document.addEventListener("scroll", geometry, {passive:true,capture:true});
    window.addEventListener("resize", geometry, {passive:true});
    window.addEventListener(materialGeometryEvent, geometry, {passive:true});
    document.addEventListener("visibilitychange", visibility);
    return () => {
      reset(); cancelAnimationFrame(collectionFrame); observer.disconnect(); resize.disconnect(); changes.disconnect(); settings.disconnect();
      coarse.removeEventListener("change", syncTilt); window.removeEventListener("deviceorientation", orientation);
      window.removeEventListener(recenterTiltEvent, recenter); window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move); window.removeEventListener("pointercancel", release);
      root.removeEventListener("pointerleave", release); document.removeEventListener("scroll", geometry, true);
      window.removeEventListener("resize", geometry); window.removeEventListener(materialGeometryEvent, geometry);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return null;
}
