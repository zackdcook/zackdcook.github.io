"use client";

import {useCallback,useEffect,useState} from "react";
import {BladeEnchanter} from "./bebrave-blade-enchanter";
import {BeBraveTree} from "./bebrave-tree";
import {HomeControls,OverlayScene,ActionBar} from "./bebrave-menu";
import {ToolEncounter} from "./bebrave-tool-encounter";
import {observeBeBraveBrowser} from "@/lib/bebrave/browser-metrics";
import {toolCopy} from "@/lib/bebrave/presentation";
import type {BeBraveNormalTool,BeBravePublicDrawing,BeBraveSessionView,BeBraveTreeState} from "@/lib/bebrave-types";

/** A guarded, synthetic browser workload. Never writes or requests shared art. */
export function BeBraveBenchmark(){
  const [scenario,setScenario]=useState<"ordinary"|"crowded"|"tall"|"crossing"|"enchantments">("ordinary");
  const [workshop,setWorkshop]=useState<"ordinary"|"personal"|null>(null);
  const [fallen,setFallen]=useState(false);
  const [tools,setTools]=useState(false),[chosen,setChosen]=useState<BeBraveNormalTool|"cache">("arrowhead"),[reveal,setReveal]=useState(false);
  const fixture:BeBraveSessionView={id:"visual-fixture",status:"ready",chosenTool:chosen,chosenRarity:chosen==="cache"?"legendary":"epic",chosenColor:"#00F5FF",effectSeed:12,chosenEffect:"will-o-wisp-v1",toolResults:{arrowhead:"epic",nail:"common",key:"superior"},drawingStartedAt:null,drawingDeadline:null,drawingFinishedAt:null,zoneTop:null,zoneBottom:null,treeRevision:null,publicSequence:null};
  const feet=scenario==="tall"?50_000:104;
  const state:BeBraveTreeState={height:feet*288,activeTop:feet*288-1440,activeBottom:feet*288,revision:1,completedCount:0,latestSequence:0};
  const source=useCallback(async(section:number):Promise<BeBravePublicDrawing[]>=>{
    const count=scenario==="crowded"?30:3;
    const tiers=["common","uncommon","superior","epic","legendary"] as const;
    if(scenario==="enchantments")return (["superior","epic","hearts-v1","rainbow-v1","blood-v1"] as const).map((effect,index)=>({
      id:`enchantment-${effect}`,publicSequence:index+1,rarity:index<2?effect as "superior"|"epic":"legendary" as const,
      color:["#FF7A00","#00F5FF","#FF4AD2","#A890FF","#C51D36"][index],effectSeed:index*819+12,effectId:index<2?undefined:effect,
      strokes:[0,1,2].map(stroke=>({strokeId:`enchantment-${index}-${stroke}`,strokeOrder:stroke,
        points:Array.from({length:49},(_,point):[number,number]=>{
          const center=feet*288-1440+index*275;
          if(stroke===2)return [360+58*Math.cos(point*Math.PI/24),center+58*Math.sin(point*Math.PI/24)];
          return [120+point*10,center+(stroke===0?1:-1)*65*Math.sin(point*Math.PI/24)];
        })})),
    })).filter(drawing=>Math.floor(drawing.strokes[0].points[0][1]/864)===section);
    if(scenario==="crossing")return tiers.map((rarity,index)=>({
      id:`crossing-${index}`,publicSequence:index+1,rarity,color:["#5A321F","#6D4FD1","#3D7BFF","#FF4AD2","#7DE86B"][index],effectSeed:index*819+12,effectId:"will-o-wisp-v1",
      strokes:[[[100,0],[610,160]],[[610,0],[100,160]],[[120,80],[600,80]]].map((points,stroke)=>({strokeId:`crossing-${index}-${stroke}`,strokeOrder:stroke,points:points.map(([x,y]):[number,number]=>[x,feet*288-1300+index*240+y])})),
    })).filter(drawing=>Math.floor(drawing.strokes[0].points[0][1]/864)===section);
    return Array.from({length:count},(_,index)=>({
      id:`fixture-${section}-${index}`,publicSequence:count-index,rarity:scenario==="crowded"?"legendary":tiers[(section+index)%5],color:index%5===0?"#5A321F":"#00F5FF",effectSeed:index*819+12,effectId:"will-o-wisp-v1",
      strokes:Array.from({length:3},(_,stroke)=>({strokeId:`fixture-${section}-${index}-${stroke}`,strokeOrder:stroke,
        points:Array.from({length:100},(_,point):[number,number]=>[35+(index*53)%500+point*1.4,Math.min(feet*288-10,section*864+120+(index*73)%480+stroke*30+Math.sin(point*.15)*32)])})),
    }));
  },[scenario,feet]);
  useEffect(()=>observeBeBraveBrowser(),[scenario]);
  if(workshop)return <div className="bebrave-stage">
    <HomeControls/><div className="bebrave-stage-art" aria-hidden="true"><div className="bebrave-stage-bg"/><div className="bebrave-stage-mid"/></div>
    <OverlayScene visual={<BladeEnchanter session={{...fixture,chosenTool:"cache",chosenRarity:"legendary",chosenColor:null,chosenEffect:workshop==="personal"?"blood-v1":"will-o-wisp-v1"}} onBack={()=>setWorkshop(null)} onEnchant={()=>setWorkshop(null)}/>}/>
  </div>;
  if(tools)return <div className="bebrave-stage">
    <HomeControls/>
    <div className="bebrave-stage-art" aria-hidden="true"><div className="bebrave-stage-bg"/><div className="bebrave-stage-mid"/></div>
    <OverlayScene visual={<ToolEncounter session={fixture} reveal={reveal} selected={chosen} onHighlight={tool=>setChosen(tool)}/>}
      actions={<><button className="button" onClick={()=>setReveal(!reveal)}>{reveal?"Tools":"Reveal"}</button><button className="button" onClick={()=>setTools(false)}>Back</button></>}>
      <p className="bebrave-benchmark-label">Synthetic visual fixture. No timer, reward or database write.</p><p>{chosen==="cache"?"The lockbox rattles from within as you pick it up, nearly betraying the secret it was asked to keep.":toolCopy[chosen].dialogue}</p>
    </OverlayScene>
  </div>;
  return <div className="bebrave-stage bebrave-world-stage">
    {fallen&&<><HomeControls/><ActionBar><button className="button" onClick={()=>setFallen(false)}>Back</button></ActionBar></>}
    <BeBraveTree key={scenario+(fallen?"-fallen":"")} state={state} mode={fallen?"fallen":"admire"} sectionSource={source} homeControls={<HomeControls/>}
      admireActions={<><p className="bebrave-benchmark-label">Synthetic QA · {scenario}<br/>{feet.toLocaleString()} feet</p>{(["ordinary","crowded","tall","crossing","enchantments"] as const).map(value=><button className="button" key={value} aria-pressed={scenario===value} onClick={()=>setScenario(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}<button className="button" onClick={()=>setTools(true)}>Tools</button><button className="button" onClick={()=>setWorkshop("ordinary")}>Workshop</button><button className="button" onClick={()=>setWorkshop("personal")}>Personal workshop</button><button className="button" onClick={()=>setFallen(true)}>Fallen</button><a className="button" href="/bebrave">Back</a></>}/>
  </div>;
}
