import Link from "next/link";
import { ProgressRings } from "@/components/progress-rings";
import { Artwork } from "./artwork";
import { artworkEnabled } from "@/lib/art-assets";
import styles from "./active-project.module.css";

export function ActiveProject({ detailsLink = false, presentation = "summary" }: { detailsLink?: boolean; presentation?: "summary" | "folio" }) {
  return <div className={`active-project ${styles.project} ${styles[presentation]}`} data-project-art={artworkEnabled("manuscript")?"true":"false"}>
    <div className={styles.heading}>
      <p className="eyebrow section-label">Active project</p>
      <h2 className={`project-title ${styles.title}`}><i>Swampass, the Apocalypse, and Other Inconveniences</i></h2>
      <p className={`project-subtitle ${styles.subtitle}`}>or maybe <i>Eulogy of the End</i>, we’ll see after I finish the 0<sup>th</sup> draft</p>
      {detailsLink && <div className="desk-followup"><Link className="button" href="/creativeworks">More deets</Link></div>}
    </div>
    <Artwork slot="manuscript" className={styles.art}/>
    <div className={styles.progress}><ProgressRings presentation={presentation} /></div>
  </div>;
}
