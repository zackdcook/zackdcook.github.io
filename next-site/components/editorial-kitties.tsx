"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { usePreferences } from "@/components/site-preferences";
import { createRibbon, dropRibbon, ribbonPaths, stepRibbon, ribbonWidth, ribbonHeight, type RibbonBounds, type RibbonGrab } from "@/lib/ribbon-physics";

const restingPaths = ribbonPaths(createRibbon());

export function EditorialKitties({ emptyPhoto, label = "Editorial kitty committee aka firing squad" }: { emptyPhoto?: string | null; label?: string }) {
  const { reduced } = usePreferences();
  const [escaped, setEscaped] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const surface = useRef<SVGGElement>(null);
  const edge = useRef<SVGPathElement>(null), shadow = useRef<SVGPathElement>(null), hit = useRef<SVGPathElement>(null);
  const lettering = useRef<SVGPathElement>(null), blur = useRef<SVGFEGaussianBlurElement>(null);
  const patches = useRef<(SVGGElement | null)[]>([]);
  const clips = useRef<(SVGPathElement | null)[]>([]);
  const frontSatin = useRef<SVGRadialGradientElement>(null), backSatin = useRef<SVGRadialGradientElement>(null);
  const drawOrder = useRef("");
  const button = useRef<HTMLButtonElement>(null);
  const nodes = useRef(createRibbon());
  const bounds = useRef<RibbonBounds | undefined>(undefined);
  const motion = useRef({ grab: null as RibbonGrab | null, frame: 0, lastFrame: 0, lastMove: 0, played: 0, pointer: null as number | null, offsetX: 0, offsetY: 0, previousX: 0, previousY: 0 });
  const escapedRef = useRef(false), reducedRef = useRef(reduced);
  const id = useId().replace(/:/g, "");
  useEffect(() => { reducedRef.current = reduced; }, [reduced]);
  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);
  useEffect(() => {
    const element = svg.current; if (!element) return;
    let previousWidth = element.getBoundingClientRect().width;
    const resize = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || Math.abs(rect.width - previousWidth) < 1) return;
      previousWidth = rect.width;
      // A dropped strip keeps its shape after a phone rotation, while staying
      // inside the narrower page. It never creates a horizontal scrollbar.
      release(); bounds.current = undefined;
      const scale = rect.width / ribbonWidth;
      const left = (18 - rect.left) / scale, right = (innerWidth - 18 - rect.left) / scale;
      const min = Math.min(...nodes.current.map(node => node.x)) - 20;
      const max = Math.max(...nodes.current.map(node => node.x)) + 20;
      const dx = min < left ? left - min : max > right ? right - max : 0;
      if (dx) { for (const node of nodes.current) node.x += dx; start(); }
    });
    resize.observe(element); return () => resize.disconnect();
  }, []);

  function paintSatin() {
    const style = button.current?.style;
    if (!style) return;
    const x = parseFloat(style.getPropertyValue("--ribbon-light-x"));
    const y = parseFloat(style.getPropertyValue("--ribbon-light-y"));
    const lightX = Number.isFinite(x) ? x : 380, lightY = Number.isFinite(y) ? y : 0;
    for (const gradient of [frontSatin.current, backSatin.current]) {
      gradient?.setAttribute("cx", lightX.toFixed(2)); gradient?.setAttribute("cy", lightY.toFixed(2));
    }
  }
  useEffect(() => {
    const element = button.current; if (!element) return;
    // Read inline shared-light variables only: no layout reads or React renders.
    const observer = new MutationObserver(paintSatin);
    observer.observe(element, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, []);

  function animate(now: number) {
    const m = motion.current; m.frame = 0;
    const moving = stepRibbon(nodes.current, m.grab, now - (m.lastFrame || now - 16.67), reducedRef.current, bounds.current);
    m.lastFrame = now;
    const paths = ribbonPaths(nodes.current);
    for (const ref of [edge, shadow, hit]) ref.current?.setAttribute("d", paths.body);
    lettering.current?.setAttribute("d", paths.lettering);
    paths.segments.forEach((segment, index) => {
      const group = patches.current[index];
      clips.current[index]?.setAttribute("d", segment.path);
      group?.setAttribute("data-face", segment.front ? "front" : "back");
      for (const path of group?.querySelectorAll("path") ?? []) path.setAttribute("d", segment.path);
    });
    // Raised fabric occludes the fabric underneath, including its lettering.
    const order = paths.segments.map((segment, index) => ({ depth: segment.depth, index })).sort((a, b) => a.depth - b.depth || a.index - b.index).map(item => item.index);
    const key = order.join(",");
    if (key !== drawOrder.current) {
      for (const index of order) { const patch = patches.current[index]; if (patch) surface.current?.appendChild(patch); }
      drawOrder.current = key;
    }
    paintSatin();
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
    dropRibbon(nodes.current);
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
        {escaped ? emptyPhoto ? <Image src={emptyPhoto} alt="A sunny window and cat tree, with two cats relaxing" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" /> : <div className="empty-window-placeholder" role="img" aria-label="The cats have left. Zack’s empty-window photograph will go here."><span>Empty-window photo coming soon.</span></div> : <Image src="/images/cats.webp" alt="Chemi, Tashi, and Brave relaxing on a rug beside a sunny window" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" />}
      </div>
      <button ref={button} type="button" className="kitty-ribbon" aria-label="Play with the editorial kitty committee ribbon. Drag it, or use the arrow keys." aria-describedby={`${id}-ribbon-label`}
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
            // A quick key tap can finish before the next animation frame.
            stepRibbon(nodes.current, m.grab, 16.67, reducedRef.current, bounds.current);
          } else if (event.key === "Escape") release();
        }}
        onKeyUp={event => { if (event.key.startsWith("Arrow")) release(false); }}>
        <span id={`${id}-ribbon-label`} className="sr-only">{label}. Pick up the strip to see it twist; release it to leave it there.</span>
        <svg ref={svg} viewBox={`0 0 ${ribbonWidth} ${ribbonHeight}`} aria-hidden="true" focusable="false">
          <defs>
            <path ref={lettering} id={`${id}-lettering`} d={restingPaths.lettering} />
            {restingPaths.segments.map((segment, index) => <clipPath key={index} id={`${id}-patch-${index}`}><path ref={element => { clips.current[index] = element; }} d={segment.path} /></clipPath>)}
            {/* One continuous opaque satin field per face avoids patch seams.
                The shared point light moves its very restrained warm sheen. */}
            <radialGradient id={`${id}-front-satin`} ref={frontSatin} gradientUnits="userSpaceOnUse" cx="380" cy="0" r="460">
              <stop offset="0" stopColor="color-mix(in srgb,var(--coral) calc(7% + var(--light-strength,0)*11%),var(--midnight))" />
              <stop offset=".65" stopColor="color-mix(in srgb,var(--coral) 3%,var(--midnight))" /><stop offset="1" stopColor="var(--midnight)" />
            </radialGradient>
            <radialGradient id={`${id}-back-satin`} ref={backSatin} gradientUnits="userSpaceOnUse" cx="380" cy="0" r="460">
              <stop offset="0" stopColor="color-mix(in srgb,var(--floral) calc(5% + var(--light-strength,0)*10%),var(--coral))" />
              <stop offset=".65" stopColor="var(--coral)" /><stop offset="1" stopColor="color-mix(in srgb,var(--midnight) 6%,var(--coral))" />
            </radialGradient>
            <filter id={`${id}-soft-shadow`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur ref={blur} stdDeviation="2" /></filter>
          </defs>
          <path ref={shadow} className="ribbon-cast" d={restingPaths.body} filter={`url(#${id}-soft-shadow)`} />
          <path ref={edge} className="ribbon-thickness" d={restingPaths.body} />
          <g ref={surface}>{restingPaths.segments.map((segment, index) => <g key={index} ref={element => { patches.current[index] = element; }} className="ribbon-patch" data-face={segment.front ? "front" : "back"}>
            <path className="ribbon-face ribbon-front-face" d={segment.path} fill={`url(#${id}-front-satin)`} stroke={`url(#${id}-front-satin)`} />
            <path className="ribbon-face ribbon-back-face" d={segment.path} fill={`url(#${id}-back-satin)`} stroke={`url(#${id}-back-satin)`} />
            <g clipPath={`url(#${id}-patch-${index})`}>
              <text className="ribbon-lettering ribbon-front-label" textAnchor="middle" textLength="470" lengthAdjust="spacingAndGlyphs"><textPath href={`#${id}-lettering`} startOffset="50%">{label}</textPath></text>
            </g>
          </g>)}</g>
          <path ref={hit} className="ribbon-hit" d={restingPaths.body} />
        </svg>
      </button>
    </div>
    {escaped && !dismissed && <div className="cats-escaped" role="status"><p>The cats chased a shadow and got outside. Follow them?</p><div className="actions"><Link href="/tree" className="button">Yes</Link><button className="button" onClick={() => setDismissed(true)}>No</button></div></div>}
  </div>;
}
