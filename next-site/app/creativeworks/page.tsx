import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { ActiveProject } from "@/components/active-project";
import styles from "./creativeworks.module.css";

export const metadata: Metadata = pageMetadata("writing", "Creative Works");

export default function CreativeWorks() {
  return <div className={styles.page}>
    <div className={styles.opening}>
      <div className="shell"><div className={styles.intro}>
      <p className="eyebrow">Creative Works</p>
      <h1 className="responsive-title">I’m writing<br className="title-break" /> <span className="title-plain">a</span> <em>novel!</em></h1>
      </div></div>
    </div>
    <section className={styles.desk}><div className="shell"><ActiveProject presentation="folio" /></div></section>
  </div>;
}
