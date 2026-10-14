"use client";

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { BeBravePublicDrawing, BeBraveSessionView } from "@/lib/bebrave-types";
import { BEBRAVE_EPIC_COLORS } from "@/lib/bebrave-config";
import { INFUSION_SYMBOLS, PERSONAL_SYMBOL, FEATHER_SYMBOL, SYMBOL_NAMES, SYMBOL_PATHS } from "@/lib/bebrave/symbol-paths";
import { type EnchantmentCamera } from "@/lib/bebrave/enchantment-painter";
import { useCarvingEnchantments } from "./use-carving-enchantments";
import { BeBraveCarving } from "./bebrave-stroke";
import { choiceKeys } from "./bebrave-menu";
import { bladePreviewCamera, BLADE_PREVIEW_VIEWBOX } from "@/lib/bebrave/blade-preview";

const sampleStrokes = [
  {strokeId:"x-one",strokeOrder:0,points:[[210,92],[510,484]] as [number,number][]},
  {strokeId:"x-two",strokeOrder:1,points:[[510,92],[210,484]] as [number,number][]},
];

export function BladePreview({drawing}:{drawing:BeBravePublicDrawing}) {
  const scene=useRef<HTMLDivElement>(null);
  const camera=useRef<EnchantmentCamera>({top:0,height:576,scale:.4,pixelRatio:1,left:0,offsetTop:0,viewportWidth:300,viewportHeight:230});
  const drawings=useMemo(()=>[drawing],[drawing]);
  const {auraRef,motesRef,wake,canvasReady}=useCarvingEnchantments({scene,camera,drawings,totalHeight:576,enabled:true,liveDrawing:()=>undefined});
  useLayoutEffect(()=>{
    const root=scene.current;if(!root)return;
    const measure=()=>{
      const width=root.clientWidth,height=root.clientHeight;
      camera.current=bladePreviewCamera(width,height,window.devicePixelRatio||1);
      wake();
    };
    const observer=new ResizeObserver(measure);observer.observe(root);measure();
    return()=>observer.disconnect();
  },[wake]);
  return <div ref={scene} className="bebrave-blade-preview" role="img" aria-label="Animated example X carving">
    <canvas ref={auraRef} className="bebrave-enchantment-canvas" aria-hidden="true"/>
    <canvas ref={motesRef} className="bebrave-enchantment-canvas bebrave-enchantment-motes" aria-hidden="true"/>
    {!canvasReady&&<svg viewBox={BLADE_PREVIEW_VIEWBOX} aria-hidden="true"><BeBraveCarving strokes={drawing.strokes} color={drawing.color} rarity={drawing.rarity} seed={drawing.effectSeed} effectId={drawing.effectId} canvasEffects/></svg>}
  </div>;
}

export function BladeEnchanter({session,busy=false,problem,onBack,onEnchant}:{
  session:BeBraveSessionView;busy?:boolean;problem?:string;
  onBack:()=>void;onEnchant:(color:string,symbol:number)=>void;
}) {
  const personal=session.chosenEffect==="blood-v1";
  const colors=personal?[{name:"Crimson",value:"#C51D36"}]:BEBRAVE_EPIC_COLORS;
  const symbols:readonly number[]=personal?[PERSONAL_SYMBOL]:INFUSION_SYMBOLS;
  const [color,setColor]=useState<string|null>(null);
  const [symbol,setSymbol]=useState<number|null>(null);
  const preview=useMemo<BeBravePublicDrawing|null>(()=>color&&symbol!==null?{
    id:"blade-preview",publicSequence:0,rarity:session.chosenRarity??"legendary",color,
    effectSeed:session.effectSeed??12,effectId:session.chosenEffect??undefined,particleSymbol:symbol,strokes:sampleStrokes,
  }:null,[color,symbol,session.chosenRarity,session.effectSeed,session.chosenEffect]);
  const colorName=colors.find(choice=>choice.value===color)?.name;
  return <div className="bebrave-enchanter bebrave-menu-panel">
    <h2 tabIndex={-1} data-menu-focus>Enchant the blade.</h2>
    <div className="bebrave-enchanter-body">
      <figure className="bebrave-enchanter-example">
        {preview?<BladePreview drawing={preview}/>:<div className="bebrave-blade-preview" role="img" aria-label="Choose an aura and an infusion to preview your carving"/>}
        <figcaption>{preview&&<>{colorName} · {personal?"Feather & dagger":SYMBOL_NAMES[symbol!]}</>}</figcaption>
      </figure>
      <div className="bebrave-enchanter-pickers">
        <fieldset disabled={busy}>
          <legend>Aura</legend>
          <div className="bebrave-enchanter-colors" onKeyDown={choiceKeys}>
            {colors.map(choice=><button key={choice.value} type="button" aria-label={choice.name} title={choice.name} aria-pressed={color===choice.value} style={{"--enchant-color":choice.value} as CSSProperties} onClick={()=>setColor(choice.value)}><span/></button>)}
          </div>
        </fieldset>
        <fieldset disabled={busy} className="bebrave-enchanter-symbols">
          <legend>Infusion</legend>
          <div onKeyDown={choiceKeys}>
            {symbols.map(choice=><button key={choice} type="button" aria-label={personal?"Feather and dagger":SYMBOL_NAMES[choice]} title={personal?"Feather and dagger":SYMBOL_NAMES[choice]} aria-pressed={symbol===choice} style={{color:color??"var(--discovery-dialog-ink)"}} onClick={()=>setSymbol(choice)}><svg viewBox="-1.2 -1.2 2.4 2.4" fill="currentColor" aria-hidden="true" focusable="false">{personal?<><path transform="translate(-.5 0) scale(.65)" d={SYMBOL_PATHS[FEATHER_SYMBOL]}/><path transform="translate(.5 0) scale(.65)" d={SYMBOL_PATHS[PERSONAL_SYMBOL]}/></>:<path d={SYMBOL_PATHS[choice]}/>}</svg></button>)}
          </div>
        </fieldset>
      </div>
    </div>
    {problem&&<p className="bebrave-enchanter-problem" role="alert">{problem}</p>}
    <div className="bebrave-enchanter-actions" onKeyDown={choiceKeys}>
      <button type="button" className="button" disabled={busy} onClick={onBack}>Back</button>
      <button type="button" className="button" disabled={busy||!color||symbol===null} onClick={()=>{if(color&&symbol!==null)onEnchant(color,symbol);}}>{busy?"Enchanting…":"Enchant"}</button>
    </div>
  </div>;
}
