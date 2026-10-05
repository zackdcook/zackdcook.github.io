import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { ProgressRings } from "@/components/progress-rings";
import progress from "@/content/progress.json";
import { displayDate } from "@/content/site";

export const metadata: Metadata = pageMetadata("writing", "Creative Works");

export default function CreativeWorks() {
  return <div className="shell page-wrap creative-works-page">
    <div className="page-intro">
      <p className="eyebrow">Creative Works</p>
      <h1>I’m writing<br /><em>a novel!</em></h1>
    </div>
    <section className="writing-panel active-project-panel" aria-labelledby="active-project-title">
      <h2 id="active-project-title" className="eyebrow section-label">Active project</h2>
      <ProgressRings />
      <p className="project-updated">Progress updated {displayDate(progress.updated)}</p>
    </section>
    <section className="working-title">
      <h2 className="eyebrow">Working title</h2>
      <p className="novel-title"><i>Swampass, the Apocalypse, and Other Inconveniences</i></p>
      <p className="alternate-title">or maybe <i>Eulogy of the End</i> // idk I’m still figuring it out</p>
    </section>
  </div>;
}
