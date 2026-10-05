import Link from "next/link";
import { ProgressRings } from "@/components/progress-rings";

export function ActiveProject({ detailsLink = false }: { detailsLink?: boolean }) {
  return <div className="active-project">
    <p className="eyebrow section-label">Active project</p>
    <h2 className="project-title"><span className="project-title-prefix">Working title:</span><i>Swampass, the Apocalypse, and Other Inconveniences</i></h2>
    <p className="project-subtitle">or maybe <i>Eulogy of the End</i>, we’ll see after I finish the 0<sup>th</sup> draft</p>
    <ProgressRings />
    {detailsLink && <div className="desk-followup"><Link className="button" href="/creativeworks">More deets</Link></div>}
  </div>;
}
