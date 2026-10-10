import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { ActiveProject } from "@/components/active-project";
import { StudioArtwork } from "@/components/studio-artwork";
import styles from "./creativeworks.module.css";

export const metadata: Metadata = pageMetadata("writing", "Creative Works");

export default function CreativeWorks() {
  return <div className={styles.page}>
    <div className={styles.opening}>
      <StudioArtwork slot="page-scenery" variant="window" className={styles.horizon} />
      <StudioArtwork slot="hero-foreground" variant="desk" className={styles.foreground} />
      <div className="shell"><div className={styles.intro}>
      <p className="eyebrow">Creative Works</p>
      <h1>I’m writing<br /><span className="title-plain">a</span> <em>novel!</em></h1>
      </div></div>
    </div>
    <section className={styles.desk}><div className="shell"><ActiveProject presentation="folio" /></div></section>
  </div>;
}
