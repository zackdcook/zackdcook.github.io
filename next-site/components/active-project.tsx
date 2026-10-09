import Link from "next/link";
import { ProgressRings } from "@/components/progress-rings";
import { PaperHeron } from "./paper-heron";
import styles from "./active-project.module.css";

export function ActiveProject({ detailsLink = false }: { detailsLink?: boolean }) {
  return <div className={`active-project ${styles.project}`}>
    <div className={styles.heading}>
      <p className="eyebrow section-label">Active project</p>
      <h2 className={`project-title ${styles.title}`}><i>Swampass, the Apocalypse, and Other Inconveniences</i></h2>
      <p className={`project-subtitle ${styles.subtitle}`}>or maybe <i>Eulogy of the End</i>, we’ll see after I finish the 0<sup>th</sup> draft</p>
      {detailsLink && <div className="desk-followup"><Link className="button" href="/creativeworks">More deets</Link></div>}
    </div>
    <div className={styles.art} aria-hidden="true"><PaperHeron /></div>
    <div className={styles.progress}><ProgressRings /></div>
  </div>;
}
