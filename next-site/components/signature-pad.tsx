"use client";

import { useEffect, useRef, useState } from "react";
import { signatureWidth, signatureHeight, type Point, type Stroke } from "@/lib/guestbook";

export function SignaturePad({ onChange }: { onChange: (strokes: Stroke[]) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const active = useRef<Stroke | null>(null);
  const box = useRef<DOMRect | null>(null);
  const drawingPointer = useRef<number | null>(null);
  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(false);
  const points = () => strokes.current.reduce((n, stroke) => n + stroke.length, 0);

  function redraw() {
    const el = canvas.current, ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    ctx.clearRect(0, 0, signatureWidth, signatureHeight);
    ctx.strokeStyle = "#31031F"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const stroke of [...strokes.current, ...(active.current ? [active.current] : [])]) {
      if (!stroke.length) continue;
      ctx.beginPath(); ctx.moveTo(...stroke[0]); for (const point of stroke.slice(1)) ctx.lineTo(...point); ctx.stroke();
    }
  }
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      el.width = Math.round(rect.width * ratio); el.height = Math.round(rect.width * ratio * signatureHeight / signatureWidth);
      el.getContext("2d")?.setTransform(el.width / signatureWidth, 0, 0, el.height / signatureHeight, 0, 0);
      redraw();
    };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    return () => observer.disconnect();
  }, []);
  const point = (event: { clientX: number; clientY: number }): Point => {
    const rect = box.current!;
    return [Math.round(Math.min(signatureWidth, Math.max(0, (event.clientX - rect.x) / rect.width * signatureWidth)) * 10) / 10, Math.round(Math.min(signatureHeight, Math.max(0, (event.clientY - rect.y) / rect.height * signatureHeight)) * 10) / 10];
  };
  const finish = () => {
    if (active.current?.length) {
      if (active.current.length === 1) active.current.push([...active.current[0]]);
      strokes.current.push(active.current); active.current = null;
      redraw();
      onChange(strokes.current.map(stroke => [...stroke])); setCount(strokes.current.length);
    }
    drawingPointer.current = null;
  };
  return <div>
    <p className="form-hint" id="drawing-help">Mouse, fingertip, or stylus. Keep your signature and tiny note inside this box. Prefer typing? Choose Type above.</p>
    <canvas ref={canvas} className="signature-pad" aria-label="Draw your signature" aria-describedby="drawing-help" role="img"
      onPointerDown={event => {
        if (event.button !== 0 || drawingPointer.current !== null || strokes.current.length >= 64 || points() >= 1198) { setLimit(true); return; }
        box.current = event.currentTarget.getBoundingClientRect(); drawingPointer.current = event.pointerId;
        active.current = [point(event)]; event.currentTarget.setPointerCapture(event.pointerId); setLimit(false);
      }}
      onPointerMove={event => {
        if (!active.current || event.pointerId !== drawingPointer.current) return;
        const samples = event.nativeEvent.getCoalescedEvents?.() || [event.nativeEvent];
        const ctx = canvas.current?.getContext("2d");
        const remaining = 1200 - points();
        for (const sample of samples.length ? samples : [event.nativeEvent]) {
          if (active.current.length >= remaining) { setLimit(true); break; }
          const next = point(sample), last = active.current[active.current.length - 1];
          if (Math.hypot(next[0] - last[0], next[1] - last[1]) < .9) continue;
          active.current.push(next);
          if (ctx) { ctx.strokeStyle = "#31031F"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...next); ctx.stroke(); }
        }
      }} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}>
      Drawing is optional. Choose Type to leave your name and a note.
    </canvas>
    {limit && <p className="form-hint" role="status">That’s the detail limit. You can undo a stroke or start again.</p>}
    <div className="actions"><button className="button button-small" type="button" disabled={!count} onClick={() => { strokes.current.pop(); setCount(strokes.current.length); setLimit(false); redraw(); onChange([...strokes.current]); }}>Undo stroke</button><button className="button button-small" type="button" disabled={!count} onClick={() => { strokes.current = []; active.current = null; setCount(0); setLimit(false); redraw(); onChange([]); }}>Clear drawing</button></div>
  </div>;
}
