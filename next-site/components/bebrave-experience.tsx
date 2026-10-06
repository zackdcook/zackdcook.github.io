"use client";

import { useCallback,useEffect,useMemo,useRef,useState,type CSSProperties } from "react";
import { HumanCheck } from "@/components/human-check";
import { BeBraveTree } from "@/components/bebrave-tree";
import { BEBRAVE_EPIC_COLORS } from "@/lib/bebrave-config";
import { BEBRAVE_ACTIVE_HEIGHT,defaultBeBraveTimeline,fallbackBeBraveTreeState,type BeBraveLocalTimeline,type BeBraveNormalTool,type BeBraveSessionView,type BeBraveTreeState } from "@/lib/bebrave-types";

const timelineKey="zack.bebrave.timeline.v1";
type Scene="entry"|"base"|"admire"|"human"|"tools"|"cache"|"cache-code"|"epic-color"|"reveal"|"warning"|"draw"|"chop"|"confirm-chop"|"strikes"|"fallen"|"stump";

type DraftStroke={strokeId:string;strokeOrder:number;points:Array<[number,number]>};

const toolCopy:Record<BeBraveNormalTool,{label:string;emoji:string;dialogue:string}>={
  arrowhead:{label:"Stone-carved arrowhead",emoji:"🪨",dialogue:"The arrowhead feels hefty in your grasp, its edges still razor sharp, even after the multiple lifetimes it has slept through."},
  nail:{label:"Bent rusty nail",emoji:"📌",dialogue:"The nail has a rough, flaky texture that stains your fingers red."},
  key:{label:"Brass house key",emoji:"🔑",dialogue:"The key and its jagged teeth cover your fingers with a metallic scent."},
};

function normalizeTimeline(value:unknown):BeBraveLocalTimeline{
  const v=value&&typeof value==="object"?value as Record<string,unknown>:{};
  const kind=v.kind==="felling"||v.kind==="felled"?v.kind:"living";
  const roll=typeof v.additionalStrikes==="number"&&Number.isInteger(v.additionalStrikes)&&v.additionalStrikes>=1&&v.additionalStrikes<=4?v.additionalStrikes:null;
  const completed=typeof v.completedAdditionalStrikes==="number"&&Number.isInteger(v.completedAdditionalStrikes)?Math.max(0,Math.min(roll||0,v.completedAdditionalStrikes)):0;
  const seq=typeof v.snapshotSequence==="number"&&Number.isSafeInteger(v.snapshotSequence)&&v.snapshotSequence>=0?v.snapshotSequence:null;
  const height=typeof v.snapshotHeight==="number"&&Number.isSafeInteger(v.snapshotHeight)&&v.snapshotHeight>=BEBRAVE_ACTIVE_HEIGHT?v.snapshotHeight:null;
  return {kind:kind==="felled"&&seq!==null&&height!==null?"felled":kind==="felling"?"felling":"living",hacked:v.hacked===true,additionalStrikes:roll,completedAdditionalStrikes:completed,snapshotSequence:seq,snapshotHeight:height,felledAt:typeof v.felledAt==="string"?v.felledAt:null,immediateFallenSeen:v.immediateFallenSeen===true};
}

function cooldownText(target:string|null,now:number){
  if(!target)return "";const ms=Date.parse(target)-now;if(ms<=0)return "";
  const sec=Math.ceil(ms/1000),min=Math.floor(sec/60),hr=Math.floor(min/60),day=Math.floor(hr/24);
  if(day>0)return `Available again in ${day}d ${hr%24}h`;
  if(hr>0)return `Available again in ${hr}h ${min%60}m`;
  if(min>0)return `Available again in ${min}m ${sec%60}s`;
  return `Available again in ${sec}s`;
}

