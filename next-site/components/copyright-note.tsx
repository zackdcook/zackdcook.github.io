"use client";

import { useEffect, useRef, useState } from "react";

export function CopyrightNote({ startYear, year, name }: { startYear?: number; year: number; name: string }) {
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  const wait = () => { clear(); timer.current = setTimeout(() => setRevealed(true), 2200); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  return <p className="copyright" onPointerEnter={e => { if (e.pointerType === "mouse") wait(); }} onPointerLeave={() => { clear(); setRevealed(false); }} onPointerDown={e => { if (e.pointerType !== "mouse") wait(); }} onPointerUp={e => { if (e.pointerType !== "mouse") clear(); }} onPointerCancel={clear}>
    © {startYear ? `${startYear}–${year}` : year} {name}{revealed && <span className="copyright-secret">. Please don’t steal my shit.</span>}
  </p>;
}
