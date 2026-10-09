import editorial from "@/content/editorial.json";
import {SwampLandscape} from "./swamp-landscape";
import {Artwork,ArtworkImage} from "./artwork";
import styles from "./field-journal-hero.module.css";

export function FieldJournalHero(){
  return <section className={`hero ${styles.hero}`}>
    <div className={styles.atmosphere} data-light-source aria-hidden="true"><Artwork slot="hero-landscape" className={styles.landscape}><SwampLandscape/></Artwork></div>
    <div className={styles.content}>
      <div className={styles.copy}>
        <p className={`eyebrow hero-eyebrow ${styles.eyebrow}`}>Engineer <span className="reaction-symbol">⇌</span> Author</p>
        <h1>Zack<br /> <em>Cook.</em></h1>
        <p className={styles.intro}>{editorial.home.intro}</p>
        <div className={styles.details}>{editorial.home.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div>
      </div>
      <div className={styles.portrait}>
        <Artwork slot="hero-orbit" className={styles.orbit}><svg viewBox="0 0 600 700" aria-hidden="true" focusable="false">
          <g fill="none" stroke="currentColor" strokeWidth="1"><ellipse cx="300" cy="342" rx="274" ry="321"/><ellipse cx="300" cy="342" rx="284" ry="331" strokeDasharray="2 15"/><path d="M300 0v30m0 642v28M0 342h36m528 0h36"/><path d="M61 117l24 24m430 402 24 24M56 570l26-28m429-400 26-28"/></g>
          <g fill="currentColor"><circle cx="300" cy="11" r="4"/><circle cx="575" cy="342" r="3"/><path d="m40 342 7-7 7 7-7 7z"/></g>
        </svg></Artwork>
        <div className={`tactile-photo ${styles.frame}`} data-material-surface="glass">
          <ArtworkImage slot="portrait" alt="Zack Cook smiling in a black sweater" width={1200} height={1200} priority sizes="(max-width: 740px) 76vw, 35vw"/>
        </div>
        <Artwork slot="hero-branch" className={styles.branch} material="paper"><svg viewBox="0 0 240 380" aria-hidden="true" focusable="false">
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 360C53 241 84 118 206 19M45 281l87-36M65 212l-27-50M104 143l74-5"/></g>
          <g fill="currentColor"><path d="M46 280c-52-27-41-65-38-80 37 10 42 46 38 80zM66 211c20-53 53-58 80-45-19 39-46 48-80 45zM95 158c-23-39-11-69 1-81 19 20 22 48-1 81zM134 110c15-33 42-42 69-33-17 27-36 38-69 33zM164 59c-6-31 11-50 28-55 3 27-7 43-28 55zM124 248c17-33 47-39 70-27-18 25-41 33-70 27z"/></g>
        </svg></Artwork>
      </div>
    </div>
    <Artwork slot="hero-foreground" className={styles.foreground}><SwampLandscape foreground/></Artwork>
  </section>;
}
