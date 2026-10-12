"use client";

import {useCallback,useEffect,useState} from "react";
import {BeBraveTree} from "./bebrave-tree";
import {HomeControls,OverlayScene} from "./bebrave-menu";
import {ToolEncounter} from "./bebrave-tool-encounter";
import {observeBeBraveBrowser} from "@/lib/bebrave/browser-metrics";
import type {BeBraveNormalTool,BeBravePublicDrawing,BeBraveSessionView,BeBraveTreeState} from "@/lib/bebrave-types";

/** A guarded, synthetic browser workload. Never writes or requests shared art. */
export function BeBraveBenchmark(){
  const [scenario,setScenario]=useState<"ordinary"|"crowded"|"tall">("ordinary");
  const [tools,setTools]=useState(false),[chosen,setChosen]=useState<BeBraveNormalTool|"cache">("arrowhead"),[reveal,setReveal]=useState(false);
  const fixture:BeBraveSessionView={id:"visual-fixture",status:"ready",chosenTool:chosen,chosenRarity:chosen==="cache"?"legendary":"epic",chosenColor:"#00F5FF",effectSeed:12,chosenEffect:"will-o-wisp-v1",toolResults:{arrowhead:"epic",nail:"common",key:"superior"},drawingStartedAt:null,drawingDeadline:null,drawingFinishedAt:null,zoneTop:null,zoneBottom:null,treeRevision:null,publicSequence:null};
  const feet=scenario==="tall"?50_000:104;
  const state:BeBraveTreeState={height:feet*288,activeTop:feet*288-1440,activeBottom:feet*288,revision:1,completedCount:0,latestSequence:0};
  const source=useCallback(async(section:number):Promise<BeBravePublicDrawing[]>=>{
    const count=scenario==="crowded"?30:3;
    const tiers=["common","uncommon","superior","epic","legendary"] as const;
    return Array.from({length:count},(_,index)=>({
      id:`fixture-${section}-${index}`,publicSequence:count-index,rarity:scenario==="crowded"?"legendary":tiers[(section+index)%5],color:index%5===0?"#5A321F":"#00F5FF",effectSeed:index*819+12,effectId:"will-o-wisp-v1",
      strokes:Array.from({length:3},(_,stroke)=>({strokeId:`fixture-${section}-${index}-${stroke}`,strokeOrder:stroke,
        points:Array.from({length:100},(_,point):[number,number]=>[35+(index*53)%500+point*1.4,Math.min(feet*288-10,section*864+120+(index*73)%480+stroke*30+Math.sin(point*.15)*32)])})),
    }));
  },[scenario,feet]);
  useEffect(()=>observeBeBraveBrowser(),[scenario]);
  if(tools)return <div className="bebrave-stage">
    <HomeControls/>
    <div className="bebrave-stage-art" aria-hidden="true"><div className="bebrave-stage-bg"/><div className="bebrave-stage-mid"/></div>
    <OverlayScene visual={<ToolEncounter session={fixture} reveal={reveal} selected={chosen} onHighlight={tool=>setChosen(tool)}/>}
      actions={<><button className="button" onClick={()=>setReveal(!reveal)}>{reveal?"Tools":"Reveal"}</button><button className="button" onClick={()=>setTools(false)}>Back</button></>}>
      Synthetic visual fixture. No timer, reward or database write.
    </OverlayScene>
  </div>;
  return <div className="bebrave-stage bebrave-world-stage">
    <BeBraveTree key={scenario} state={state} mode="admire" sectionSource={source} homeControls={<HomeControls/>}
      admireActions={<><p className="bebrave-benchmark-label">Synthetic QA · {scenario}<br/>{feet.toLocaleString()} feet</p>{(["ordinary","crowded","tall"] as const).map(value=><button className="button" key={value} aria-pressed={scenario===value} onClick={()=>setScenario(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}<button className="button" onClick={()=>setTools(true)}>Tools</button><a className="button" href="/bebrave">Back</a></>}/>
  </div>;
}
