import { MapIcon } from "@/components/icons";
import { CalendarMenu } from "@/components/calendar-menu";
import { writingGroup } from "@/content/site";
import type { ReactNode } from "react";
import styles from "./writing-group-card.module.css";
import { StudioArtwork } from "./studio-artwork";

export function WritingGroupCard({ eyebrow = "Find me at…", children }: { eyebrow?: string; children?: ReactNode }) {
  return <section className={`event-callout writing-group ${styles.group}`} aria-labelledby="writing-group-title">
    <div className={styles.title}>
      <h2 className="eyebrow section-label">{eyebrow}</h2>
      <h2 id="writing-group-title">{writingGroup.title}</h2>
      <StudioArtwork slot="event-illustration" variant="pages" className={styles.illustration}/>
    </div>
    <div className={styles.details}>
      <p className={`event-schedule ${styles.schedule}`}>{writingGroup.schedule}</p>
      <p className={styles.venue}>{writingGroup.venue} · Downtown Lakeland</p>
      <p className="event-address">{writingGroup.address}</p>
      <div className="actions event-actions">
        <a className="button" href={writingGroup.directionsUrl} target="_blank" rel="noopener noreferrer"><MapIcon />Get directions</a>
        <CalendarMenu />
      </div>
      <p className={`event-description ${styles.description}`}>{writingGroup.description}</p>
      {children}
    </div>
  </section>;
}
