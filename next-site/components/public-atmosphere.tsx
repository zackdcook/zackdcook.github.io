"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Artwork } from "./artwork";
import { createPublicMotes, type PublicMote } from "@/lib/public-atmosphere";
import styles from "./public-atmosphere.module.css";

export function PublicAtmosphere() {
  const [motes, setMotes] = useState<PublicMote[]>([]);
  useEffect(() => { setMotes(createPublicMotes()); }, []);

  return <div className="public-atmosphere" aria-hidden="true">
    {(["far", "middle", "near"] as const).map(layer => <div key={layer} data-mote-layer={layer} className={`${styles.field} ${styles[layer]}`}>
      {layer === "near" && <div className={styles.light} data-public-light />}
      {motes.filter(mote => mote.layer === layer).map((mote, index) => <span key={index} data-public-mote data-mote-start={mote.start} data-mote-depth={mote.depth}
        className={styles.mote} style={{ left: `${mote.x}%`, "--mote-size": `${mote.size}px`, "--mote-period": `${mote.period}s`, "--mote-phase": `${mote.phase}s` } as CSSProperties}>
        <Artwork slot="public-mote" className={styles.grain}><span className={styles.core} /></Artwork>
      </span>)}
    </div>)}
  </div>;
}
