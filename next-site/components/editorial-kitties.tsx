"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { usePreferences } from "@/components/site-preferences";
import { createRibbon, ribbonPaths, stepRibbon, ribbonWidth, ribbonHeight, type RibbonBounds, type RibbonGrab } from "@/lib/ribbon-physics";

const restingPaths = ribbonPaths(createRibbon());
const backLabel = "aka the firing squad";

export function EditorialKitties({ emptyPhoto, label = "The editorial kitty committee." }: { emptyPhoto?: string | null; label?: string }) {
  const { reduced } = usePreferences();
  const [escaped, setEscaped] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const front = useRef<SVGPathElement>(null), back = useRef<SVGPathElement>(null);
  const frontClip = useRef<SVGPathElement>(null), backClip = useRef<SVGPathElement>(null), sheenClip = useRef<SVGPathElement>(null);
  const edge = useRef<SVGPathElement>(null), shadow = useRef<SVGPathElement>(null), hit = useRef<SVGPathElement>(null);
  const lettering = useRef<SVGPathElement>(null), blur = useRef<SVGFEGaussianBlurElement>(null);
  const shading = useRef<(SVGPathElement | null)[]>([]);
  const nodes = useRef(createRibbon());
  const bounds = useRef<RibbonBounds | undefined>(undefined);
  const motion = useRef({ grab: null as RibbonGrab | null, frame: 0, lastFrame: 0, lastMove: 0, played: 0, pointer: null as number | null, offsetX: 0, offsetY: 0, previousX: 0, previousY: 0 });
  const escapedRef = useRef(false), reducedRef = useRef(reduced);
  const id = useId().replace(/:/g, "");
  useEffect(() => { reducedRef.current = reduced; }, [reduced]);
  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);

  function animate(now: number) {
    const m = motion.current; m.frame = 0;
    const moving = stepRibbon(nodes.current, m.grab, now - (m.lastFrame || now - 16.67), reducedRef.current, bounds.current);
    m.lastFrame = now;
    const paths = ribbonPaths(nodes.current);
    for (const ref of [edge, shadow, hit, sheenClip]) ref.current?.setAttribute("d", paths.body);
    front.current?.setAttribute("d", paths.front); frontClip.current?.setAttribute("d", paths.front);
    back.current?.setAttribute("d", paths.back); backClip.current?.setAttribute("d", paths.back);
    lettering.current?.setAttribute("d", paths.lettering);
    paths.segments.forEach((segment, index) => {
      shading.current[index]?.setAttribute("d", segment.path);
      shading.current[index]?.setAttribute("opacity", String(segment.shade));
    });
    svg.current?.style.setProperty("--ribbon-height", `${paths.height.toFixed(2)}px`);
    blur.current?.setAttribute("stdDeviation", (2 + paths.height / 24).toFixed(2));
    if (moving) m.frame = requestAnimationFrame(animate);
  }
  function start() {
    const m = motion.current;
    if (!m.frame) { m.lastFrame = 0; m.frame = requestAnimationFrame(animate); }
  }
  function measureBounds() {
    const rect = svg.current?.getBoundingClientRect();
    if (!rect?.width) return;
    const scale = rect.width / ribbonWidth;
    const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    bounds.current = { left: (18 - rect.left) / scale, right: (innerWidth - 18 - rect.left) / scale, top: (Math.max(18, header + 18) - rect.top) / scale, bottom: (innerHeight - 18 - rect.top) / scale };
  }
  function play(x: number, y: number) {
    const m = motion.current, now = performance.now();
    if (!m.grab) return;
    const distance = Math.hypot(x - m.previousX, y - m.previousY);
    if (distance > .8 && m.lastMove && now - m.lastMove < 240) m.played += now - m.lastMove;
    m.lastMove = now; m.previousX = x; m.previousY = y;
    const b = bounds.current;
    m.grab.x = b ? Math.max(b.left, Math.min(b.right, x)) : x;
    m.grab.y = b ? Math.max(b.top, Math.min(b.bottom, y)) : y;
    start();
    if (m.played > 2000 && !escapedRef.current) { escapedRef.current = true; setEscaped(true); }
  }
  function release(resetClock = true) {
    const m = motion.current;
    if (!m.grab) return;
    m.pointer = null; m.grab = null;
    if (resetClock) m.lastMove = 0;
    start();
  }
  function point(event: PointerEvent<HTMLButtonElement>) {
    const matrix = svg.current?.getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null;
  }
  return <div className="kitty-discovery">
    <div className="life-photo">
      <div className="tactile-photo kitty-photo">
        {escaped ? emptyPhoto ? <Image src={emptyPhoto} alt="The sunny window, with the cats gone" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" /> : <div className="empty-window-placeholder" role="img" aria-label="The cats have left. Zack’s empty-window photograph will go here."><span>Empty-window photo coming soon.</span></div> : <Image src="/images/cats.webp" alt="Chemi, Tashi, and Brave relaxing on a rug beside a sunny window" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" />}
      </div>
      <button type="button" className="kitty-ribbon" aria-label="Play with the editorial kitty committee ribbon. Drag it, or use the arrow keys." aria-describedby={`${id}-ribbon-label`}
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0 || motion.current.pointer !== null) return;
          event.preventDefault();
          const p = point(event); if (!p) return;
          measureBounds();
          const m = motion.current;
          const nearest = nodes.current.reduce((closest, node, index) => Math.hypot(node.x - p.x, node.y - p.y) < Math.hypot(nodes.current[closest].x - p.x, nodes.current[closest].y - p.y) ? index : closest, 0);
          const node = nodes.current[nearest];
          m.grab = { index: nearest, x: node.x, y: node.y, phase: Math.random() * Math.PI * 2 };
          m.offsetX = p.x - node.x; m.offsetY = p.y - node.y; m.pointer = event.pointerId;
          m.played = 0; m.lastMove = performance.now(); m.previousX = node.x; m.previousY = node.y;
          event.currentTarget.setPointerCapture(event.pointerId); start();
        }}
        onPointerMove={event => {
          const m = motion.current;
          if (event.pointerId !== m.pointer) return;
          event.preventDefault(); const p = point(event);
          if (p) play(p.x - m.offsetX, p.y - m.offsetY);
        }}
        onPointerUp={event => { if (event.pointerId === motion.current.pointer) release(); }}
        onPointerCancel={event => { if (event.pointerId === motion.current.pointer) release(); }}
        onLostPointerCapture={event => { if (event.pointerId === motion.current.pointer) release(); }} onBlur={() => release()}
        onKeyDown={event => {
          const delta: Record<string, [number, number]> = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
          if (delta[event.key]) {
            event.preventDefault(); const m = motion.current;
            if (!m.grab) {
              measureBounds(); const node = nodes.current[12];
              m.grab = { index: 12, x: node.x, y: node.y, phase: 1 };
              if (!m.lastMove) m.played = 0;
              m.previousX = node.x; m.previousY = node.y;
            }
            play(m.grab.x + delta[event.key][0], m.grab.y + delta[event.key][1]);
          } else if (event.key === "Escape") release();
        }}
        onKeyUp={event => { if (event.key.startsWith("Arrow")) release(false); }}>
        <span id={`${id}-ribbon-label`} className="sr-only">Front: {label} Reverse: {backLabel}. Pick up the strip to see it twist; release it to leave it there.</span>
        <svg ref={svg} viewBox={`0 0 ${ribbonWidth} ${ribbonHeight}`} aria-hidden="true" focusable="false">
          <defs>
            <path ref={lettering} id={`${id}-lettering`} d={restingPaths.lettering} />
            <clipPath id={`${id}-front`}><path ref={frontClip} d={restingPaths.front} /></clipPath>
            <clipPath id={`${id}-back`}><path ref={backClip} d={restingPaths.back} /></clipPath>
            <clipPath id={`${id}-sheen`}><path ref={sheenClip} d={restingPaths.body} /></clipPath>
            <linearGradient id={`${id}-satin`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--floral)" stopOpacity="0" /><stop offset=".42" stopColor="var(--coral)" stopOpacity=".25" /><stop offset=".5" stopColor="var(--floral)" stopOpacity=".55" /><stop offset=".58" stopColor="var(--coral)" stopOpacity=".25" /><stop offset="1" stopColor="var(--floral)" stopOpacity="0" /></linearGradient>
            <pattern id={`${id}-weave`} width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0h3 M0 0v3" stroke="var(--coral)" strokeWidth=".35" strokeOpacity=".14" /></pattern>
            <filter id={`${id}-soft-shadow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur ref={blur} stdDeviation="2" /></filter>
          </defs>
          <path ref={shadow} className="ribbon-cast" d={restingPaths.body} filter={`url(#${id}-soft-shadow)`} />
          <path ref={front} className="ribbon-front" d={restingPaths.front} />
          <path ref={back} className="ribbon-back" d={restingPaths.back} />
          <g className="ribbon-folds">{restingPaths.segments.map((segment, index) => <path key={index} ref={element => { shading.current[index] = element; }} d={segment.path} opacity={segment.shade} />)}</g>
          <g clipPath={`url(#${id}-sheen)`}><rect width="2000" height="2000" x="-640" y="-640" fill={`url(#${id}-weave)`} /><g className="ribbon-satin"><rect x="-1500" y="-42" width="3000" height="84" fill={`url(#${id}-satin)`} /></g></g>
          <path ref={edge} className="ribbon-edge" d={restingPaths.body} />
          <text className="ribbon-lettering" textAnchor="middle" clipPath={`url(#${id}-front)`}><textPath href={`#${id}-lettering`} startOffset="50%">{label}</textPath></text>
          <text className="ribbon-lettering ribbon-handwriting" textAnchor="middle" clipPath={`url(#${id}-back)`}><textPath href={`#${id}-lettering`} startOffset="50%">{backLabel}</textPath></text>
          <path ref={hit} className="ribbon-hit" d={restingPaths.body} />
        </svg>
      </button>
    </div>
    {escaped && !dismissed && <div className="cats-escaped" role="status"><p>The cats chased a shadow and got outside. Follow them?</p><div className="actions"><Link href="/tree" className="button">Yes</Link><button className="button" onClick={() => setDismissed(true)}>No</button></div></div>}
  </div>;
}
