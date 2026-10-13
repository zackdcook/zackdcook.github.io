import Link from "next/link";
import type { Ref } from "react";
import styles from "./editorial-kitties.module.css";

const invitation = "Brave chased a shadow and got outside.";
const follow = "Follow him.";

/** Both discoveries use the actual Home frame, selected choice and blinking caret. */
export function BraveDiscoveryDialogue({ destinationRef }: { destinationRef?: Ref<HTMLAnchorElement> }) {
  return <div className={styles.reveal} data-brave-dialogue><p role="status">{invitation}</p><Link ref={destinationRef} href="/bebrave" className={styles.destination}>{follow}</Link></div>;
}

export function BraveSearchLink(){return <div className={`${styles.reveal} ${styles.searchPanel}`} data-brave-dialogue><Link href="/bebrave" className={styles.destination}>Look for the cat.</Link></div>;}
