import { ArtworkImage } from "./artwork";
import styles from "./editorial-kitties.module.css";

export function EditorialKitties({ label = "Editorial kitty committee aka firing squad" }: { label?: string }) {
  return <div className={`editorial-photos ${styles.discovery}`}><figure className={styles.figure}>
    <div className="life-photo"><div className={`tactile-photo kitty-photo ${styles.photo}`} data-material-surface="glass"><div className={`photo-clip ${styles.photoClip}`}>
      <div className="kitty-photo-layer kitty-photo-original"><ArtworkImage slot="cats" alt="Chemi, Tashi, and Brave relaxing on a rug beside a sunny window" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" /></div>
    </div></div></div>
    <figcaption className={`identity-aside ${styles.caption}`}>{label}</figcaption>
  </figure></div>;
}
