import type { CSSProperties } from "react";
import { treeLandmark,treeSectionHeight } from "@/lib/tree-space";

export function TreeSection({section,children}:{section:number;children?:React.ReactNode}) {
  const landmark=treeLandmark(section);
  const seed=((section+7)*2246822519)>>>0;
  return <div className="tree-section" data-section={section} style={{top:section*treeSectionHeight,height:treeSectionHeight,"--trunk-width":landmark.width+"px","--bark-x":(seed%65)+"%","--bark-y":((seed>>>9)%70)+"%","--bark-scale":1+(seed%7)*.08,"--section-tone":.92+(seed%9)*.016} as CSSProperties}>
    <div className="tree-section-bark" aria-hidden="true"/>
    {section%4===1&&<div className="branch-scar" aria-hidden="true" style={{left:landmark.knotX,top:landmark.knotY}}/>}
    {section>3&&section%5===2&&<div className="lichen-landmark" aria-hidden="true" style={{left:landmark.knotX-60,top:landmark.knotY+170}}/>}
    {children}
  </div>;
}
