"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function ContentRail({ label, count, children }: { label: string; count: number; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const next = { start: element.scrollLeft <= 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 };
      setEdges(old => old.start === next.start && old.end === next.end ? old : next);
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { element.removeEventListener("scroll", update); observer.disconnect(); };
  }, [count]);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    element.scrollBy({ left: direction * Math.min(element.clientWidth * .85, 520), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return <div className="content-rail">
    {count > 1 && <div className="rail-controls" aria-label={`${label} controls`}>
      <button type="button" onClick={() => move(-1)} disabled={edges.start} aria-label={`Previous ${label}`} aria-controls={id}>Previous</button>
      <button type="button" onClick={() => move(1)} disabled={edges.end} aria-label={`Next ${label}`} aria-controls={id}>Next</button>
    </div>}
    <div id={id} className="rail-track" role="region" aria-label={label} tabIndex={count > 1 ? 0 : undefined}>{children}</div>
  </div>;
}
