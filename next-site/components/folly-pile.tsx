"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { QuoteLeaf } from "@/components/quote-leaf";
import { usePreferences } from "@/components/site-preferences";
import { follyQuotes } from "@/content/folly";
import { makeLeafPile, moveLeaf, dragLeaf, leafGrabPoint, pushLeaves, stepLeaves, leafProjection, type LeafBody, type LeafBounds, type LeafPoint } from "@/lib/leaf-physics";
import { createLeafReader, requestReaderLeaf, finishReaderFall, leafRetireMs, type LeafReaderStack } from "@/lib/leaf-reader";

type Gesture = { id: number; origin: LeafPoint; previous: LeafPoint; time: number; dragging: boolean; touch: boolean; rect: DOMRect; leafIndex: number | null; grip: LeafPoint };
export function FollyPile() {
  const { reduced } = usePreferences();
  const stage = useRef<HTMLDivElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const buttons = useRef<(HTMLElement | null)[]>([]), bodies = useRef<LeafBody[]>([]);
  const bounds = useRef<LeafBounds>({ width: 1000, height: 720, leafWidth: 370 });
  const frame = useRef(0), last = useRef(0), gesture = useRef<Gesture | null>(null), suppressClick = useRef(false);
  const painted = useRef<string[]>([]), touchHold = useRef<ReturnType<typeof setTimeout> | null>(null), touchArmed = useRef(false);
  const opener = useRef<HTMLElement | null>(null), reducedRef = useRef(reduced);
  const retireTimer = useRef<ReturnType<typeof setTimeout> | null>(null), selectedRef=useRef(follyQuotes.length-1);
  const [selected, setSelected] = useState(follyQuotes.length - 1);
  const [reader, setReader] = useState<LeafReaderStack>(()=>createLeafReader(follyQuotes.length-1));
  const readerRef = useRef(reader);
  reducedRef.current = reduced;

  function paint() {
    bodies.current.forEach((leaf, i) => {
      const button = buttons.current[i]; if (!button) return;
      const projection = leafProjection(leaf);
      const transform = `translate(${leaf.x.toFixed(2)}px,${leaf.y.toFixed(2)}px) translate(-50%,-50%) matrix(${projection.a.toFixed(5)},${projection.b.toFixed(5)},${projection.c.toFixed(5)},${projection.d.toFixed(5)},0,0)`;
      if (painted.current[i] !== transform) { button.style.transform = transform; painted.current[i] = transform; }
      const order = String(leaf.order);
      if (button.style.zIndex !== order) button.style.zIndex = order;
    });
  }
  function animate(now: number) {
    frame.current = 0; if (reducedRef.current || dialog.current?.open || document.hidden) return;
    const g=gesture.current, held=g?.dragging && g.leafIndex!==null ? bodies.current[g.leafIndex] : undefined;
    const elapsed = Math.min((now - (last.current || now - 16.67)) / 1000, 1 / 30);
    if (held && g) dragLeaf(held,g.previous,g.grip,{x:0,y:0},elapsed,bounds.current);
    const moving = stepLeaves(bodies.current, elapsed, bounds.current, held);
    last.current = now; paint();
    if (moving || held) frame.current = requestAnimationFrame(animate);
  }
  function start() { if (!frame.current && !dialog.current?.open && !document.hidden && !reducedRef.current) { last.current = 0; frame.current = requestAnimationFrame(animate); } }
  function clearRetirement() { if (retireTimer.current) clearTimeout(retireTimer.current); retireTimer.current=null; }
  function updateReader(stack: LeafReaderStack) { readerRef.current=stack; setReader(stack); }
  function openLeaf(index: number, source?: HTMLButtonElement) {
    clearRetirement();
    cancelAnimationFrame(frame.current); frame.current=0; gesture.current=null;
    opener.current = source || buttons.current[index]; selectedRef.current=index; setSelected(index);
    updateReader(createLeafReader(index,!reducedRef.current,readerRef.current.serial+1));
    if (!dialog.current?.open) dialog.current?.showModal();
  }
  function changeLeaf(index: number) {
    const next=Math.max(0,Math.min(follyQuotes.length-1,index)), previous=selectedRef.current;
    if (next===previous) return;
    clearRetirement(); selectedRef.current=next; setSelected(next);
    const stack=requestReaderLeaf(readerRef.current,next,reducedRef.current);
    updateReader(stack);
    if (!reducedRef.current) retireTimer.current=setTimeout(()=>{retireTimer.current=null;updateReader(finishReaderFall(readerRef.current));},leafRetireMs);
    // A boundary can hide the button that initiated this change. Keep focus
    // inside the native dialog instead of leaving it on an invisible control.
    const nav=document.activeElement?.getAttribute("data-leaf-nav");
    if ((next===0 && (nav==="previous" || nav==="first")) || (next===follyQuotes.length-1 && (nav==="new" || nav==="last"))) dialog.current?.querySelector<HTMLButtonElement>(".leaf-reader-close")?.focus({preventScroll:true});
  }
  function dragTo(point: LeafPoint, now: number, element: HTMLDivElement) {
    const g = gesture.current; if (!g) return;
    if (!g.dragging && Math.hypot(point.x - g.origin.x, point.y - g.origin.y) < (g.touch ? 4 : 7)) return;
    if (!g.dragging) {
      g.dragging = true; suppressClick.current = true; element.dataset.dragging = "true";
      if (g.leafIndex !== null) bodies.current[g.leafIndex].order = 1 + Math.max(...bodies.current.map(leaf => leaf.order));
    }
    if (g.leafIndex !== null) {
      dragLeaf(bodies.current[g.leafIndex], point, g.grip, {x:point.x-g.previous.x,y:point.y-g.previous.y}, (now-g.time)/1000, bounds.current);
      paint(); start();
    } else if (pushLeaves(bodies.current,g.previous,point,(now-g.time)/1000,bounds.current)) start();
    g.previous = point; g.time = now;
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const g = gesture.current; if (!g || g.touch || event.pointerType !== "mouse" || g.id !== event.pointerId) return;
    const point = { x: event.clientX - g.rect.left, y: event.clientY - g.rect.top };
    event.preventDefault(); dragTo(point, performance.now(), event.currentTarget);
  }

  function release(event: PointerEvent<HTMLDivElement>) {
    const g=gesture.current;
    if (!g || g.touch || event.pointerType !== "mouse" || g.id !== event.pointerId) return;
    gesture.current = null; delete event.currentTarget.dataset.dragging;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (event.type === "pointerup" && !g.dragging && g.leafIndex!==null && g.leafIndex<follyQuotes.length) {
      suppressClick.current=true; openLeaf(g.leafIndex); return;
    }
    if (g.dragging && g.leafIndex!==null) {
      const leaf=bodies.current[g.leafIndex];leaf.vx*=.35;leaf.vy*=.35;
    }
    start();
  }
  useEffect(() => {
    const element = stage.current; if (!element) return;
    const layout = () => {
      cancelAnimationFrame(frame.current); frame.current = 0; gesture.current = null;
      const width = element.clientWidth, height = element.clientHeight;
      const leafWidth = Math.min(370, width * .44, height * .54);
      const previous = bounds.current;
      let moving=false;
      bounds.current = { width, height, leafWidth };
      if (!bodies.current.length) bodies.current = makeLeafPile(follyQuotes.length, bounds.current,follyQuotes.length);
      else {
        // Opening a reader changes the scrollbar gutter on some browsers.
        // Preserve the visitor's pile instead of creating it again.
        for (const leaf of bodies.current) { leaf.x *= width / Math.max(1,previous.width); leaf.y *= height / Math.max(1,previous.height); }
        moving=stepLeaves(bodies.current,0,bounds.current);
      }
      element.style.setProperty("--pile-leaf-width", `${leafWidth}px`);
      for (const button of buttons.current) {
        if (button) { button.style.left = "0px"; button.style.top = "0px"; }
      }
      paint();
      // A scrollbar/viewport resize must not freeze leaves in mid-flight.
      if (moving && !reducedRef.current) start();
    };
    const visibility=()=>{ if(document.hidden){cancelAnimationFrame(frame.current);frame.current=0;}else start(); };
    const observer = new ResizeObserver(layout); observer.observe(element); layout();
    document.addEventListener("visibilitychange",visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange",visibility); cancelAnimationFrame(frame.current); clearRetirement(); };
  }, []);
  useEffect(() => {
    const element = stage.current; if (!element) return;
    const clearHold = () => {
      if (touchHold.current) clearTimeout(touchHold.current);
      touchHold.current = null; touchArmed.current = false;
      delete element.dataset.grabReady;
    };
    const cancel = () => { clearHold(); gesture.current = null; delete element.dataset.dragging; start(); };
    const begin = (event: TouchEvent) => {
      if (reducedRef.current || event.touches.length !== 1) return;
      const hit = (event.target as Element).closest<HTMLElement>("[data-leaf-index]");
      if (!hit) return;
      const index = Number(hit.dataset.leafIndex), leaf = bodies.current[index], touch = event.touches[0];
      if (!leaf) return;
      clearHold(); suppressClick.current = false;
      const rect = element.getBoundingClientRect(), point = {x:touch.clientX-rect.left,y:touch.clientY-rect.top};
      const g: Gesture = {id:touch.identifier,origin:point,previous:point,time:performance.now(),dragging:false,touch:true,rect,leafIndex:index,grip:leafGrabPoint(leaf,point)};
      gesture.current = g;
      touchHold.current = setTimeout(() => {
        if (gesture.current === g && !reducedRef.current) { touchArmed.current = true; element.dataset.grabReady = "true"; }
      }, 320);
    };
    const move = (event: TouchEvent) => {
      const g = gesture.current;
      if (!g?.touch) return;
      if (event.touches.length !== 1 || reducedRef.current) { cancel(); return; }
      const touch = Array.from(event.touches).find(t => t.identifier === g.id); if (!touch) return;
      const point = {x:touch.clientX-g.rect.left,y:touch.clientY-g.rect.top};
      if (!touchArmed.current) {
        if (Math.hypot(point.x-g.origin.x,point.y-g.origin.y) > 8) cancel();
        return;
      }
      if (!event.cancelable) { cancel(); return; }
      event.preventDefault(); dragTo(point,performance.now(),element);
    };
    const end = (event: TouchEvent) => {
      const g = gesture.current;
      if (!g?.touch || !Array.from(event.changedTouches).some(t => t.identifier === g.id)) return;
      clearHold(); gesture.current = null; delete element.dataset.dragging;
      if (g.dragging && g.leafIndex !== null) {
        const leaf = bodies.current[g.leafIndex]; leaf.vx *= .35; leaf.vy *= .35;
        suppressClick.current = true; if (event.cancelable) event.preventDefault(); start();
      } else if (g.leafIndex !== null) {
        suppressClick.current = true; if (event.cancelable) event.preventDefault(); openLeaf(g.leafIndex);
      }
    };
    element.addEventListener("touchstart",begin,{passive:true});
    element.addEventListener("touchmove",move,{passive:false});
    element.addEventListener("touchend",end,{passive:false});
    element.addEventListener("touchcancel",cancel,{passive:true});
    return () => { clearHold(); element.removeEventListener("touchstart",begin); element.removeEventListener("touchmove",move); element.removeEventListener("touchend",end); element.removeEventListener("touchcancel",cancel); };
  }, []);
  useEffect(() => {
    if (!reduced) return;
    cancelAnimationFrame(frame.current); frame.current = 0; gesture.current = null;
    clearRetirement(); updateReader(createLeafReader(selectedRef.current,false,readerRef.current.serial+1));
    bodies.current.forEach(leaf => { leaf.z=leaf.base; leaf.rx = leaf.ry = leaf.vx = leaf.vy = leaf.vz = leaf.wx = leaf.wy = leaf.wz = 0; }); paint();
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
    <p className="folly-label">stuff I write to myself while I write other stuff</p>
    <span id="leaf-instructions" className="sr-only">Drag a leaf to arrange it. Drag from empty space into the pile to fluff and scatter the leaves. Click or tap a leaf to read it. On touch screens, swipe to scroll, or hold a leaf to pick it up. With a leaf focused, arrow keys move only that leaf; Enter opens it. In the reader, left and right arrows browse older and newer notes. Reduce Effects arranges the leaves in order, newest first.</span>
    <p className="folly-touch-hint">Swipe to scroll. Hold a leaf to pick it up.</p>
    <div ref={stage} className={`folly-ground ${reduced ? "folly-ground-readable" : ""}`} aria-describedby="leaf-instructions"
      onPointerDown={event => {
        if (event.pointerType !== "mouse" || reducedRef.current || !event.isPrimary || event.button !== 0) return;
        suppressClick.current = false;
        const rect = event.currentTarget.getBoundingClientRect(), point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        const hit=(event.target as Element).closest<HTMLElement>("[data-leaf-index]");
        const leafIndex=hit ? Number(hit.dataset.leafIndex) : null, leaf=leafIndex===null ? null : bodies.current[leafIndex];
        // Mouse drags capture immediately. Touch swipes stay native below.
        event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
        gesture.current = { id: event.pointerId, origin: point, previous: point, time: performance.now(), dragging: false, touch:event.pointerType!=="mouse", rect, leafIndex:leaf ? leafIndex : null, grip:leaf ? leafGrabPoint(leaf,point) : {x:0,y:0} };
      }} onPointerMove={move} onPointerUp={release} onPointerCancel={release}
      onLostPointerCapture={event => { if (event.target === event.currentTarget) release(event); }}
      onContextMenu={event => { if (!reducedRef.current) event.preventDefault(); }}>
      <ol className="folly-leaves" aria-label="Words of Folly, newest first">
        {[...follyQuotes].reverse().map((entry, position) => {
          const index = follyQuotes.length - 1 - position;
          return <li key={entry.id}><button id={`leaf-${entry.id}`} data-leaf-index={index} ref={element => { buttons.current[index] = element; }} className="pile-leaf" type="button" aria-label={`Read: ${entry.text}`} aria-haspopup="dialog"
            style={{ left: `${43 + index % 3 * 7}%`, top: `${210 + index % 3 * 70}px`, zIndex: index + 1, transform: `translate(-50%,-50%) rotate(${index * 51 - 130}deg)` } as CSSProperties}
            onClick={event => { if (event.detail !== 0 && suppressClick.current) { suppressClick.current = false; return; } openLeaf(index, event.currentTarget); }}
            onKeyDown={event => {
              if (reducedRef.current) return;
              const moves: Record<string,[number,number]> = { ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20] };
              const delta = moves[event.key], leaf = bodies.current[index]; if (!delta || !leaf) return;
              event.preventDefault(); leaf.order=1+Math.max(...bodies.current.map(item=>item.order));
              moveLeaf(leaf,{x:leaf.x+delta[0],y:leaf.y+delta[1]},{x:delta[0],y:delta[1]},.06,bounds.current); paint(); start();
            }}><QuoteLeaf quote={entry} index={index} /></button></li>;
        })}
      </ol>

    </div>
    <dialog className="leaf-reader" ref={dialog} style={{"--leaf-retire-time":`${leafRetireMs}ms`} as CSSProperties} aria-label="A Word of Folly" onClose={() => { clearRetirement(); updateReader(createLeafReader(selectedRef.current,false,readerRef.current.serial+1)); opener.current?.focus({ preventScroll: true }); start(); }}
      onKeyDown={event=>{
        const destination=event.key==="ArrowLeft" ? selectedRef.current-1 : event.key==="ArrowRight" ? selectedRef.current+1 : event.key==="Home" ? 0 : event.key==="End" ? follyQuotes.length-1 : null;
        if (destination!==null) {event.preventDefault(); changeLeaf(destination);}
      }}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="leaf-reader-toolbar"><button className="button leaf-reader-close dialog-close" autoFocus aria-label="Close leaf" onClick={() => dialog.current?.close()}>×</button></div>
      <div className="leaf-reader-content">
        <div className="reader-leaf-stage">
          {[reader.retiring,reader.underneath,reader.current].map(layer=>layer && <div key={layer.key}
            className={`reader-leaf ${layer===reader.current ? `reader-leaf-current${layer.falling ? " reader-leaf-falling" : ""}` : layer===reader.retiring ? "reader-leaf-retiring" : "reader-leaf-underneath"}`}
            role={layer===reader.current ? "img" : undefined} aria-label={layer===reader.current ? follyQuotes[layer.index].text : undefined} aria-hidden={layer===reader.current ? undefined : true}>
            <QuoteLeaf quote={follyQuotes[layer.index]} index={layer.index} />
          </div>)}
        </div>
        <div className="leaf-reader-nav">
          <button className="button leaf-reader-end" data-leaf-nav="first" aria-label="First leaf" title="first" disabled={selected===0} onClick={()=>changeLeaf(0)}>{"|<"}</button>
          <button className="button" data-leaf-nav="previous" style={{visibility:selected===0 ? "hidden" : undefined}} aria-hidden={selected===0 || undefined} tabIndex={selected===0 ? -1 : 0} disabled={selected===0} onClick={()=>changeLeaf(selected-1)}>previous</button>
          <span className="leaf-reader-count">{selected+1} of {follyQuotes.length}</span>
          <button className="button" data-leaf-nav="new" style={{visibility:selected===follyQuotes.length-1 ? "hidden" : undefined}} aria-hidden={selected===follyQuotes.length-1 || undefined} tabIndex={selected===follyQuotes.length-1 ? -1 : 0} disabled={selected===follyQuotes.length-1} onClick={()=>changeLeaf(selected+1)}>new leaf</button>
          <button className="button leaf-reader-end" data-leaf-nav="last" aria-label="Last leaf" title="last" disabled={selected===follyQuotes.length-1} onClick={()=>changeLeaf(follyQuotes.length-1)}>{">|"}</button>
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">Leaf {selected+1} of {follyQuotes.length}: {follyQuotes[selected].text}</p>
      </div>
    </dialog>
  </>;
}
