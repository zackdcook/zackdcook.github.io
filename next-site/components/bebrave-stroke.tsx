"use client";

import { memo,useMemo,type CSSProperties } from "react";
import type { BeBravePublicStroke, BeBraveRarity } from "@/lib/bebrave-types";
import { sparklePoints } from "@/lib/bebrave/effect-anchors";
import { legendaryEffect } from "@/lib/bebrave/effects";

export function pointsToPath(points: Array<[number, number]>) {
  if (!points.length) return "";
  return points.map(([x,y],i)=>`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}


export const BeBraveStroke=memo(function BeBraveStroke({stroke,color,rarity,seed,effectId,active=false}:{stroke:BeBravePublicStroke;color:string;rarity:BeBraveRarity;seed:number;effectId?:string;active?:boolean}) {
  const d=useMemo(()=>pointsToPath(stroke.points),[stroke.points]);
  const superior=rarity==="superior", epic=rarity==="epic",legendary=rarity==="legendary";
  const sparkles=useMemo(()=>epic||legendary?(stroke.sparkles??sparklePoints(stroke.points,seed,stroke.strokeOrder)):[],[epic,legendary,stroke,seed]);
  if(!d)return null;
  return <g className={`bebrave-stroke bebrave-${rarity}${active?" is-active":""}`} data-effect={legendary?legendaryEffect(effectId):undefined} style={{"--stroke-color":color} as CSSProperties}>
    {(superior||epic||legendary)&&<path className="bebrave-stroke-glow" d={d} stroke={color}/>}
    <path className="bebrave-stroke-line" d={d} stroke={color}/>
    {(epic||legendary)&&<path className="bebrave-epic-shimmer" d={d} stroke={color}/>}
    {sparkles.map((s,i)=><g key={i} className="bebrave-sparkle" transform={`translate(${s.x} ${s.y})`}>
      {legendary&&<circle className="bebrave-wisp-orbit" r={s.r*2.1} style={{animationDelay:`-${s.delay}s`}}/>}
      <path className="bebrave-sparkle-star" d={`M0 ${-s.r} L${s.r*.22} ${-s.r*.22} L${s.r} 0 L${s.r*.22} ${s.r*.22} L0 ${s.r} L${-s.r*.22} ${s.r*.22} L${-s.r} 0 L${-s.r*.22} ${-s.r*.22} Z`} style={{animationDelay:`-${s.delay}s`}}/>
      <circle className="bebrave-sparkle-core" r={Math.max(1.7,s.r*.26)} />
    </g>)}
  </g>;
});
