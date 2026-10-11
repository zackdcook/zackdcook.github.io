import type { ReactNode } from "react";
import { Artwork } from "./artwork";
import styles from "./paper-chapter.module.css";

export type PaperSlot = "paper-opening" | "paper-project" | "paper-community" | "paper-event"
  | "paper-biography" | "paper-folly" | "paper-shoutouts" | "paper-subscribe";

/** The section measures native scroll; its decorative paper falls independently.
 * Text stays in document flow and never gets folded, scaled, or duplicated. */
export function PaperChapter({ id, slot, drift = "right", opening = false, className = "", children }: {
  id?: string; slot: PaperSlot; drift?: "left" | "right"; opening?: boolean;
  className?: string; children: ReactNode;
}) {
  return <section id={id} className={`${styles.chapter} ${opening ? styles.opening : ""} ${className}`}
    data-paper-chapter={slot} data-drift={drift}>
    <div className={styles.flight} data-paper-flight aria-hidden="true">
      <div className={styles.sway} data-paper-sheet>
        <Artwork slot={slot} className={styles.surface} material="none">
          <svg viewBox="0 0 280 340" focusable="false">
            <path className={styles.back} d="M22 38C99 68 175 7 254 30C214 119 243 219 240 304C164 273 104 328 32 295C16 211 60 135 22 38Z"/>
            <path className={styles.face} d="M22 38C94 13 184 52 254 30C245 119 280 227 240 304C163 325 109 270 32 295C68 211 8 136 22 38Z"/>
            <path className={styles.ink} d="M60 91C108 73 162 100 213 80M62 117C111 99 165 126 216 106M65 143C113 125 168 151 219 132M68 169C116 151 171 178 222 158M70 214C118 196 173 223 224 203M68 241C116 223 171 250 222 230"/>
            <path className={styles.curl} d="M32 295C109 270 163 325 240 304C158 348 85 293 32 295Z"/>
          </svg>
        </Artwork>
      </div>
    </div>
    <div className={styles.body} data-paper-content>{children}</div>
  </section>;
}
