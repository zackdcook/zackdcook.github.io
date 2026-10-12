"use client";

import { memo,useMemo,type CSSProperties,type ReactNode,type RefObject } from "react";
import type { BeBravePublicStroke, BeBraveRarity } from "@/lib/bebrave-types";
import { sparklePoints } from "@/lib/bebrave/effect-anchors";
import { legendaryEffect } from "@/lib/bebrave/effects";
import { carvingEdge } from "@/lib/bebrave/carving-contrast";

export function pointsToPath(points: Array<[number, number]>) {
  if (!points.length) return "";
  return points.map(([x,y],i)=>`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

/** Separate subpaths keep every original vertex. One layer spans the entire
 * carving, so another stroke from this visitor cannot cut through its core. */
export function carvingToPath(strokes: BeBravePublicStroke[]) {
  return strokes.map(stroke=>pointsToPath(stroke.points)).filter(Boolean).join(" ");
}

export type StrokePathRefs = Partial<Record<"edge"|"cut"|"rim"|"glow"|"line"|"inlay"|"shimmer",RefObject<SVGPathElement|null>>>;

/** The exact same ink stack is used by the fast live path and every saved view. */
export function StrokeLayers({d="",color,rarity,refs={}}:{d?:string;color:string;rarity:BeBraveRarity;refs?:StrokePathRefs}) {
  const magic=rarity!=="common";
  return <>
    {magic&&<path ref={refs.glow} className="bebrave-stroke-glow" d={d} stroke={color}/>}
    <path ref={refs.edge} className="bebrave-stroke-contrast" d={d}/>
    <path ref={refs.cut} className="bebrave-stroke-cut" d={d}/>
    <path ref={refs.rim} className="bebrave-stroke-rim" d={d} stroke={carvingEdge(color)}/>
    <path ref={refs.line} className="bebrave-stroke-line" d={d} stroke={color}/>
    <path ref={refs.inlay} className="bebrave-stroke-inlay" d={d}/>
    {(rarity==="epic"||rarity==="legendary")&&<path ref={refs.shimmer} className="bebrave-epic-shimmer" d={d}/>}
  </>;
}

export function sparkGeometry(radius: number, legendary: boolean) {
  const r = radius * (legendary ? 3.8 : 2.7);
  return {
    star: `M0 ${-r} L${r*.22} ${-r*.22} L${r} 0 L${r*.22} ${r*.22} L0 ${r} L${-r*.22} ${r*.22} L${-r} 0 L${-r*.22} ${-r*.22} Z`,
    facets: `M0 ${-r*1.65} L${r*1.1} 0 L0 ${r*1.65} L${-r*1.1} 0 Z`,
    orbit: r * 2.05, core: Math.max(1.8, r * .32),
  };
}

export function CarvingSpark({x=0,y=0,r,delay=0,legendary=false}:{x?:number;y?:number;r:number;delay?:number;legendary?:boolean}) {
  const shape = sparkGeometry(r, legendary);
  return <g className="bebrave-sparkle" transform={`translate(${x} ${y})`}>
    {legendary&&<circle className="bebrave-wisp-orbit" r={shape.orbit} style={{animationDelay:`-${delay}s`}}/>}
    <path className="bebrave-sparkle-facets" d={shape.facets}/>
    <path className="bebrave-sparkle-star" d={shape.star} style={{animationDelay:`-${delay}s`}}/>
    <circle className="bebrave-sparkle-core" r={shape.core}/>
  </g>;
}

export const BeBraveCarving=memo(function BeBraveCarving({strokes,color,rarity,seed,effectId,active=false,pathRefs,children}:{strokes:BeBravePublicStroke[];color:string;rarity:BeBraveRarity;seed:number;effectId?:string;active?:boolean;pathRefs?:StrokePathRefs;children?:ReactNode}) {
  const d=useMemo(()=>carvingToPath(strokes),[strokes]);
  const epic=rarity==="epic",legendary=rarity==="legendary";
  const sparkles=useMemo(()=>epic||legendary?strokes.map(stroke=>({id:stroke.strokeId,points:stroke.sparkles??sparklePoints(stroke.points,seed,stroke.strokeOrder)})):[],[epic,legendary,strokes,seed]);
  if(!d&&!pathRefs)return null;
  return <g className={`bebrave-stroke bebrave-${rarity}${active?" is-active":""}`} data-effect={legendary?legendaryEffect(effectId):undefined} style={{"--stroke-color":color} as CSSProperties}>
    <StrokeLayers d={d} color={color} rarity={rarity} refs={pathRefs}/>
    {sparkles.map(stroke=><g key={stroke.id} data-stroke-id={stroke.id}>{stroke.points.map((s,i)=><CarvingSpark key={i} {...s} legendary={legendary}/>)}</g>)}
    {children}
  </g>;
});

export const BeBraveStroke=memo(function BeBraveStroke({stroke,...props}:{stroke:BeBravePublicStroke;color:string;rarity:BeBraveRarity;seed:number;effectId?:string;active?:boolean}) {
  return <BeBraveCarving strokes={[stroke]} {...props}/>;
});
