import type { CSSProperties } from "react";

/** Decorative, fixed-cost atmosphere; no per-frame JavaScript or hit targets. */
export function TreeAtmosphere() {
  return <div className="bebrave-atmosphere" aria-hidden="true">
    <span className="bebrave-water-haze"/>
    <div className="bebrave-fireflies"><i/><i/><i/><i/><i/><i/><i/><i/></div>
  </div>;
}

/** Tiny real elements avoid stretching subpixel radial backgrounds into the
 * vertical streaks seen in the phone recording. */
export function TreeNightStars() {
  return <span className="bebrave-night-stars">
    {Array.from({length:38},(_,index)=><i key={index} style={{
      left:`${((index*67+13)%101)}%`,top:`${((index*43+7)%103)}%`,
      "--star-size":index%6===0?"1.8px":"1px","--star-brightness":.3+(index%5)*.13,
    } as CSSProperties}/>)}
  </span>;
}
