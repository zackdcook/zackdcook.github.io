import Link from "next/link";
import type { Ref } from "react";
import styles from "./editorial-kitties.module.css";

const invitation = "Brave chased a shadow and got outside.";
const follow = "Follow him.";

/** Connected banks, runners and small tufts grow across the physical frame,
 * face and ink as one decorative layer, rather than redacting individual words. */
function MossGrowth() {
  const tufts=[[4,28,1.5],[48,8,1.6],[98,19,1.8],[156,4,1.3],[208,25,1.7],[268,36,1.3],[319,21,.9],[40,63,1.5],[22,102,1.5],[72,149,1.1],[131,176,1.4],[232,187,1],[341,187,1.4],[474,177,1.3],[524,147,1.8],[587,123,1.5],[639,153,1.3],[709,127,1.6],[745,85,1.3],[771,22,1.7],[803,102,1.3],[812,176,1.7]];
  return <svg className={styles.mossGrowth} viewBox="0 0 840 210" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <g fill="#284532" stroke="#162c23" strokeWidth="2" strokeLinejoin="round">
      <path d="M-8-8H331C340 3 320 14 298 12S259 30 240 26 219 48 193 48 163 29 149 33 119 57 91 48 65 67 42 64 27 99 5 105L-8 147Z"/>
      <path d="M850-8H750C735 7 758 25 745 42S758 68 739 86 758 104 741 118 705 107 691 121 658 135 638 128 613 111 594 120 568 136 545 128 515 146 511 164 483 175 458 170 425 190 395 184 366 195 343 182 321 206 292 197L850 221Z"/>
      <path d="M-8 176C19 168 34 185 56 181S88 166 110 182 132 182 151 197 172 191 193 211H-8Z"/>
    </g>
    <g fill="none" stroke="#567049" strokeWidth="3" strokeLinecap="round">
      <path d="M11 11C65 3 48 102 102 102S146 71 168 74M196 15C186 40 253 48 292 57M808 183C733 184 737 113 681 93S620 98 605 67M591 167C540 188 437 155 406 121M12 167C23 146 61 147 71 125"/>
    </g>
    {tufts.map(([x,y,size],i)=><g key={i} transform={`translate(${x} ${y}) rotate(${(i%5-2)*17}) scale(${size})`}>
      <ellipse cx="0" cy="5" rx="19" ry="9" fill="#1b3427"/>
      <path d="M-19 7Q-27-1-18-9Q-6-14-4-4Q0-22 7-16Q11-21 15-11Q28-11 24-2Q30 6 18 11Q8 16 1 9Q-6 17-13 10Z" fill={i%3===0?"#617444":"#405e39"}/>
      <g fill="none" stroke="#92a063" strokeWidth="1.4" strokeLinecap="round">
        <path d="M-11 5-10-5M-10 1-17-3M-10 1-4-5M4 8 6-12M5 1-2-4M5 1 13-6M15 6 18-3"/>
      </g>
      <g fill="#a0ab6c" opacity=".65"><circle cx="-15" cy="-6" r="1.7"/><circle cx="11" cy="-13" r="1.2"/><circle cx="21" cy="3" r="1.6"/></g>
    </g>)}
  </svg>;
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
