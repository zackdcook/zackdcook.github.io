"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { usePreferences } from "@/components/site-preferences";
import { createRibbon, ribbonPaths, stepRibbon, type RibbonGrab } from "@/lib/ribbon-physics";

const restingPaths = ribbonPaths(createRibbon());

export function EditorialKitties({ emptyPhoto, label = "The editorial kitty committee aka the firing squad." }: { emptyPhoto?: string | null; label?: string }) {
  const { reduced } = usePreferences();
  const [escaped, setEscaped] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const body = useRef<SVGPathElement>(null);
  const edge = useRef<SVGPathElement>(null);
  const shadow = useRef<SVGPathElement>(null);
  const lettering = useRef<SVGPathElement>(null);
  const nodes = useRef(createRibbon());
  const motion = useRef({ grab: null as RibbonGrab | null, frame: 0, lastFrame: 0, lastMove: 0, played: 0, pointer: false, startX: 0, startY: 0, previousX: 0, previousY: 0 });
  const escapedRef = useRef(false);
  const reducedRef = useRef(reduced);
  const id = useId().replace(/:/g, "");
  useEffect(() => { reducedRef.current = reduced; }, [reduced]);
  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);

  function animate(now: number) {
    const m = motion.current; m.frame = 0;
    const moving = stepRibbon(nodes.current, m.grab, now - (m.lastFrame || now - 16.67), reducedRef.current);
    m.lastFrame = now;
    const paths = ribbonPaths(nodes.current);
    body.current?.setAttribute("d", paths.body);
    edge.current?.setAttribute("d", paths.body);
    shadow.current?.setAttribute("d", paths.body);
    lettering.current?.setAttribute("d", paths.lettering);
    if (moving) m.frame = requestAnimationFrame(animate);
  }
  function start() {
    const m = motion.current;
    if (!m.frame) { m.lastFrame = 0; m.frame = requestAnimationFrame(animate); }
  }
  function play(x: number, y: number) {
    const m = motion.current, now = performance.now();
    if (!m.grab) return;
    const distance = Math.hypot(x - m.previousX, y - m.previousY);
    if (distance > .8 && m.lastMove && now - m.lastMove < 240) m.played += now - m.lastMove;
    m.lastMove = now; m.previousX = x; m.previousY = y;
    m.grab.x = Math.max(-110, Math.min(110, x));
    m.grab.y = Math.max(-85, Math.min(85, y));
    start();
    if (m.played > 2000 && !escapedRef.current) { escapedRef.current = true; setEscaped(true); }
  }
  function release(resetClock = true) {
    const m = motion.current;
    m.pointer = false; m.grab = null;
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
      <button type="button" className="photo-label kitty-ribbon" aria-label="Play with the editorial kitty committee ribbon. Drag it, or use the arrow keys." aria-describedby={`${id}-ribbon-label`}
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0) return;
          const p = point(event); if (!p) return;
          const m = motion.current;
          const nearest = nodes.current.reduce((closest, node, index) => Math.abs(node.x - p.x) < Math.abs(nodes.current[closest].x - p.x) ? index : closest, 0);
          m.grab = { index: nearest, x: 0, y: 0 }; m.pointer = true;
          m.played = 0; m.lastMove = performance.now(); m.previousX = m.previousY = 0;
          m.startX = p.x; m.startY = p.y;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => { const m = motion.current; if (m.pointer) { const p = point(event); if (p) play(p.x - m.startX, p.y - m.startY); } }}
        onPointerUp={() => release()} onPointerCancel={() => release()} onLostPointerCapture={() => release()} onBlur={() => release()}
        onKeyDown={event => {
          const delta: Record<string, [number, number]> = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
          if (delta[event.key]) {
            event.preventDefault(); const m = motion.current;
            if (!m.grab) { m.grab = { index: 4, x: 0, y: 0 }; if (!m.lastMove) m.played = 0; }
            play(m.grab.x + delta[event.key][0], m.grab.y + delta[event.key][1]);
          } else if (event.key === "Escape") release();
        }}
        onKeyUp={event => { if (event.key.startsWith("Arrow")) release(false); }}>
        <span id={`${id}-ribbon-label`} className="sr-only">{label}</span>
        <svg ref={svg} viewBox="0 0 640 180" aria-hidden="true" focusable="false">
          <defs>
            <path ref={lettering} id={`${id}-lettering`} d={restingPaths.lettering} />
            <filter id={`${id}-soft-shadow`} x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="2" /></filter>
          </defs>
          <path ref={shadow} className="ribbon-cast" d={restingPaths.body} filter={`url(#${id}-soft-shadow)`} />
          <path ref={body} className="ribbon-body" d={restingPaths.body} />
          <path ref={edge} className="ribbon-edge" d={restingPaths.body} />
          <text className="ribbon-lettering" textAnchor="middle"><textPath href={`#${id}-lettering`} startOffset="50%">{label}</textPath></text>
        </svg>
      </button>
    </div>
    {escaped && !dismissed && <div className="cats-escaped" role="status"><p>The cats chased a shadow and got outside. Follow them?</p><div className="actions"><Link href="/tree" className="button">Yes</Link><button className="button" onClick={() => setDismissed(true)}>No</button></div></div>}
  </div>;
}
