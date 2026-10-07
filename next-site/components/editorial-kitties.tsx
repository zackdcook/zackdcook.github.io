"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { usePreferences } from "@/components/site-preferences";
import { kittyRibbonWindEvent } from "@/components/kitty-ribbon-billow";
import { createRibbon, dropRibbon, ribbonPaths, stepRibbon, ribbonWidth, ribbonHeight, type RibbonBounds, type RibbonGrab } from "@/lib/ribbon-physics";

const restingPaths = ribbonPaths(createRibbon());

export function EditorialKitties({ emptyPhoto, label = "Editorial kitty committee aka firing squad" }: { emptyPhoto?: string | null; label?: string }) {
  const { reduced } = usePreferences();
  const [escaped, setEscaped] = useState(false),[dismissed, setDismissed] = useState(false),[secretReady, setSecretReady] = useState(!emptyPhoto);
  const svg = useRef<SVGSVGElement>(null),surface = useRef<SVGGElement>(null),edge = useRef<SVGPathElement>(null),shadow = useRef<SVGPathElement>(null),hit = useRef<SVGPathElement>(null),lettering = useRef<SVGPathElement>(null),blur = useRef<SVGFEGaussianBlurElement>(null);
  const patches = useRef<(SVGGElement | null)[]>([]),clips = useRef<(SVGPathElement | null)[]>([]),frontSatin = useRef<SVGRadialGradientElement>(null),backSatin = useRef<SVGRadialGradientElement>(null);
  const drawOrder = useRef(""),button = useRef<HTMLButtonElement>(null),nodes = useRef(createRibbon()),bounds = useRef<RibbonBounds | undefined>(undefined),wind = useRef(0);
  const motion = useRef({ grab: null as RibbonGrab | null, frame: 0, lastFrame: 0, lastMove: 0, played: 0, pointer: null as number | null, offsetX: 0, offsetY: 0, previousX: 0, previousY: 0 });
  const escapedRef = useRef(false), reducedRef = useRef(reduced),id = useId().replace(/:/g, "");
  useEffect(() => { reducedRef.current = reduced; }, [reduced]);
  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);

  useEffect(()=>{
    const receive=(event:Event)=>{
      const strength=Math.max(0,Math.min(1.35,Number((event as CustomEvent<{strength?:number}>).detail?.strength)||0));
      // Scroll wind must use the viewport edge, not the photo/SVG edge.
      // Re-measure every impulse because the photo can move relative to the
      // viewport while the page scrolls.
      measureBounds();
      wind.current=Math.max(wind.current,strength);
      start();
    };
    window.addEventListener(kittyRibbonWindEvent,receive);
    return()=>window.removeEventListener(kittyRibbonWindEvent,receive);
  },[]);

  useEffect(() => {
    const element = svg.current; if (!element) return;
    let previousWidth = element.getBoundingClientRect().width;
    const resize = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect(); if (!rect.width || Math.abs(rect.width - previousWidth) < 1) return;
      previousWidth = rect.width; release(); bounds.current = undefined;
      const scale = rect.width / ribbonWidth, left = (18 - rect.left) / scale, right = (innerWidth - 18 - rect.left) / scale;
      const min = Math.min(...nodes.current.map(node => node.x)) - 20, max = Math.max(...nodes.current.map(node => node.x)) + 20, dx = min < left ? left - min : max > right ? right - max : 0;
      if (dx) { for (const node of nodes.current) node.x += dx; start(); }
    });
    resize.observe(element); return () => resize.disconnect();
  }, []);

  function paintSatin() {
    const style = button.current?.style;if (!style) return;
    const x = parseFloat(style.getPropertyValue("--ribbon-light-x")),y = parseFloat(style.getPropertyValue("--ribbon-light-y")),lightX = Number.isFinite(x) ? x : 380, lightY = Number.isFinite(y) ? y : 0;
    for (const gradient of [frontSatin.current, backSatin.current]) { gradient?.setAttribute("cx", lightX.toFixed(2)); gradient?.setAttribute("cy", lightY.toFixed(2)); }
  }
  useEffect(() => {
    const element = button.current;if (!element) return;
    const observer = new MutationObserver(paintSatin);observer.observe(element, { attributes: true, attributeFilter: ["style"] });return () => observer.disconnect();
  }, []);

  function animate(now: number) {
    const m = motion.current;m.frame = 0;
    const elapsed=now-(m.lastFrame||now-16.67);
    const moving = stepRibbon(nodes.current,m.grab,elapsed,reducedRef.current,bounds.current,wind.current);
    wind.current*=Math.pow(.965,Math.min(48,elapsed)/16.67);
    if(wind.current<.012)wind.current=0;
    m.lastFrame = now;
    const paths = ribbonPaths(nodes.current);
    for (const ref of [edge, shadow, hit]) ref.current?.setAttribute("d", paths.body);
    lettering.current?.setAttribute("d", paths.lettering);
    paths.segments.forEach((segment, index) => {
      const group = patches.current[index];clips.current[index]?.setAttribute("d", segment.path);group?.setAttribute("data-face", segment.front ? "front" : "back");
      for (const path of group?.querySelectorAll("path") ?? []) path.setAttribute("d", segment.path);
    });
    const order = paths.segments.map((segment,index)=>({depth:segment.depth,index})).sort((a,b)=>a.depth-b.depth||a.index-b.index).map(item=>item.index),key=order.join(",");
    if(key!==drawOrder.current){for(const index of order){const patch=patches.current[index];if(patch)surface.current?.appendChild(patch);}drawOrder.current=key;}
    paintSatin();svg.current?.style.setProperty("--ribbon-height", `${paths.height.toFixed(2)}px`);blur.current?.setAttribute("stdDeviation",(2+paths.height/24).toFixed(2));
    if(moving||wind.current>.01)m.frame=requestAnimationFrame(animate);
  }
  function start(){const m=motion.current;if(!m.frame){m.lastFrame=0;m.frame=requestAnimationFrame(animate);}}
  function measureBounds(){const rect=svg.current?.getBoundingClientRect();if(!rect?.width)return;const scale=rect.width/ribbonWidth;bounds.current={left:(18-rect.left)/scale,right:(innerWidth-18-rect.left)/scale,top:Number.NEGATIVE_INFINITY,bottom:Number.POSITIVE_INFINITY};}
  function play(x:number,y:number){const m=motion.current,now=performance.now();if(!m.grab)return;const distance=Math.hypot(x-m.previousX,y-m.previousY);if(distance>.8&&m.lastMove&&now-m.lastMove<240)m.played+=now-m.lastMove;m.lastMove=now;m.previousX=x;m.previousY=y;const b=bounds.current;m.grab.x=b?Math.max(b.left,Math.min(b.right,x)):x;m.grab.y=b?Math.max(b.top,Math.min(b.bottom,y)):y;start();if(m.played>2000&&!escapedRef.current){escapedRef.current=true;setEscaped(true);}}
  function release(resetClock=true){const m=motion.current;if(!m.grab)return;dropRibbon(nodes.current);m.pointer=null;m.grab=null;if(resetClock)m.lastMove=0;start();}
  function point(event:PointerEvent<HTMLButtonElement>){const matrix=svg.current?.getScreenCTM();return matrix?new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse()):null;}

  return <div className="kitty-discovery">
    <div className="life-photo">
      <div className="tactile-photo kitty-photo" data-escaped={escaped && secretReady ? "true" : undefined}>
        <div className="kitty-photo-layer kitty-photo-original" aria-hidden={escaped && secretReady || undefined}><Image src="/images/cats.webp" alt="Chemi, Tashi, and Brave relaxing on a rug beside a sunny window" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" /></div>
        <div className="kitty-photo-layer kitty-photo-secret" aria-hidden={!escaped || !secretReady}>
          {emptyPhoto ? <Image src={emptyPhoto} alt="A sunny window and cat tree, with two cats relaxing" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" onLoad={() => setSecretReady(true)} /> : <div className="empty-window-placeholder" role="img" aria-label="The cats have left. Zack’s empty-window photograph will go here."><span>Empty-window photo coming soon.</span></div>}
        </div>
      </div>
      <button ref={button} type="button" className="kitty-ribbon" aria-label="Play with the editorial kitty committee ribbon. Drag it, or use the arrow keys." aria-describedby={`${id}-ribbon-label`}
        onPointerDown={event=>{if(!event.isPrimary||event.button!==0||motion.current.pointer!==null)return;event.preventDefault();const p=point(event);if(!p)return;measureBounds();const m=motion.current,nearest=nodes.current.reduce((closest,node,index)=>Math.hypot(node.x-p.x,node.y-p.y)<Math.hypot(nodes.current[closest].x-p.x,nodes.current[closest].y-p.y)?index:closest,0),node=nodes.current[nearest];m.grab={index:nearest,x:node.x,y:node.y,phase:Math.random()*Math.PI*2};m.offsetX=p.x-node.x;m.offsetY=p.y-node.y;m.pointer=event.pointerId;m.played=0;m.lastMove=performance.now();m.previousX=node.x;m.previousY=node.y;event.currentTarget.setPointerCapture(event.pointerId);start();}}
        onPointerMove={event=>{const m=motion.current;if(event.pointerId!==m.pointer)return;event.preventDefault();const p=point(event);if(p)play(p.x-m.offsetX,p.y-m.offsetY);}}
        onPointerUp={event=>{if(event.pointerId===motion.current.pointer)release();}}
        onPointerCancel={event=>{if(event.pointerId===motion.current.pointer)release();}}
        onLostPointerCapture={event=>{if(event.pointerId===motion.current.pointer)release();}} onBlur={()=>release()}
        onKeyDown={event=>{const delta:Record<string,[number,number]>={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};if(delta[event.key]){event.preventDefault();const m=motion.current;if(!m.grab){measureBounds();const node=nodes.current[12];m.grab={index:12,x:node.x,y:node.y,phase:1};if(!m.lastMove)m.played=0;m.previousX=node.x;m.previousY=node.y;}play(m.grab.x+delta[event.key][0],m.grab.y+delta[event.key][1]);stepRibbon(nodes.current,m.grab,16.67,reducedRef.current,bounds.current,0);}else if(event.key==="Escape")release();}}
        onKeyUp={event=>{if(event.key.startsWith("Arrow"))release(false);}}>
        <span id={`${id}-ribbon-label`} className="sr-only">{label}. Pick up the strip to see it twist; release it to leave it there.</span>
        <svg ref={svg} viewBox={`0 0 ${ribbonWidth} ${ribbonHeight}`} aria-hidden="true" focusable="false">
          <defs><path ref={lettering} id={`${id}-lettering`} d={restingPaths.lettering} />{restingPaths.segments.map((segment,index)=><clipPath key={index} id={`${id}-patch-${index}`}><path ref={element=>{clips.current[index]=element;}} d={segment.path}/></clipPath>)}<radialGradient id={`${id}-front-satin`} ref={frontSatin} gradientUnits="userSpaceOnUse" cx="380" cy="0" r="460"><stop offset="0" stopColor="color-mix(in srgb,var(--ribbon-face-highlight) 82%,var(--ribbon-face-bg) 18%)"/><stop offset=".65" stopColor="var(--ribbon-face-bg)"/><stop offset="1" stopColor="var(--ribbon-face-bg)"/></radialGradient><radialGradient id={`${id}-back-satin`} ref={backSatin} gradientUnits="userSpaceOnUse" cx="380" cy="0" r="460"><stop offset="0" stopColor="color-mix(in srgb,var(--ribbon-face-highlight) 82%,var(--ribbon-face-bg) 18%)"/><stop offset=".65" stopColor="var(--ribbon-face-bg)"/><stop offset="1" stopColor="var(--ribbon-face-bg)"/></radialGradient><filter id={`${id}-soft-shadow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur ref={blur} stdDeviation="2"/></filter></defs>
          <path ref={shadow} className="ribbon-cast" d={restingPaths.body} filter={`url(#${id}-soft-shadow)`}/><path ref={edge} className="ribbon-thickness" d={restingPaths.body}/>
          <g ref={surface}>{restingPaths.segments.map((segment,index)=><g key={index} ref={element=>{patches.current[index]=element;}} className="ribbon-patch" data-face={segment.front?"front":"back"}><path className="ribbon-face ribbon-front-face" d={segment.path} fill={`url(#${id}-front-satin)`} stroke={`url(#${id}-front-satin)`}/><path className="ribbon-face ribbon-back-face" d={segment.path} fill={`url(#${id}-back-satin)`} stroke={`url(#${id}-back-satin)`}/><g clipPath={`url(#${id}-patch-${index})`}><text className="ribbon-lettering ribbon-front-label" textAnchor="middle" textLength="470" lengthAdjust="spacingAndGlyphs"><textPath href={`#${id}-lettering`} startOffset="50%">{label}</textPath></text></g></g>)}</g><path ref={hit} className="ribbon-hit" d={restingPaths.body}/>
        </svg>
      </button>
    </div>
    {escaped&&!dismissed&&<div className="cats-escaped" role="status"><p>Brave chased a shadow and got outside. Follow him?</p><div className="actions"><Link href="/bebrave" className="button">Yes</Link><button className="button" onClick={()=>setDismissed(true)}>No</button></div></div>}
  </div>;
}
