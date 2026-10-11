import type { ReactNode } from "react";
import { Artwork } from "./artwork";
import styles from "./paper-chapter.module.css";

export type PaperSlot = "paper-opening" | "paper-project" | "paper-community" | "paper-event"
  | "paper-biography" | "paper-folly" | "paper-shoutouts" | "paper-subscribe";

/** A stable section measures scroll progress. Its single sheet carries the real
 * content, so scenery and reading surface cannot drift apart or duplicate it.
 * Each illustration remains independently replaceable through the art registry. */
export function PaperChapter({ id, slot, drift = "right", opening = false, className = "", children }: {
  id?: string; slot: PaperSlot; drift?: "left" | "right"; opening?: boolean;
  className?: string; children: ReactNode;
}) {
  return <section id={id} className={`${styles.chapter} ${opening ? styles.opening : ""} ${className}`}
    data-paper-chapter={slot} data-drift={drift}>
    <div className={styles.sheet} data-paper-sheet>
      <Artwork slot={slot} className={styles.surface} material="none">
        <svg viewBox="0 0 1200 1000" preserveAspectRatio="none" focusable="false">
          <path className={styles.face} d="M15 18Q260 5 600 13L1103 11Q1127 34 1148 49L1184 81Q1197 388 1188 675L1184 978Q914 995 616 986L20 981Q3 700 12 477Z" />
          <path className={styles.fold} d="M1103 11q18 48 13 83 35-18 68-13Z" />
          <path className={styles.crease} d="M1103 11q18 48 13 83 35-18 68-13" />
        </svg>
      </Artwork>
      <div className={styles.notes} aria-hidden="true">
        <svg viewBox="0 0 900 660" preserveAspectRatio="none" focusable="false">
          <path d="M110 110q170-8 340-2M110 153q290-5 610 0M110 195q280 4 577-2M110 237q260-5 550 2M110 305q155-6 338 0M110 348q286 5 605-3M110 390q272-4 572 0M110 432q270 4 536-2M110 474q230-5 485 0M110 545q150 4 305-2" />
          <path className={styles.margin} d="M68 78q-8 246-2 506" />
        </svg>
      </div>
      <div className={styles.body} data-paper-content>{children}</div>
    </div>
  </section>;
}
