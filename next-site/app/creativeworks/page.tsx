import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { ActiveProject } from "@/components/active-project";
import { Artwork } from "@/components/artwork";
import styles from "./creativeworks.module.css";

export const metadata: Metadata = pageMetadata("writing", "Creative Works");

export default function CreativeWorks() {
  return <div className={styles.page}>
    <div className={styles.opening}>
      <Artwork slot="page-scenery" className={`${styles.horizon} editorial-art`} />
      <Artwork slot="hero-foreground" className={`${styles.foreground} editorial-art`} />
      <div className="shell"><div className={styles.intro}>
      <p className="eyebrow">Creative Works</p>
      <h1>I’m writing<br /><span className="title-plain">a</span> <em>novel!</em></h1>
      </div></div>
    </div>
    <section className={styles.desk}><div className="shell"><ActiveProject presentation="folio" /></div></section>
  </div>;
}
