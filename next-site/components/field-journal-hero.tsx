import editorial from "@/content/editorial.json";
import {Artwork,ArtworkImage} from "./artwork";
import { HomepageBookCTA } from "./book-launch/signup-form";
import styles from "./field-journal-hero.module.css";

export function FieldJournalHero(){
  return <section className={`hero ${styles.hero}`}>
    <div className={styles.atmosphere} aria-hidden="true"><Artwork slot="hero-landscape" className={`editorial-art ${styles.landscape}`}/></div>
    <div className={styles.content}>
      <div className={styles.copy}>
        <p className={`eyebrow hero-eyebrow ${styles.eyebrow}`}>Engineer <span className="reaction-symbol">⇌</span> Author</p>
        <h1>Zack<br /> <em>Cook.</em></h1>
        <HomepageBookCTA />
        <p className={styles.intro}>{editorial.home.intro}</p>
        <div className={styles.details}>{editorial.home.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div>
      </div>
      <div className={styles.portrait}>
        <Artwork slot="hero-orbit" className={styles.orbit}/>
        <div className={`tactile-photo ${styles.frame}`} data-material-surface="glass">
          <div className="photo-clip"><ArtworkImage slot="portrait" alt="Zack Cook smiling in a black sweater" width={1200} height={1200} preload sizes="(max-width: 740px) 76vw, 35vw"/></div>
        </div>
        <Artwork slot="hero-branch" className={styles.branch} material="paper"/>
      </div>
    </div>
    <Artwork slot="hero-foreground" className={`editorial-art ${styles.foreground}`}/>
  </section>;
}
