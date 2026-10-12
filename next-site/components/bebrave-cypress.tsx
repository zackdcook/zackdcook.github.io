import type { RefObject } from "react";

/** One proportional root/shaft composition in both arrival and tool scenes.
 * Its decorative coordinates never participate in the carving plane. */
export function BeBraveCypress({ marks = 0, impactRef }: { marks?: number; impactRef?: RefObject<HTMLDivElement | null> }) {
  return <div className="bebrave-cypress" aria-hidden="true">
    <div className="bebrave-cypress-base" ref={impactRef}>
      <div className="bebrave-cypress-shaft"/>
      <div className="bebrave-cypress-roots"/>
      {marks > 0 && <div className="bebrave-cypress-hacks">{Array.from({ length: marks }, (_, i) => <i key={i} style={{ rotate: `${-5 + i * 3}deg`, top: `${i * 6}px` }}/>)}</div>}
      <div className="bebrave-cypress-dust"><i/><i/><i/></div>
    </div>
  </div>;
}
