import Link from "next/link";
import type { Ref } from "react";
import styles from "./editorial-kitties.module.css";

const invitation = "Brave chased a shadow and got outside.";
const follow = "Follow him.";

/** Decorative moss is separate from the invitation and its accessible name. */
function MossWord({ word }: { word: string }) {
  return <span className={styles.mossCovered}>{word}<svg viewBox="0 0 120 44" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M3 13 10 6 24 8 31 3 47 7 56 4 71 9 86 4 99 9 112 7 118 15 114 28 119 35 106 41 93 36 78 42 65 37 51 41 37 35 22 40 12 35 3 37 6 26 1 21Z" fill="#24392B" stroke="#14251E" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M7 13 23 12 31 7 45 11 55 8 68 13 84 9 98 14 113 11 109 22 95 24 84 20 73 26 58 21 44 27 32 21 18 26 7 22Z" fill="#59653D"/>
    <path d="M8 27 23 30 38 25 50 31 64 26 80 31 93 26 112 28 108 35 96 31 80 38 65 33 50 36 37 30 22 35 10 31Z" fill="#3D5132"/>
    <path d="M15 15 23 13M35 11 41 14M54 11 60 13M80 13 88 12M101 16 108 15" fill="none" stroke="#8B8F54" strokeWidth="3" strokeLinecap="round"/>
    <path d="M21 26 19 34M44 22 45 34M73 25 71 35M98 24 100 32" fill="none" stroke="#172E22" strokeWidth="2"/>
  </svg></span>;
}

function MossText({ text, visible }: { text: string; visible: string }) {
  return text.split(" ").map((word,index)=><span key={index}>{index>0&&" "}{word===visible?word:<MossWord word={word}/>}</span>);
}

/** Both discoveries use the actual Home frame, selected choice and blinking caret. */
export function BraveDiscoveryDialogue({ destinationRef, mossy = false }: { destinationRef?: Ref<HTMLAnchorElement>; mossy?: boolean }) {
  if(mossy)return <Link href="/bebrave" className={`${styles.reveal} ${styles.mossyReveal}`} data-brave-dialogue aria-label={`${invitation} ${follow}`}>
    <p aria-hidden="true"><MossText text={invitation} visible="shadow"/></p>
    <span className={styles.destination} aria-hidden="true"><span><MossText text={follow} visible="Follow"/></span></span>
  </Link>;
  return <div className={styles.reveal} data-brave-dialogue><p role="status">{invitation}</p><Link ref={destinationRef} href="/bebrave" className={styles.destination}>{follow}</Link></div>;
}
