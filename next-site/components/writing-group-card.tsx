import { MapIcon } from "@/components/icons";
import { CalendarMenu } from "@/components/calendar-menu";
import { writingGroup } from "@/content/site";
import type { ReactNode } from "react";
import styles from "./writing-group-card.module.css";

export function WritingGroupCard({ eyebrow = "Find me at…", children }: { eyebrow?: string; children?: ReactNode }) {
  return <section className={`event-callout writing-group ${styles.group}`} aria-labelledby="writing-group-title">
    <div className={styles.title}>
      <h2 className="eyebrow section-label">{eyebrow}</h2>
      <h2 id="writing-group-title">{writingGroup.title}</h2>
      <svg viewBox="0 0 400 180" aria-hidden="true" focusable="false">
        <g fill="none" stroke="var(--color-brass)" strokeWidth="1.3"><path d="M15 125c60-13 110-43 160-93 32 46 55 91 184 111M173 33c-17 40-42 73-65 86M196 49c-20 26-35 46-45 70M220 77l-26 47M257 105l-12 28"/><path d="M37 117c-23-53 0-86 45-97 2 38-12 66-45 97M105 82c-5-41 24-55 49-53-6 29-23 43-49 53M198 60c21-21 50-24 71-9-21 14-42 18-71 9M249 99c31-28 69-23 86-4-29 14-52 15-86 4"/></g>
        <path d="M359 143q15 12 30 4" stroke="var(--color-accent)" strokeWidth="1.5" fill="none"/>
      </svg>
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
