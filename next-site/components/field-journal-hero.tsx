import editorial from "@/content/editorial.json";
import {Artwork,ArtworkImage} from "./artwork";
import { HomepageBookCTA } from "./book-launch/signup-form";
import styles from "./field-journal-hero.module.css";

export function FieldJournalHero(){
  return <section className={`hero ${styles.hero}`}>
    <div className={styles.atmosphere} aria-hidden="true"><Artwork slot="hero-landscape" className={`editorial-art ${styles.landscape}`}/></div>
    <div className={styles.content}>
      <h1 className={styles.name}>Zack <em>Cook.</em></h1>
      <div className={styles.portrait}>
        <Artwork slot="hero-orbit" className={styles.orbit}/>
        <div className={`tactile-photo ${styles.frame}`} data-material-surface="glass">
          <div className="photo-clip"><ArtworkImage slot="portrait" alt="Zack Cook smiling in a black sweater" width={1200} height={1200} preload sizes="(max-height: 620px) 100px, (max-width: 740px) 190px, 315px"/></div>
        </div>
        <Artwork slot="hero-branch" className={styles.branch} material="paper"/>
      </div>
      <p className={styles.intro}>{editorial.home.intro}</p>
      <div className={styles.invitation}><HomepageBookCTA /></div>
      <div className={styles.details}>
        {editorial.home.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
        <p className={`eyebrow hero-eyebrow ${styles.eyebrow}`}>Engineer <span className="reaction-symbol">⇌</span> Author</p>
      </div>
    </div>
    <Artwork slot="hero-foreground" className={`editorial-art ${styles.foreground}`}/>
  </section>;
}
