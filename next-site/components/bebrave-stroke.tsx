"use client";

import type { CSSProperties } from "react";
import type { BeBravePublicStroke, BeBraveRarity } from "@/lib/bebrave-types";
import { legendaryEffect } from "@/lib/bebrave/effects";

export function pointsToPath(points: Array<[number, number]>) {
  if (!points.length) return "";
  return points.map(([x,y],i)=>`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

function sparklePoints(points:Array<[number,number]>,seed:number,strokeOrder:number) {
  if(!points.length)return [];
  let state=(seed ^ Math.imul(strokeOrder+1,2654435761))>>>0;
  const next=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const length=points.slice(1).reduce((sum,point,index)=>sum+Math.hypot(point[0]-points[index][0],point[1]-points[index][1]),0);
  const targetCount=Math.max(1,Math.min(10,Math.round(length/90)));
  const positions:number[]=[];
  let distance=0;
  for(let index=1;index<points.length;index++){
    distance+=Math.hypot(points[index][0]-points[index-1][0],points[index][1]-points[index-1][1]);
    positions.push(distance);
  }
  return Array.from({length:targetCount},(_,index)=>{
    const wanted=length*((index+.4+.2*next())/targetCount);
    const at=positions.findIndex(d=>d>=wanted);
    const segment=at<0?points.length-2:at;
    const before=segment>0?positions[segment-1]:0;
    const span=(positions[segment]||length)-before;
    const t=span>0?(wanted-before)/span:0;
    const from=points[Math.max(0,segment)],to=points[Math.min(points.length-1,segment+1)];
    const point:[number,number]=[from[0]+(to[0]-from[0])*t,from[1]+(to[1]-from[1])*t];
    return {x:point[0]+(next()-.5)*10,y:point[1]+(next()-.5)*10,r:2.5+next()*2,delay:next()*3.8};
  });
}

export function BeBraveStroke({stroke,color,rarity,seed,effectId,active=false}:{stroke:BeBravePublicStroke;color:string;rarity:BeBraveRarity;seed:number;effectId?:string;active?:boolean}) {
  const d=pointsToPath(stroke.points);
  if(!d)return null;
  const superior=rarity==="superior", epic=rarity==="epic",legendary=rarity==="legendary";
  const sparkles=epic||legendary?sparklePoints(stroke.points,seed,stroke.strokeOrder):[];
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
}
