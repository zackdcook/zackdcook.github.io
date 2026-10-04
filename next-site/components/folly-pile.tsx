"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { QuoteLeaf } from "@/components/quote-leaf";
import { usePreferences } from "@/components/site-preferences";
import { follyQuotes } from "@/content/folly";
import { makeLeafPile, pushLeaves, stepLeaves, leafPerspective, type LeafBody, type LeafBounds, type LeafPoint } from "@/lib/leaf-physics";
import { materialGeometryEvent } from "@/lib/material-light";

type Gesture = { id: number; origin: LeafPoint; previous: LeafPoint; time: number; dragging: boolean; touch: boolean; rect: DOMRect };
const litterCount=12;
export function FollyPile() {
  const { reduced } = usePreferences();
  const stage = useRef<HTMLDivElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const buttons = useRef<(HTMLElement | null)[]>([]), bodies = useRef<LeafBody[]>([]);
  const bounds = useRef<LeafBounds>({ width: 1000, height: 720, leafWidth: 370 });
  const frame = useRef(0), last = useRef(0), gesture = useRef<Gesture | null>(null), suppressClick = useRef(false);
  const opener = useRef<HTMLElement | null>(null), reducedRef = useRef(reduced);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null), selectedRef=useRef(follyQuotes.length-1);
  const [selected, setSelected] = useState(follyQuotes.length - 1);
  const [outgoing,setOutgoing]=useState<number | null>(null), [turn,setTurn]=useState(0);
  reducedRef.current = reduced;

  function paint() {
    bodies.current.forEach((leaf, i) => {
      const button = buttons.current[i]; if (!button) return;
      button.style.left = button.style.top = "0px";
      button.style.transform = `translate3d(${leaf.x.toFixed(2)}px,${leaf.y.toFixed(2)}px,${leaf.z.toFixed(2)}px) translate(-50%,-50%) rotateX(${leaf.rx.toFixed(2)}deg) rotateY(${leaf.ry.toFixed(2)}deg) rotateZ(${leaf.rz.toFixed(2)}deg) scale(${leaf.scale.toFixed(3)})`;
      button.style.setProperty("--leaf-rz", String(leaf.rz));
      button.style.setProperty("--leaf-rx", String(leaf.rx));
      button.style.setProperty("--leaf-ry", String(leaf.ry));
      button.style.setProperty("--leaf-scale", String(leaf.scale));
      button.style.setProperty("--leaf-lift", `${Math.max(0,leaf.z-leaf.base).toFixed(1)}px`);
      button.style.zIndex = String(Math.round(leaf.z*100)+leaf.order);
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
    if (exitTimer.current) clearTimeout(exitTimer.current);
    opener.current = source || buttons.current[index]; selectedRef.current=index; setSelected(index); setOutgoing(null); setTurn(value=>value+1);
    if (!dialog.current?.open) dialog.current?.showModal();
  }
  function changeLeaf(index: number) {
    const next=Math.max(0,Math.min(follyQuotes.length-1,index)), previous=selectedRef.current;
    if (next===previous) return;
    if (exitTimer.current) clearTimeout(exitTimer.current);
    setOutgoing(reducedRef.current ? null : previous); selectedRef.current=next;
    setSelected(next); setTurn(value=>value+1);
    exitTimer.current=setTimeout(()=>setOutgoing(null),700);
    // A boundary can hide the button that initiated this change. Keep focus
    // inside the native dialog instead of leaving it on an invisible control.
    const active=document.activeElement;
    if ((next===0 && active?.getAttribute("data-leaf-nav")==="previous") || (next===follyQuotes.length-1 && active?.getAttribute("data-leaf-nav")==="new")) dialog.current?.querySelector<HTMLButtonElement>(".leaf-reader-close")?.focus({preventScroll:true});
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    const g = gesture.current; if (!g || g.id !== event.pointerId) return;
    const point = { x: event.clientX - g.rect.left, y: event.clientY - g.rect.top }, now = performance.now();
    if (!g.dragging && Math.hypot(point.x - g.origin.x, point.y - g.origin.y) < (g.touch ? 4 : 7)) return;
    if (!g.dragging) { g.dragging = true; suppressClick.current = true; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.dataset.dragging = "true"; }
    event.preventDefault();
    if (pushLeaves(bodies.current, g.previous, point, (now - g.time) / 1000, bounds.current,g.touch)) start();
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
      const leafWidth = Math.min(370, width * .44, height * .54);
      const previous = bounds.current;
      bounds.current = { width, height, leafWidth };
      if (!bodies.current.length) bodies.current = makeLeafPile(follyQuotes.length+litterCount, bounds.current,follyQuotes.length);
      else {
        // Opening a reader changes the scrollbar gutter on some browsers.
        // Preserve the visitor's pile instead of creating it again.
        for (const leaf of bodies.current) { leaf.x *= width / Math.max(1,previous.width); leaf.y *= height / Math.max(1,previous.height); }
        stepLeaves(bodies.current,0,bounds.current);
      }
      element.style.setProperty("--pile-leaf-width", `${leafWidth}px`); paint();
    };
    const observer = new ResizeObserver(layout); observer.observe(element); layout();
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current); if (exitTimer.current) clearTimeout(exitTimer.current); };
  }, []);
  useEffect(() => {
    if (!reduced) return;
    cancelAnimationFrame(frame.current); frame.current = 0; gesture.current = null;
    setOutgoing(null);
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
    <p className="folly-label">notes I wrote to myself while writing</p>
    <span id="leaf-instructions" className="sr-only">Drag inside the pile to fluff and push the leaves. Click or tap a leaf to read it. With a leaf focused, arrow keys push it; Enter opens it. In the reader, left and right arrows browse older and newer notes. Reduce Effects arranges the leaves in order, newest first.</span>
    <div ref={stage} className={`folly-ground ${reduced ? "folly-ground-readable" : ""}`} aria-describedby="leaf-instructions" style={{perspective:leafPerspective}}
      onPointerDown={event => {
        if (reducedRef.current || !event.isPrimary || event.button !== 0) return;
        suppressClick.current = false;
        const rect = event.currentTarget.getBoundingClientRect(), point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        gesture.current = { id: event.pointerId, origin: point, previous: point, time: performance.now(), dragging: false, touch:event.pointerType!=="mouse", rect };
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
      <div className="folly-litter" aria-hidden="true">{Array.from({length:litterCount},(_,i)=><span key={i} className="pile-leaf" ref={element=>{buttons.current[follyQuotes.length+i]=element;}}>
        <QuoteLeaf quote={follyQuotes[0]} index={i+1} instance={`litter-${i}`} blank /><QuoteLeaf quote={follyQuotes[0]} index={i+1} instance={`litter-${i}`} blank reverse />
      </span>)}</div>
    </div>
    <dialog className="leaf-reader" ref={dialog} aria-label="A Word of Folly" onClose={() => { if (exitTimer.current) clearTimeout(exitTimer.current); setOutgoing(null); opener.current?.focus({ preventScroll: true }); }}
      onKeyDown={event=>{
        const destination=event.key==="ArrowLeft" ? selectedRef.current-1 : event.key==="ArrowRight" ? selectedRef.current+1 : event.key==="Home" ? 0 : event.key==="End" ? follyQuotes.length-1 : null;
        if (destination!==null) {event.preventDefault(); changeLeaf(destination);}
      }}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="leaf-reader-content">
        <button className="button leaf-reader-close" autoFocus aria-label="Close leaf" onClick={() => dialog.current?.close()}>Close</button>
        <div className="reader-leaf-stage">
          {outgoing!==null && <div key={`out-${turn}`} className="reader-leaf reader-leaf-out" aria-hidden="true"><QuoteLeaf quote={follyQuotes[outgoing]} index={outgoing} instance={`reader-out-${turn}`} /></div>}
          <div key={`in-${turn}`} className="reader-leaf reader-leaf-in" role="img" aria-label={follyQuotes[selected].text}><QuoteLeaf quote={follyQuotes[selected]} index={selected} instance={`reader-${turn}`} /></div>
        </div>
        <div className="leaf-reader-nav">
          <button className="button leaf-reader-end" aria-label="First leaf" title="first" disabled={selected===0} onClick={()=>changeLeaf(0)}>{"|<"}</button>
          <button className="button" data-leaf-nav="previous" style={{visibility:selected===0 ? "hidden" : undefined}} aria-hidden={selected===0 || undefined} tabIndex={selected===0 ? -1 : 0} disabled={selected===0} onClick={()=>changeLeaf(selected-1)}>previous</button>
          <span className="leaf-reader-count">{selected+1} of {follyQuotes.length}</span>
          <button className="button" data-leaf-nav="new" style={{visibility:selected===follyQuotes.length-1 ? "hidden" : undefined}} aria-hidden={selected===follyQuotes.length-1 || undefined} tabIndex={selected===follyQuotes.length-1 ? -1 : 0} disabled={selected===follyQuotes.length-1} onClick={()=>changeLeaf(selected+1)}>new leaf</button>
          <button className="button leaf-reader-end" aria-label="Last leaf" title="last" disabled={selected===follyQuotes.length-1} onClick={()=>changeLeaf(follyQuotes.length-1)}>{">|"}</button>
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">Leaf {selected+1} of {follyQuotes.length}: {follyQuotes[selected].text}</p>
      </div>
    </dialog>
  </>;
}
