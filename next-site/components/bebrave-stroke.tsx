"use client";

import { memo,useMemo,type CSSProperties,type RefObject } from "react";
import type { BeBravePublicStroke, BeBraveRarity } from "@/lib/bebrave-types";
import { sparklePoints } from "@/lib/bebrave/effect-anchors";
import { legendaryEffect } from "@/lib/bebrave/effects";

export function pointsToPath(points: Array<[number, number]>) {
  if (!points.length) return "";
  return points.map(([x,y],i)=>`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

export type StrokePathRefs = Partial<Record<"cut"|"rim"|"glow"|"line"|"inlay"|"shimmer",RefObject<SVGPathElement|null>>>;

/** The exact same ink stack is used by the fast live path and every saved view. */
export function StrokeLayers({d="",color,rarity,refs={}}:{d?:string;color:string;rarity:BeBraveRarity;refs?:StrokePathRefs}) {
  const magic=rarity==="superior"||rarity==="epic"||rarity==="legendary";
  return <>
    {magic&&<path ref={refs.glow} className="bebrave-stroke-glow" d={d} stroke={color}/>}
    <path ref={refs.cut} className="bebrave-stroke-cut" d={d}/>
    <path ref={refs.rim} className="bebrave-stroke-rim" d={d}/>
    <path ref={refs.line} className="bebrave-stroke-line" d={d} stroke={color}/>
    <path ref={refs.inlay} className="bebrave-stroke-inlay" d={d}/>
    {(rarity==="epic"||rarity==="legendary")&&<path ref={refs.shimmer} className="bebrave-epic-shimmer" d={d}/>}
  </>;
}

export function CarvingSpark({x=0,y=0,r,delay=0,legendary=false}:{x?:number;y?:number;r:number;delay?:number;legendary?:boolean}) {
  return <g className="bebrave-sparkle" transform={`translate(${x} ${y})`}>
    {legendary&&<circle className="bebrave-wisp-orbit" r={r*2.1} style={{animationDelay:`-${delay}s`}}/>}
    <path className="bebrave-sparkle-star" d={`M0 ${-r} L${r*.22} ${-r*.22} L${r} 0 L${r*.22} ${r*.22} L0 ${r} L${-r*.22} ${r*.22} L${-r} 0 L${-r*.22} ${-r*.22} Z`} style={{animationDelay:`-${delay}s`}}/>
    <circle className="bebrave-sparkle-core" r={Math.max(1.7,r*.26)}/>
  </g>;
}

export const BeBraveStroke=memo(function BeBraveStroke({stroke,color,rarity,seed,effectId,active=false}:{stroke:BeBravePublicStroke;color:string;rarity:BeBraveRarity;seed:number;effectId?:string;active?:boolean}) {
  const d=useMemo(()=>pointsToPath(stroke.points),[stroke.points]);
  const epic=rarity==="epic",legendary=rarity==="legendary";
  const sparkles=useMemo(()=>epic||legendary?(stroke.sparkles??sparklePoints(stroke.points,seed,stroke.strokeOrder)):[],[epic,legendary,stroke,seed]);
  if(!d)return null;
  return <g className={`bebrave-stroke bebrave-${rarity}${active?" is-active":""}`} data-effect={legendary?legendaryEffect(effectId):undefined} style={{"--stroke-color":color} as CSSProperties}>
    <StrokeLayers d={d} color={color} rarity={rarity}/>
    {sparkles.map((s,i)=><CarvingSpark key={i} {...s} legendary={legendary}/>)}
  </g>;
});
