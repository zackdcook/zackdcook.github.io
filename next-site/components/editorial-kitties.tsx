"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/components/site-preferences";

export function EditorialKitties({ emptyPhoto, label = "The editorial kitty committee aka the firing squad." }: { emptyPhoto?: string | null; label?: string }) {
  const { reduced } = usePreferences();
  const [escaped, setEscaped] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const ribbon = useRef<HTMLButtonElement>(null);
  const motion = useRef({ x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0, frame: 0, lastFrame: 0, lastMove: 0, played: 0, grabbing: false, startX: 0, startY: 0 });
  const escapedRef = useRef(false);
  const reducedRef = useRef(reduced); reducedRef.current = reduced;
  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);
  function animate(now: number) {
    const m = motion.current; m.frame = 0;
    const dt = Math.min(2, (now - (m.lastFrame || now - 16)) / 16.67); m.lastFrame = now;
    if (reducedRef.current) { m.x = m.targetX; m.y = m.targetY; m.vx = m.vy = 0; }
    else { m.vx = (m.vx + (m.targetX - m.x) * .12 * dt) * Math.pow(.66, dt); m.vy = (m.vy + (m.targetY - m.y) * .12 * dt) * Math.pow(.66, dt); m.x += m.vx * dt; m.y += m.vy * dt; }
    if (ribbon.current) ribbon.current.style.transform = `translate(${m.x.toFixed(2)}px,${m.y.toFixed(2)}px) rotate(${(-10 + (reducedRef.current ? 0 : m.x * .04 + m.vx * .24)).toFixed(2)}deg)`;
    if (Math.abs(m.x - m.targetX) + Math.abs(m.y - m.targetY) + Math.abs(m.vx) + Math.abs(m.vy) > .12) m.frame = requestAnimationFrame(animate);
  }
  function start() { const m = motion.current; if (!m.frame) { m.lastFrame = 0; m.frame = requestAnimationFrame(animate); } }
  function play(x: number, y: number) {
    const m = motion.current, now = performance.now();
    x = Math.max(-100, Math.min(100, x)); y = Math.max(-65, Math.min(65, y));
    const distance = Math.hypot(x - m.targetX, y - m.targetY);
    if (distance > 1 && m.lastMove && now - m.lastMove < 180) m.played += now - m.lastMove;
    m.lastMove = now; m.targetX = Math.max(-100, Math.min(100, x)); m.targetY = Math.max(-65, Math.min(65, y)); start();
    if (m.played > 2000 && !escapedRef.current) { escapedRef.current = true; setEscaped(true); }
  }
  function release(resetClock = true) { const m = motion.current; m.grabbing = false; m.targetX = m.targetY = 0; if (resetClock) m.lastMove = 0; start(); }
  return <div className="kitty-discovery">
    <div className="life-photo">
      <div className="tactile-photo kitty-photo">
        {escaped ? emptyPhoto ? <Image src={emptyPhoto} alt="The sunny window, with the cats gone" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" /> : <div className="empty-window-placeholder" role="img" aria-label="The cats have left. Zack’s empty-window photograph will go here."><span>Empty-window photo coming soon.</span></div> : <Image src="/images/cats.webp" alt="Chemi, Tashi, and Brave relaxing on a rug beside a sunny window" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" />}
      </div>
      <button type="button" ref={ribbon} className="photo-label kitty-ribbon" aria-label="Play with the editorial kitty committee ribbon. Drag it, or use the arrow keys." onPointerDown={e => { const m = motion.current; m.grabbing = true; m.played = 0; m.lastMove = performance.now(); m.startX = e.clientX - m.x; m.startY = e.clientY - m.y; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => { const m = motion.current; if (m.grabbing) play(e.clientX - m.startX, e.clientY - m.startY); }} onPointerUp={() => release()} onPointerCancel={() => release()} onBlur={() => release()} onKeyDown={e => { const delta: Record<string, [number,number]> = { ArrowLeft: [-12,0], ArrowRight: [12,0], ArrowUp: [0,-12], ArrowDown: [0,12] }; if (delta[e.key]) { e.preventDefault(); const m = motion.current; play(m.targetX + delta[e.key][0], m.targetY + delta[e.key][1]); } else if (e.key === "Escape") release(); }} onKeyUp={e => { if (e.key.startsWith("Arrow")) release(false); }}>{label}</button>
    </div>
    {escaped && !dismissed && <div className="cats-escaped" role="status"><p>The cats chased a shadow and got outside. Follow them?</p><div className="actions"><Link href="/tree" className="button">Yes</Link><button className="button" onClick={() => setDismissed(true)}>No</button></div></div>}
  </div>;
}
