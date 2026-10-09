"use client";

import { ArtworkImage } from "./artwork";
import { useEffect, useState, type MouseEvent } from "react";

export function ZackyCPreview() {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!pinned) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPinned(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [pinned]);

  const activate = (event: MouseEvent<HTMLButtonElement>) => {
    const coarse = window.matchMedia("(hover:none), (pointer:coarse)").matches;
    if (coarse || event.detail === 0) setPinned(value => !value);
  };

  return <span className={`zacky-c-hover ${pinned ? "is-open" : ""}`}>
    <button type="button" className="zacky-c-trigger" aria-expanded={pinned} aria-label="Show the Zacky C name doodles" onClick={activate}>Zacky C</button>
    <span className="zacky-c-backdrop" aria-hidden="true" onPointerDown={() => setPinned(false)} />
    <span className="zacky-c-preview" role="dialog" aria-label="Zacky C name doodles">
      <ArtworkImage slot="name-doodles" alt="" width={1200} height={1600} sizes="(max-width: 740px) 78vw, 360px" />
      <button type="button" className="button zacky-c-close dialog-close" aria-label="Close name doodles" tabIndex={pinned ? 0 : -1} onClick={() => setPinned(false)}>×</button>
    </span>
  </span>;
}
