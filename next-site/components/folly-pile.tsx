"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { QuoteLeaf } from "@/components/quote-leaf";
import { usePreferences } from "@/components/site-preferences";
import { follyQuotes } from "@/content/folly";
import { makeLeafPile, pushLeaves, stepLeaves, type LeafBody, type LeafBounds, type LeafPoint } from "@/lib/leaf-physics";
import { materialGeometryEvent } from "@/lib/material-light";

type Gesture = { id: number; origin: LeafPoint; previous: LeafPoint; time: number; dragging: boolean; rect: DOMRect };
export function FollyPile() {
  const { reduced } = usePreferences();
  const stage = useRef<HTMLDivElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]), bodies = useRef<LeafBody[]>([]);
  const bounds = useRef<LeafBounds>({ width: 1000, height: 720, leafWidth: 370 });
  const frame = useRef(0), last = useRef(0), gesture = useRef<Gesture | null>(null), suppressClick = useRef(false);
  const opener = useRef<HTMLButtonElement | null>(null), reducedRef = useRef(reduced);
  const [selected, setSelected] = useState(follyQuotes.length - 1);
  reducedRef.current = reduced;

  function paint() {
    bodies.current.forEach((leaf, i) => {
      const button = buttons.current[i]; if (!button) return;
      button.style.left = button.style.top = "0px";
      button.style.transform = `translate3d(${leaf.x.toFixed(2)}px,${leaf.y.toFixed(2)}px,${leaf.z.toFixed(2)}px) translate(-50%,-50%) rotateX(${leaf.rx.toFixed(2)}deg) rotateY(${leaf.ry.toFixed(2)}deg) rotateZ(${leaf.rz.toFixed(2)}deg) scale(${leaf.scale.toFixed(3)})`;
      button.style.setProperty("--leaf-rz", String(leaf.rz));
      button.style.setProperty("--leaf-scale", String(leaf.scale));
      button.style.setProperty("--leaf-lift", `${leaf.z.toFixed(1)}px`);
      button.style.zIndex = String(i + 1);
    });
    window.dispatchEvent(new Event(materialGeometryEvent));
  }
  function animate(now: number) {
    frame.current = 0; if (reducedRef.current) return;
    const moving = stepLeaves(bodies.current, Math.min((now - (last.current || now - 16.67)) / 1000, 1 / 30), bounds.current);
    last.current = now; paint();
    if (moving) frame.current = requestAnimationFrame(animate);
  }
  function start() { if (!frame.current) { last.current = 0; frame.current = requestAnimationFrame(animate); } }
  function openLeaf(index: number, source?: HTMLButtonElement) {
    opener.current = source || buttons.current[index]; setSelected(index);
    if (!dialog.current?.open) dialog.current?.showModal();
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const g = gesture.current; if (!g || g.id !== event.pointerId) return;
    const point = { x: event.clientX - g.rect.left, y: event.clientY - g.rect.top }, now = performance.now();
    if (!g.dragging && Math.hypot(point.x - g.origin.x, point.y - g.origin.y) < 7) return;
    if (!g.dragging) { g.dragging = true; suppressClick.current = true; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.dataset.dragging = "true"; }
    event.preventDefault();
    if (pushLeaves(bodies.current, g.previous, point, (now - g.time) / 1000, bounds.current)) start();
    g.previous = point; g.time = now;
  }
  function release(event: PointerEvent<HTMLDivElement>) {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null; delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  useEffect(() => {
    const element = stage.current; if (!element) return;
    const layout = () => {
      cancelAnimationFrame(frame.current); frame.current = 0; gesture.current = null;
      const width = element.clientWidth, height = element.clientHeight;
      const leafWidth = Math.min(370, width * .52, height * .6);
      const previous = bounds.current;
      bounds.current = { width, height, leafWidth };
      if (!bodies.current.length) bodies.current = makeLeafPile(follyQuotes.length, bounds.current);
      else {
        // Opening a reader changes the scrollbar gutter on some browsers.
        // Preserve the visitor's pile instead of creating it again.
        for (const leaf of bodies.current) { leaf.x *= width / Math.max(1,previous.width); leaf.y *= height / Math.max(1,previous.height); }
        stepLeaves(bodies.current,0,bounds.current);
      }
      element.style.setProperty("--pile-leaf-width", `${leafWidth}px`); paint();
    };
    const observer = new ResizeObserver(layout); observer.observe(element); layout();
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current); };
  }, []);
  useEffect(() => {
    if (!reduced) return;
    cancelAnimationFrame(frame.current); frame.current = 0; gesture.current = null;
    bodies.current.forEach(leaf => { leaf.z = leaf.rx = leaf.ry = leaf.vx = leaf.vy = leaf.vz = leaf.wx = leaf.wy = leaf.wz = 0; }); paint();
  }, [reduced]);
  useEffect(() => {
    const fromHash = () => {
      const index = follyQuotes.findIndex(quote => `#leaf-${quote.id}` === window.location.hash);
      if (index >= 0) openLeaf(index);
    };
    fromHash(); window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  return <>
    <p className="folly-label">notes I wrote to myself while writing</p>
    <span id="leaf-instructions" className="sr-only">Drag inside the pile to push the leaves. Click or tap a leaf to read it. With a leaf focused, arrow keys push it; Enter opens it. Reduce Effects arranges the leaves in order, newest first.</span>
    <div ref={stage} className={`folly-ground ${reduced ? "folly-ground-readable" : ""}`} aria-describedby="leaf-instructions"
      onPointerDown={event => {
        if (reducedRef.current || !event.isPrimary || event.button !== 0) return;
        suppressClick.current = false;
        const rect = event.currentTarget.getBoundingClientRect(), point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        gesture.current = { id: event.pointerId, origin: point, previous: point, time: performance.now(), dragging: false, rect };
      }} onPointerMove={move} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
      onPointerLeave={event => { if (!gesture.current?.dragging) release(event); }}>
      <ol className="folly-leaves" aria-label="Words of Folly, newest first">
        {[...follyQuotes].reverse().map((entry, position) => {
          const index = follyQuotes.length - 1 - position;
          return <li key={entry.id}><button id={`leaf-${entry.id}`} ref={element => { buttons.current[index] = element; }} className="pile-leaf" type="button" aria-label={`Read: ${entry.text}`} aria-haspopup="dialog"
            style={{ left: `${43 + index % 3 * 7}%`, top: `${210 + index % 3 * 70}px`, zIndex: index + 1, transform: `translate(-50%,-50%) rotate(${index * 51 - 130}deg)` } as CSSProperties}
            onClick={event => { if (event.detail !== 0 && suppressClick.current) { suppressClick.current = false; return; } openLeaf(index, event.currentTarget); }}
            onKeyDown={event => {
              if (reducedRef.current) return;
              const moves: Record<string,[number,number]> = { ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20] };
              const delta = moves[event.key], leaf = bodies.current[index]; if (!delta || !leaf) return;
              event.preventDefault(); pushLeaves(bodies.current, { x:leaf.x,y:leaf.y }, { x:leaf.x+delta[0],y:leaf.y+delta[1] }, .06, bounds.current); start();
            }}><QuoteLeaf quote={entry} index={index} /><QuoteLeaf quote={entry} index={index} reverse /></button></li>;
        })}
      </ol>
    </div>
    <dialog className="leaf-reader" ref={dialog} aria-label="A Word of Folly" onClose={() => opener.current?.focus({ preventScroll: true })}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="leaf-reader-content">
        <button className="button leaf-reader-close" autoFocus aria-label="Close leaf" onClick={() => dialog.current?.close()}>Close</button>
        <div className="reader-leaf" role="img" aria-label={follyQuotes[selected].text}><QuoteLeaf quote={follyQuotes[selected]} index={selected} instance="reader" /></div>
        <div className="leaf-reader-nav"><button className="button" onClick={() => setSelected(index => (index + 1) % follyQuotes.length)}>Newer leaf</button><span>{selected + 1} of {follyQuotes.length}</span><button className="button" onClick={() => setSelected(index => (index - 1 + follyQuotes.length) % follyQuotes.length)}>Older leaf</button></div>
      </div>
    </dialog>
  </>;
}
