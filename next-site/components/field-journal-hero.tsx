import editorial from "@/content/editorial.json";
import {Artwork,ArtworkImage} from "./artwork";
import { StudioArtwork } from "./studio-artwork";
import { HomepageBookCTA } from "./book-launch/signup-form";
import styles from "./field-journal-hero.module.css";

export function FieldJournalHero(){
  return <section className={`hero ${styles.hero}`}>
    <div className={styles.atmosphere} aria-hidden="true"><StudioArtwork slot="hero-landscape" variant="window" className={styles.landscape}/></div>
    <div className={styles.content}>
      <p className={`collection-heading ${styles.identity}`}><span>Engineer<br/><span className="reaction-symbol">⇌</span><br/>Author</span></p>
      <h1 className={styles.name}>Zack <em>Cook.</em></h1>
      <div className={styles.portrait}>
        <Artwork slot="hero-orbit" className={styles.orbit}/>
        <div className={`tactile-photo ${styles.frame}`} data-material-surface="glass">
          <div className="photo-clip"><ArtworkImage slot="portrait" alt="Zack Cook smiling in a black sweater" width={1200} height={1200} preload sizes="(max-height: 710px) 170px, (max-width: 740px) 190px, 315px"/></div>
        </div>
        <Artwork slot="hero-branch" className={styles.branch} material="paper"/>
      </div>
      <p className={styles.intro}>{editorial.home.intro}</p>
      <div className={styles.invitation}><HomepageBookCTA /></div>
      <div className={styles.details}>
        {editorial.home.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
      </div>
    </div>
    <StudioArtwork slot="hero-foreground" variant="desk" className={styles.foreground}/>
  </section>;
}