export function BeBraveExperience({enabled,siteKey}:{enabled:boolean;siteKey:string}){
  const [scene,setScene]=useState<Scene>("entry"),[tree,setTree]=useState<BeBraveTreeState>(fallbackBeBraveTreeState),[session,setSession]=useState<BeBraveSessionView|null>(null),[draftStrokes,setDraftStrokes]=useState<DraftStroke[]>([]);
  const [cooldown,setCooldown]=useState<string|null>(null),[serverNow,setServerNow]=useState(new Date().toISOString()),[problem,setProblem]=useState(""),[busy,setBusy]=useState(false),[cacheMessage,setCacheMessage]=useState(""),[cacheCode,setCacheCode]=useState(""),[cacheColors,setCacheColors]=useState(BEBRAVE_EPIC_COLORS),[timeline,setTimelineState]=useState<BeBraveLocalTimeline>(defaultBeBraveTimeline),[hydrated,setHydrated]=useState(false),[clock,setClock]=useState(Date.now());
  const humanForm=useRef<HTMLFormElement>(null),impactRef=useRef<HTMLDivElement>(null),clockOffset=useRef(0);
  const selectedNormal=session?.chosenTool&&session.chosenTool!=="cache"?session.chosenTool as BeBraveNormalTool:null;

  const saveTimeline=useCallback((next:BeBraveLocalTimeline)=>{setTimelineState(next);try{localStorage.setItem(timelineKey,JSON.stringify(next));}catch{}},[]);
  useEffect(()=>{try{setTimelineState(normalizeTimeline(JSON.parse(localStorage.getItem(timelineKey)||"null")));}catch{setTimelineState(defaultBeBraveTimeline);}setHydrated(true);},[]);
  useEffect(()=>{const id=setInterval(()=>setClock(Date.now()+clockOffset.current),1000);return()=>clearInterval(id);},[]);

  const applyState=useCallback((data:any)=>{if(data.state)setTree(data.state);if("cooldown" in data)setCooldown(data.cooldown);if(data.serverNow){setServerNow(data.serverNow);clockOffset.current=Date.parse(data.serverNow)-Date.now();}if(data.session)setSession(data.session);if(Array.isArray(data.draftStrokes))setDraftStrokes(data.draftStrokes);},[]);
  const refreshState=useCallback(async()=>{const r=await fetch("/api/bebrave/state",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"The tree could not load.");applyState(d);return d;},[applyState]);
  useEffect(()=>{if(!hydrated)return;refreshState().then(async d=>{if(timeline.kind==="felled"){setScene(timeline.immediateFallenSeen?"entry":"fallen");return;}if(d.session?.status==="drawing"){const r=await fetch(`/api/bebrave/session?id=${encodeURIComponent(d.session.id)}`,{cache:"no-store"});const detail=await r.json();if(r.ok){applyState(detail);setScene("draw");}}}).catch(e=>setProblem(e instanceof Error?e.message:"The tree could not load."));},[hydrated]);

  const onCooldown=cooldown?Date.parse(cooldown)>clock:false;
  const cooldownLabel=cooldownText(cooldown,clock);
  function sceneForSession(s:BeBraveSessionView|null){if(!s)return "human" as Scene;if(s.status==="tool_select")return "tools";if(s.status==="epic_color")return "epic-color";if(s.status==="ready")return "warning";if(s.status==="drawing")return "draw";return "admire";}

  async function admire(){setBusy(true);setProblem("");try{await refreshState();setScene("admire");}catch(e){setProblem(e instanceof Error?e.message:"The tree could not load.");}finally{setBusy(false);}}
  async function beginCarve(){if(onCooldown)return;setProblem("");if(session&&["tool_select","epic_color","ready","drawing"].includes(session.status)){setScene(sceneForSession(session));return;}setScene("human");}
  async function createSession(event:React.FormEvent){event.preventDefault();if(!humanForm.current)return;setBusy(true);setProblem("");try{const r=await fetch("/api/bebrave/session",{method:"POST",body:new FormData(humanForm.current)});const d=await r.json();if(r.status===429&&d.cooldown){setCooldown(d.cooldown);setScene("entry");return;}if(!r.ok)throw Error(d.error||"The tools could not be prepared.");applyState(d);setScene(sceneForSession(d.session));}catch(e){setProblem(e instanceof Error?e.message:"The tools could not be prepared.");}finally{setBusy(false);}}
  async function chooseTool(tool:BeBraveNormalTool){if(!session)return;setBusy(true);setProblem("");try{const r=await fetch("/api/bebrave/session/choose",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id,tool})});const d=await r.json();if(!r.ok)throw Error(d.error);applyState(d);setScene("reveal");}catch(e){setProblem(e instanceof Error?e.message:"That tool could not be selected.");}finally{setBusy(false);}}
  async function tryCache(){if(!session||!cacheCode)return;setBusy(true);setCacheMessage("The keys press down with a mechanical click.");try{const r=await fetch("/api/bebrave/session/cache",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id,code:cacheCode})});const d=await r.json();if(!d.valid){setCacheMessage("The keys press down with a mechanical click.\n\nNothing happened.");return;}applyState(d);if(d.colors)setCacheColors(d.colors);setCacheMessage("The top of the cache springs open, peeling away a layer of moss. Inside sits a small pocket knife, tied with a braided parachute-cord lanyard.\n\nThe knife flicks open with a satisfying clink.");setScene("epic-color");}catch{setCacheMessage("The keys press down with a mechanical click.\n\nNothing happened.");}finally{setBusy(false);}}
  async function chooseEpicColor(color:string){if(!session)return;setBusy(true);try{const r=await fetch("/api/bebrave/session/color",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id,color})});const d=await r.json();if(!r.ok)throw Error(d.error);applyState(d);setScene("warning");}catch(e){setProblem(e instanceof Error?e.message:"That color could not be selected.");}finally{setBusy(false);}}
  async function startDrawing(){if(!session)return;setBusy(true);setProblem("");try{const r=await fetch("/api/bebrave/session/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id})});const d=await r.json();if(!r.ok)throw Error(d.error);applyState(d);setScene("draw");}catch(e){setProblem(e instanceof Error?e.message:"The timer could not start.");}finally{setBusy(false);}}
  async function drawingFinished(payload:any){applyState(payload);await refreshState().catch(()=>{});setSession(payload.session||null);setDraftStrokes([]);setScene("admire");}

  function impact(strong=false){const el=impactRef.current;if(!el||document.documentElement.dataset.effects==="reduced")return;const d=strong?9:2;el.animate([{transform:"translate(0,0)"},{transform:`translate(${-d}px,${d*.25}px)`},{transform:`translate(${d*.7}px,${-d*.2}px)`},{transform:"translate(0,0)"}],{duration:strong?260:120,easing:"ease-out"});}
  function firstStrike(){impact();saveTimeline({...timeline,kind:"felling",hacked:true});setScene("confirm-chop");}
  function continueChop(){let roll=timeline.additionalStrikes;if(!roll){const b=new Uint8Array(1);crypto.getRandomValues(b);roll=b[0]%4+1;}saveTimeline({...timeline,kind:"felling",hacked:true,additionalStrikes:roll,completedAdditionalStrikes:timeline.completedAdditionalStrikes});setScene("strikes");}
  async function strike(){const required=timeline.additionalStrikes||1;const done=timeline.completedAdditionalStrikes+1;impact(done>=required);if(done<required){saveTimeline({...timeline,kind:"felling",hacked:true,completedAdditionalStrikes:done});return;}setBusy(true);try{const r=await fetch("/api/bebrave/snapshot",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);const now=d.serverNow||new Date().toISOString();const next:BeBraveLocalTimeline={...timeline,kind:"felled",hacked:true,completedAdditionalStrikes:done,snapshotSequence:d.state.latestSequence,snapshotHeight:d.state.height,felledAt:now,immediateFallenSeen:false};saveTimeline(next);setTree(d.state);setScene("fallen");}catch(e){setProblem(e instanceof Error?e.message:"The final strike could not finish.");}finally{setBusy(false);}}
  useEffect(()=>{if(scene==="fallen"&&timeline.kind==="felled"&&!timeline.immediateFallenSeen){saveTimeline({...timeline,immediateFallenSeen:true});}},[scene]);

  const fallenState=useMemo(()=>timeline.snapshotHeight?{...tree,height:timeline.snapshotHeight,activeBottom:timeline.snapshotHeight,activeTop:timeline.snapshotHeight-BEBRAVE_ACTIVE_HEIGHT,latestSequence:timeline.snapshotSequence||0}:tree,[tree,timeline.snapshotHeight,timeline.snapshotSequence]);
  const marks=1+timeline.completedAdditionalStrikes;

  if(!hydrated)return <div className="shell bebrave-entry"><p role="status">You follow a humid path into the swamp…</p></div>;
  if(scene==="admire")return <><div className="bebrave-mode-bar"><button className="button button-small" onClick={()=>setScene("entry")}>Back to the clearing</button>{!onCooldown&&<button className="button" onClick={beginCarve}>Carve something into the tree</button>}{onCooldown&&<span>{cooldownLabel}</span>}</div><BeBraveTree state={tree} mode="admire"/></>;
  if(scene==="draw"&&session)return <BeBraveTree state={tree} mode="draw" session={session} serverNow={serverNow} draftStrokes={draftStrokes} onFinished={drawingFinished}/>;
  if(scene==="fallen"&&timeline.kind==="felled")return <><div className="bebrave-mode-bar"><span>A moment kept in bark.</span></div><BeBraveTree state={fallenState} mode="fallen" cutoff={timeline.snapshotSequence||0}/></>;

  const dead=timeline.kind==="felled"&&timeline.immediateFallenSeen;
  return <div className="bebrave-experience" ref={impactRef}>
    {scene==="entry"&&<div className="shell bebrave-entry">
      {dead?<><p>You meander into a hot Florida swamp. The smell of rot fills your lungs. Before you sits an enormous stump.</p><p>You have the distinct feeling that this is your fault.</p><div className="actions"><button className="button" onClick={()=>setScene("stump")}>Look at the stump</button><button className="button" onClick={()=>{}}>Regret your decisions</button></div></>:<><p>You meander into a humid Florida swamp and are greeted by a tree, impossibly tall, reaching into the clouds. The pleasant aroma of fresh cypress tingles your nose. You notice etchings in the bark of the tree, some new, others higher up, seemingly older.</p><p>What do you do?</p><div className="actions"><button className="button" onClick={()=>setScene("base")}>Nothing</button><button className="button" disabled={busy} onClick={admire}>Admire the tree</button><button className="button bebrave-carve-option" disabled={busy||onCooldown||!enabled} onClick={beginCarve}><span>Carve something into the tree</span>{onCooldown&&<small>{cooldownLabel}</small>}{!enabled&&<small>Carving opens after the backend setup step.</small>}</button><button className="button" onClick={()=>setScene("chop")}>Chop down the tree</button></div></>}
      {problem&&<p role="alert">{problem}</p>}
    </div>}

    {scene==="base"&&<><div className="shell bebrave-entry"><p>You stay where you are, looking at the base of the cypress.</p><button className="button button-small" onClick={()=>setScene("entry")}>Back</button></div><BeBraveTree state={tree} mode="base"/></>}

    {scene==="human"&&<div className="shell bebrave-dialog-card"><h1>Before you carve…</h1><p>A quick human check keeps the communal tree from becoming bot mulch.</p><form ref={humanForm} onSubmit={createSession}><HumanCheck siteKey={siteKey} action="bebrave" resetKey={session?.id||"new"}/><button className="button" disabled={busy}>{busy?"Checking the bark…":"Continue"}</button></form>{problem&&<p role="alert">{problem}</p>}</div>}

    {scene==="tools"&&<div className="shell bebrave-dialog-card"><p>You look down at the base of the trunk and see a stone-carved arrowhead, a bent rusty nail, and brass house key laying on the ground beside a mossy cache sealed by a numeric keypad. Which do you choose?</p><div className="bebrave-tools">{(Object.keys(toolCopy) as BeBraveNormalTool[]).map(tool=><button key={tool} className="button bebrave-tool" disabled={busy} onClick={()=>chooseTool(tool)}><span>{toolCopy[tool].emoji}</span>{toolCopy[tool].label}</button>)}<button className="button bebrave-tool" onClick={()=>setScene("cache")}><span>🔐</span>Mossy cache</button></div>{problem&&<p role="alert">{problem}</p>}</div>}

    {scene==="cache"&&<div className="shell bebrave-dialog-card"><p>The lockbox rattles from within as you pick it up, nearly betraying the secret it was asked to keep. Enter a code?</p><div className="actions"><button className="button" onClick={()=>setScene("cache-code")}>Yes</button><button className="button" onClick={()=>setScene("tools")}>No</button></div></div>}

    {scene==="cache-code"&&<div className="shell bebrave-dialog-card"><label htmlFor="bebrave-cache-code">Cache code</label><input id="bebrave-cache-code" className="bebrave-code-display" value={cacheCode} inputMode="numeric" autoComplete="off" readOnly aria-label="Entered cache code"/><div className="bebrave-keypad" aria-label="Mechanical numeric keypad">{["1","2","3","4","5","6","7","8","9"].map(d=><button key={d} type="button" onClick={()=>setCacheCode(v=>(v+d).slice(0,24))}>{d}</button>)}<button type="button" aria-label="Clear code" onClick={()=>setCacheCode("")}>C</button><button type="button" onClick={()=>setCacheCode(v=>(v+"0").slice(0,24))}>0</button><button type="button" aria-label="Delete last digit" onClick={()=>setCacheCode(v=>v.slice(0,-1))}>⌫</button></div><button className="button" disabled={busy||!cacheCode} onClick={tryCache}>Enter code</button>{cacheMessage&&<p className="bebrave-preserve-lines" role="status">{cacheMessage}</p>}<button className="button button-small" onClick={()=>{setCacheCode("");setCacheMessage("");setScene("tools");}}>Return to the tools</button></div>}

    {scene==="epic-color"&&<div className="shell bebrave-dialog-card">{cacheMessage&&<p className="bebrave-preserve-lines">{cacheMessage}</p>}<h2>SECRET CACHE → CHOOSE YOUR EPIC COLOR</h2><div className="bebrave-color-grid">{cacheColors.map(c=><button key={c.value} className="bebrave-color-choice" style={{"--choice-color":c.value} as CSSProperties} onClick={()=>chooseEpicColor(c.value)}><span/>{c.name}</button>)}</div>{problem&&<p role="alert">{problem}</p>}</div>}

    {scene==="reveal"&&session&&selectedNormal&&<div className="shell bebrave-dialog-card"><p>{toolCopy[selectedNormal].dialogue}</p><h2>The bark answers.</h2><div className="bebrave-rarity-reveal">{(Object.keys(toolCopy) as BeBraveNormalTool[]).map(tool=><div key={tool} className={tool===selectedNormal?"is-chosen":""}><strong>{toolCopy[tool].label}</strong><span>{session.toolResults?.[tool]?.toUpperCase()}</span>{tool===selectedNormal&&<em>YOUR CHOICE</em>}</div>)}</div><button className="button" onClick={()=>setScene("warning")}>Continue</button></div>}

    {scene==="warning"&&<div className="shell bebrave-dialog-card"><p>You’ll have 60 seconds to carve once you begin. There’s no undo, so be ready.</p><button className="button" disabled={busy} onClick={startDrawing}>Start carving</button>{problem&&<p role="alert">{problem}</p>}</div>}

    {(scene==="chop"||scene==="confirm-chop"||scene==="strikes")&&<div className="bebrave-chop-wrap"><div className="shell bebrave-entry">{scene==="chop"&&<p>Click or tap the trunk.</p>}{scene==="confirm-chop"&&<><p>You hack at the tree’s hardened trunk. This tree has been here a very long time. Continue?</p><div className="actions"><button className="button" onClick={continueChop}>Continue</button><button className="button" onClick={()=>{saveTimeline({...timeline,kind:"living",hacked:true,additionalStrikes:null,completedAdditionalStrikes:0,snapshotSequence:null,snapshotHeight:null,felledAt:null,immediateFallenSeen:false});setScene("entry");}}>Stop</button></div></>}{scene==="strikes"&&<p>{busy?"The trunk gives way…":"Click or tap the trunk."}</p>}{problem&&<p role="alert">{problem}</p>}</div><div className="bebrave-chop-scene">{Array.from({length:timeline.hacked?marks:0},(_,i)=><span key={i} className="bebrave-axe-mark" style={{transform:`translate(${i*3}px,${i*5}px) rotate(${-16+i*3}deg)`}}/>)}{scene==="chop"&&<button aria-label="Strike the tree" onClick={firstStrike}/>} {scene==="strikes"&&<button aria-label="Strike the tree" disabled={busy} onClick={strike}/>}</div></div>}

    {scene==="stump"&&<div className="bebrave-stump-scene"><div className="bebrave-stump" aria-hidden="true"/><div className="shell"><button className="button button-small" onClick={()=>setScene("entry")}>Back</button></div></div>}
  </div>;
}
