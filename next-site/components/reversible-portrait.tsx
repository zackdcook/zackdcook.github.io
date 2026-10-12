"use client";

import { useState } from "react";
import { ArtworkImage } from "./artwork";
import styles from "./reversible-portrait.module.css";

/** Both faces share one fixed footprint; no transformed ancestor can trap a modal. */
export function ReversiblePortrait() {
  const [flipped, setFlipped] = useState(false);
  return <button type="button" className={`portrait-frame ${styles.portrait}`}
    aria-label={flipped ? "Zack Cook" : "Show the Zacky C name doodles"}
    aria-pressed={flipped} data-flipped={flipped} onClick={() => setFlipped(value => !value)}>
    <span className={styles.turn}>
      <span className={`tactile-photo ${styles.face} ${styles.front}`} aria-hidden={flipped}>
        <ArtworkImage slot="portrait" alt="Zack Cook" width={1200} height={1200}
          sizes="(max-width: 740px) 75vw, 440px" preload />
      </span>
      <span className={`tactile-photo ${styles.face} ${styles.back}`} aria-hidden={!flipped}>
        <ArtworkImage slot="name-doodles" alt="Zacky C name doodles" width={1200} height={1600}
          sizes="(max-width: 740px) 56vw, 330px" style={{ objectFit: "contain" }} />
      </span>
    </span>
  </button>;
}
