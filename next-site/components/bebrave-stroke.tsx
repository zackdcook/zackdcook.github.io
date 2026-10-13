"use client";

import { memo,useId,useMemo,type CSSProperties,type ReactNode,type RefObject } from "react";
import type { BeBravePublicStroke, BeBraveRarity } from "@/lib/bebrave-types";
import { sparklePoints } from "@/lib/bebrave/effect-anchors";
import { legendaryColor, legendaryEffect } from "@/lib/bebrave/effects";
import { SYMBOL_PATHS, validParticleSymbol, PERSONAL_SYMBOLS } from "@/lib/bebrave/symbol-paths";
import { carvingEdge, carvingPigment } from "@/lib/bebrave/carving-contrast";

export function pointsToPath(points: Array<[number, number]>) {
  if (!points.length) return "";
  return points.map(([x,y],i)=>`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

/** Separate subpaths keep every original vertex. One layer spans the entire
 * carving, so another stroke from this visitor cannot cut through its core. */
export function carvingToPath(strokes: BeBravePublicStroke[]) {
  return strokes.map(stroke=>pointsToPath(stroke.points)).filter(Boolean).join(" ");
}

export type StrokePathRefs = Partial<Record<"edge"|"cut"|"rim"|"halo"|"glow"|"flow"|"line"|"inlay"|"shimmer",RefObject<SVGPathElement|null>>>;

/** The exact same ink stack is used by the fast live path and every saved view. */
export function StrokeLayers({d="",color,rarity,refs={},canvasEffects=false}:{d?:string;color:string;rarity:BeBraveRarity;refs?:StrokePathRefs;canvasEffects?:boolean}) {
  color=carvingPigment(rarity,color);
  const magic=!canvasEffects&&(rarity==="superior"||rarity==="epic"||rarity==="legendary");
  return <>
    {magic&&<path ref={refs.halo} className="bebrave-stroke-halo" d={d} stroke={color}/>}
    {magic&&<path ref={refs.glow} className="bebrave-stroke-glow" d={d} stroke={color}/>}
    {magic&&<path ref={refs.flow} className="bebrave-aura-current" d={d} stroke={color}/>}
    <path ref={refs.edge} className="bebrave-stroke-contrast" d={d}/>
    <path ref={refs.cut} className="bebrave-stroke-cut" d={d}/>
    <path ref={refs.rim} className="bebrave-stroke-rim" d={d} stroke={carvingEdge(color)}/>
    <path ref={refs.line} className="bebrave-stroke-line" d={d} stroke={color}/>
    <path ref={refs.inlay} className="bebrave-stroke-inlay" d={d}/>
    {!canvasEffects&&(rarity==="epic"||rarity==="legendary")&&<path ref={refs.shimmer} className="bebrave-epic-shimmer" d={d}/>}
  </>;
}

export function sparkGeometry(radius: number, legendary: boolean) {
  const r = radius * (legendary ? 3.8 : 6.1);
  return {
    star: `M0 ${-r} L${r*.22} ${-r*.22} L${r} 0 L${r*.22} ${r*.22} L0 ${r} L${-r*.22} ${r*.22} L${-r} 0 L${-r*.22} ${-r*.22} Z`,
    facets: `M0 ${-r*1.65} L${r*1.1} 0 L0 ${r*1.65} L${-r*1.1} 0 Z`,
    orbit: r * 2.05, core: Math.max(1.8, r * .32),
  };
}

/** All movement is reconstructed from existing stored anchors. No frame loop,
 * new random roll, or storage migration is needed on publication or refresh. */
export function enchantmentParticleStyle(radius: number, delay: number,effectId?:string): CSSProperties {
  const blood=effectId==="blood-v1";
  return {
    "--particle-x": `${((radius-3.5)*(blood?9:40)).toFixed(2)}px`,
    "--particle-y": `${((blood?100+radius*28:-90-radius*24)).toFixed(2)}px`,
    "--particle-curl": `${(blood?0:(delay-1.9)*23).toFixed(2)}deg`,
    "--particle-duration": `${(blood?4+delay*.35:2.8+delay*.6).toFixed(2)}s`,
    "--trail-opacity": delay>2.25 ? ".7" : "0",
    "--star-opacity": delay>1.3?"1":"0",
    animationDelay: `${-delay}s`,
  } as CSSProperties;
}

export function particleMark(radius:number,effectId?:string) {
  const r=radius*5.2;
  if(effectId==="hearts-v1")return `M0 ${r*.9} C${-r*1.7} ${-r*.2} ${-r*.9} ${-r*1.4} 0 ${-r*.5} C${r*.9} ${-r*1.4} ${r*1.7} ${-r*.2} 0 ${r*.9} Z`;
  if(effectId==="blood-v1")return `M0 ${-r} C${-r*.25} ${-r*.25} ${-r*.75} ${r*.1} ${-r*.75} ${r*.55} C${-r*.75} ${r*1.2} ${r*.75} ${r*1.2} ${r*.75} ${r*.55} C${r*.75} ${r*.1} ${r*.25} ${-r*.25} 0 ${-r} Z`;
  return sparkGeometry(radius,false).star;
}

export function CarvingSpark({x=0,y=0,r,delay=0,legendary=false,effectId,symbol}:{x?:number;y?:number;r:number;delay?:number;legendary?:boolean;effectId?:string;symbol?:number}) {
  if(symbol!==undefined&&SYMBOL_PATHS[symbol])return <g className="bebrave-sparkle" transform={`translate(${x} ${y})`}>
    <g className="bebrave-energy-particle" style={enchantmentParticleStyle(r,delay,effectId)}><g transform={`scale(${r*2.5})`}><path className="bebrave-sparkle-star bebrave-particle-mark" d={SYMBOL_PATHS[symbol]}/></g></g>
  </g>;
  const shape = sparkGeometry(r, legendary);
  const special=legendary&&legendaryEffect(effectId)!=="will-o-wisp-v1";
  const mark=particleMark(r,special?effectId:undefined);
  const blood=special&&effectId==="blood-v1",hearts=special&&effectId==="hearts-v1";
  if(!legendary||special)return <g className="bebrave-sparkle" transform={`translate(${x} ${y})`}>
    {!blood&&<path className="bebrave-energy-glint" d={hearts?mark:sparkGeometry(r,false).star} style={{animationDelay:`-${delay}s`}}/>}
    <g className="bebrave-energy-particle" style={enchantmentParticleStyle(r,delay,effectId)}>
      {!blood&&<circle className="bebrave-energy-mote" r={r*2.8}/>}
      <path className={`bebrave-sparkle-star bebrave-particle-mark${hearts?" bebrave-heart":""}${blood?" bebrave-blood-drop":""}`} d={mark}/>
      {!hearts&&!blood&&<circle className="bebrave-sparkle-core" r={Math.max(2.4,r*.85)}/>}
      <path className="bebrave-energy-trail" d={blood?"M0 -44 Q2 -20 0 2":"M0 3 C-18 18 22 28 4 44 C-5 57 -9 50 -8 63"}/>
    </g>
    {!blood&&<circle className="bebrave-energy-satellite" r={r*.85} style={{...enchantmentParticleStyle(r+1,delay+1.8),animationDelay:`${-delay-1.8}s`}}/>}
  </g>;
  return <g className="bebrave-sparkle" transform={`translate(${x} ${y})`}>
    {legendary&&<circle className="bebrave-wisp-orbit" r={shape.orbit} style={{animationDelay:`-${delay}s`}}/>}
    <path className="bebrave-sparkle-facets" d={shape.facets}/>
    <path className="bebrave-sparkle-star" d={shape.star} style={{animationDelay:`-${delay}s`}}/>
    <circle className="bebrave-sparkle-core" r={shape.core}/>
  </g>;
}

export const BeBraveCarving=memo(function BeBraveCarving({strokes,color,rarity,seed,effectId,particleSymbol,active=false,pathRefs,children,canvasEffects=false}:{strokes:BeBravePublicStroke[];color:string;rarity:BeBraveRarity;seed:number;effectId?:string;particleSymbol?:number;active?:boolean;pathRefs?:StrokePathRefs;children?:ReactNode;canvasEffects?:boolean}) {
  const gradientId=`carving-rainbow-${useId().replace(/[^a-zA-Z0-9_-]/g,"_")}`;
  const d=useMemo(()=>carvingToPath(strokes),[strokes]);
  const epic=rarity==="epic",legendary=rarity==="legendary";
  const effect=legendary?legendaryEffect(effectId):undefined;
  const pigment=carvingPigment(rarity,color);
  const ink=legendary?legendaryColor(effectId,pigment):pigment;
  const rainbow=effect==="rainbow-v1";
  const sparkles=useMemo(()=>!canvasEffects&&(epic||legendary)?strokes.map(stroke=>({id:stroke.strokeId,points:stroke.sparkles??sparklePoints(stroke.points,seed,stroke.strokeOrder)})):[],[epic,legendary,strokes,seed,canvasEffects]);
  if(!d&&!pathRefs)return null;
  return <g className={`bebrave-stroke bebrave-${rarity}${active?" is-active":""}`} data-effect={effect} style={{"--stroke-color":ink,"--aura-delay":`${-(seed%67)/10}s`,"--aura-duration":`${3.8+(seed%11)/10}s`,...(rainbow?{"--rainbow-ink":`url(#${gradientId})`}:{})} as CSSProperties}>
    {rainbow&&<defs><linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" x2="720" y1="0" y2="0"><stop offset="0" stopColor="#FF4D6D"/><stop offset=".17" stopColor="#FFB347"/><stop offset=".34" stopColor="#F9F871"/><stop offset=".5" stopColor="#7CF5A2"/><stop offset=".67" stopColor="#50DFFF"/><stop offset=".84" stopColor="#A890FF"/><stop offset="1" stopColor="#FF6ADE"/></linearGradient></defs>}
    <StrokeLayers d={d} color={ink} rarity={rarity} refs={pathRefs} canvasEffects={canvasEffects}/>
    {sparkles.map((stroke,strokeIndex)=><g key={stroke.id} data-stroke-id={stroke.id}>{stroke.points.map((s,i)=><CarvingSpark key={i} {...s} legendary={legendary} effectId={effect} symbol={effect==="blood-v1"?PERSONAL_SYMBOLS[(i+strokeIndex)%PERSONAL_SYMBOLS.length]:validParticleSymbol(particleSymbol)?particleSymbol:undefined}/>)}</g>)}
    {children}
  </g>;
});

export const BeBraveStroke=memo(function BeBraveStroke({stroke,...props}:{stroke:BeBravePublicStroke;color:string;rarity:BeBraveRarity;seed:number;effectId?:string;particleSymbol?:number;active?:boolean}) {
  return <BeBraveCarving strokes={[stroke]} {...props}/>;
});
