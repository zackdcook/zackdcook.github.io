import editorial from "@/content/editorial.json";
import { ArtworkImage } from "./artwork";
import { HomepageBookCTA } from "./book-launch/signup-form";
import styles from "./field-journal-hero.module.css";

export function FieldJournalHero(){
  return <section className={`hero ${styles.hero}`}>
    <div className={styles.content}>
      <p className={`collection-heading ${styles.identity}`}><span>Engineer <span className="reaction-symbol">⇌</span> Author</span></p>
      <h1 className={styles.name}>Zack <em>Cook.</em></h1>
      <div className={styles.portrait}>
        <div className={`tactile-photo ${styles.frame}`} data-material-surface="glass">
          <div className="photo-clip"><ArtworkImage slot="portrait" alt="Zack Cook smiling in a black sweater" width={1200} height={1200} preload sizes="(max-width: 740px) 190px, (max-width: 1050px) 32vw, 420px"/></div>
        </div>
      </div>
      <p className={styles.intro}>{editorial.home.intro}</p>
      <div className={styles.invitation}><HomepageBookCTA /></div>
      <div className={styles.details}>
        {editorial.home.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
      </div>
    </div>
  </section>;
}
