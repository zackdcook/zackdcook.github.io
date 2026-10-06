"use client";

import type { BeBravePublicStroke, BeBraveRarity } from "@/lib/bebrave-types";

export function pointsToPath(points: Array<[number, number]>) {
  if (!points.length) return "";
  return points.map(([x,y],i)=>`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

function sparklePoints(points:Array<[number,number]>,seed:number,strokeOrder:number) {
  if (points.length < 4) return [];
  const out:Array<{x:number;y:number;r:number;delay:number}>=[];
  const step=Math.max(5,Math.floor(points.length/10));
  let state=(seed ^ ((strokeOrder+1)*2654435761))>>>0;
  const next=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  for(let i=step;i<points.length;i+=step){
    if(next()<.52) continue;
    const [x,y]=points[i];
    out.push({x:x+(next()-.5)*14,y:y+(next()-.5)*14,r:1.6+next()*2.2,delay:next()*1.8});
  }
  return out.slice(0,12);
}

export function BeBraveStroke({stroke,color,rarity,seed,active=false}:{stroke:BeBravePublicStroke;color:string;rarity:BeBraveRarity;seed:number;active?:boolean}) {
  const d=pointsToPath(stroke.points);
  if(!d)return null;
  const superior=rarity==="superior", epic=rarity==="epic";
  const sparkles=epic?sparklePoints(stroke.points,seed,stroke.strokeOrder):[];
  return <g className={`bebrave-stroke bebrave-${rarity}${active?" is-active":""}`}>
    {(superior||epic)&&<path className="bebrave-stroke-glow" d={d} stroke={color}/>} 
    <path className="bebrave-stroke-line" d={d} stroke={color}/>
    {epic&&<path className="bebrave-epic-shimmer" d={d} stroke={color}/>} 
    {sparkles.map((s,i)=><circle key={i} className="bebrave-sparkle" cx={s.x} cy={s.y} r={s.r} fill={color} style={{animationDelay:`-${s.delay}s`}}/>)}
  </g>;
}
