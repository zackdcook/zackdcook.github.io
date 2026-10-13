import Link from "next/link";
import type { Ref } from "react";
import styles from "./editorial-kitties.module.css";
import { Artwork } from "./artwork";

const invitation = "Brave chased a shadow and got outside.";
const follow = "Follow him.";

/** Photographed moss is a transparent foreground, across the frame and text. */
function MossGrowth() {
  return <Artwork slot="about-moss" className={styles.mossGrowth} material="none"/>;
}

/** Both discoveries use the actual Home frame, selected choice and blinking caret. */
export function BraveDiscoveryDialogue({ destinationRef, mossy = false }: { destinationRef?: Ref<HTMLAnchorElement>; mossy?: boolean }) {
  if(mossy)return <Link href="/bebrave" className={`${styles.reveal} ${styles.mossyReveal}`} data-brave-dialogue aria-label={`${invitation} ${follow}`}>
    <p aria-hidden="true">{invitation}</p>
    <span className={styles.destination} aria-hidden="true"><span>{follow}</span></span>
    <MossGrowth/>
  </Link>;
  return <div className={styles.reveal} data-brave-dialogue><p role="status">{invitation}</p><Link ref={destinationRef} href="/bebrave" className={styles.destination}>{follow}</Link></div>;
}
