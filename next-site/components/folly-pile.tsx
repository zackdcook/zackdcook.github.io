"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { QuoteLeaf } from "@/components/quote-leaf";
import { usePreferences } from "@/components/site-preferences";
import { follyQuotes } from "@/content/folly";
import { blowLeaves, makeLeafPile, stepLeaves, type LeafBody, type LeafBounds } from "@/lib/leaf-physics";

type Gust = { id: number; x: number; y: number };

export function FollyPile() {
  const { reduced } = usePreferences();
  const stage = useRef<HTMLDivElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const bodies = useRef<LeafBody[]>([]), bounds = useRef<LeafBounds>({ width: 1000, height: 700, leafWidth: 350 });
  const frame = useRef(0), last = useRef(0), gustTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const opener = useRef<HTMLButtonElement | null>(null);
  const [selected, setSelected] = useState(0), [gust, setGust] = useState<Gust | null>(null);
  const [readingList, setReadingList] = useState(false);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  function paint() {
    bodies.current.forEach((leaf, i) => {
      const button = buttons.current[i]; if (!button) return;
      button.style.left = "0px"; button.style.top = "0px";
      button.style.transform = `translate3d(${leaf.x.toFixed(2)}px,${leaf.y.toFixed(2)}px,${leaf.z.toFixed(2)}px) translate(-50%,-50%) rotateX(${leaf.rx.toFixed(2)}deg) rotateY(${leaf.ry.toFixed(2)}deg) rotateZ(${leaf.rz.toFixed(2)}deg)`;
      button.style.setProperty("--leaf-shadow-y", `${(4 + leaf.z * .08).toFixed(1)}px`);
      button.style.setProperty("--leaf-shadow-blur", `${(5 + leaf.z * .05).toFixed(1)}px`);
      button.style.zIndex = String(i + 1 + Math.round(leaf.z));
    });
  }
  function animate(now: number) {
    frame.current = 0;
    if (reducedRef.current) return;
    const moving = stepLeaves(bodies.current, Math.min((now - (last.current || now - 16.67)) / 1000, 1 / 30), bounds.current);
    last.current = now; paint();
    if (moving) frame.current = requestAnimationFrame(animate);
  }
  function start() {
    if (!frame.current) { last.current = 0; frame.current = requestAnimationFrame(animate); }
  }
  function openLeaf(index: number, source?: HTMLButtonElement) {
    opener.current = source || buttons.current[index]; setSelected(index); dialog.current?.showModal();
  }
  function blow(x: number, y: number) {
    if (reducedRef.current || readingList) return;
    blowLeaves(bodies.current, x, y); start();
    setGust({ id: Date.now(), x, y });
    clearTimeout(gustTimer.current); gustTimer.current = setTimeout(() => setGust(null), 950);
  }
  useEffect(() => {
    const element = stage.current; if (!element) return;
    const layout = () => {
      cancelAnimationFrame(frame.current); frame.current = 0;
      const width = element.clientWidth, height = element.clientHeight;
      const leafWidth = Math.min(350, Math.max(240, width * .45));
      bounds.current = { width, height, leafWidth };
      bodies.current = makeLeafPile(follyQuotes.length, bounds.current);
      element.style.setProperty("--pile-leaf-width", `${leafWidth}px`); paint();
    };
    const observer = new ResizeObserver(layout); observer.observe(element); layout();
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current); clearTimeout(gustTimer.current); };
  }, [readingList]);
  useEffect(() => {
    if (!reduced) return;
    cancelAnimationFrame(frame.current); frame.current = 0; setGust(null);
    bodies.current.forEach(leaf => { leaf.z = leaf.rx = leaf.ry = leaf.vx = leaf.vy = leaf.vz = leaf.wx = leaf.wy = leaf.wz = 0; }); paint();
  }, [reduced]);
  useEffect(() => {
    const fromHash = () => {
      const index = follyQuotes.findIndex(quote => `#leaf-${quote.id}` === window.location.hash);
      if (index >= 0) openLeaf(index);
    };
    fromHash(); window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const quote = follyQuotes[selected];
  return <>
    <div className="folly-tools">
      <p id="leaf-instructions">Little reminders I leave myself while writing.<br />Tap a leaf to read it. Tap between them to stir things up.</p>
      <div className="actions">
        {!reduced && !readingList && <button className="button" onClick={() => blow(bounds.current.width / 2, bounds.current.height / 2)}>A little gust</button>}
        <button className="button button-outline" aria-pressed={readingList} onClick={() => setReadingList(value => !value)}>{readingList ? "Back to the pile" : "Read in order"}</button>
      </div>
    </div>
    <div ref={stage} className={`folly-ground ${readingList || reduced ? "folly-ground-readable" : ""}`} aria-describedby="leaf-instructions"
      style={{ "--pile-height": `${Math.max(700, 440 + Math.ceil(follyQuotes.length / 5) * 160)}px` } as CSSProperties}
      onClick={event => {
        if ((event.target as HTMLElement).closest("button,a")) return;
        const rect = event.currentTarget.getBoundingClientRect(); blow(event.clientX - rect.left, event.clientY - rect.top);
      }}>
      <ol className="folly-leaves" aria-label="Words of Folly, oldest to newest">
        {follyQuotes.map((entry, index) => <li key={entry.id}>
          <button id={`leaf-${entry.id}`} ref={element => { buttons.current[index] = element; }} className="pile-leaf" type="button" aria-label={`Read: ${entry.text}`} aria-haspopup="dialog"
            style={{ left: `${22 + (index * 29) % 57}%`, top: `${120 + (index * 91) % 470}px`, transform: `translate(-50%,-50%) rotate(${((index * 37) % 90) - 45}deg)` }}
            onClick={event => { event.stopPropagation(); openLeaf(index, event.currentTarget); }}>
            <QuoteLeaf quote={entry} index={index} /><QuoteLeaf quote={entry} index={index} reverse />
          </button>
        </li>)}
      </ol>
      {gust && <div key={gust.id} className="leaf-gust" aria-hidden="true" style={{ left: gust.x, top: gust.y }}>
        <span className="gust-ring" />
        {Array.from({ length: 14 }, (_, i) => {
          const angle = i * Math.PI * 2 / 14;
          return <span className="gust-wisp" key={i} style={{ "--gust-x": `${Math.cos(angle) * 240}px`, "--gust-y": `${Math.sin(angle) * 240}px`, "--gust-angle": `${angle}rad`, "--gust-delay": `${i % 3 * 30}ms` } as CSSProperties}><svg viewBox="0 0 90 30"><path d="M2 24 Q26 1 51 11 T87 7" /></svg></span>;
        })}
      </div>}
    </div>
    <dialog className="leaf-reader" ref={dialog} aria-label="A Word of Folly" onClose={() => opener.current?.focus({ preventScroll: true })}
      onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="leaf-reader-content">
        <button className="button leaf-reader-close" autoFocus aria-label="Close leaf" onClick={() => dialog.current?.close()}>Close</button>
        <div className="reader-leaf"><QuoteLeaf quote={quote} index={selected} /></div>
        <div className="leaf-reader-nav"><button className="button" onClick={() => setSelected(index => (index - 1 + follyQuotes.length) % follyQuotes.length)}>Previous leaf</button><span>{selected + 1} of {follyQuotes.length}</span><button className="button" onClick={() => setSelected(index => (index + 1) % follyQuotes.length)}>Next leaf</button></div>
      </div>
    </dialog>
  </>;
}
