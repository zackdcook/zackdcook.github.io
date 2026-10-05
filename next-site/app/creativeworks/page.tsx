import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { ActiveProject } from "@/components/active-project";

export const metadata: Metadata = pageMetadata("writing", "Creative Works");

export default function CreativeWorks() {
  return <div className="page-wrap creative-works-page">
    <div className="shell"><div className="page-intro">
      <p className="eyebrow">Creative Works</p>
      <h1>I’m writing<br /><em>a novel!</em></h1>
    </div></div>
    <section className="desk-section"><div className="shell"><ActiveProject /></div></section>
  </div>;
}
