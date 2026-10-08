"use client";

import { useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties } from "react";
import { HumanCheck } from "@/components/human-check";
import { BeBraveTree } from "@/components/bebrave-tree";
import { BEBRAVE_EPIC_COLORS } from "@/lib/bebrave-config";
import { BEBRAVE_ACTIVE_HEIGHT,defaultBeBraveTimeline,fallbackBeBraveTreeState,type BeBraveLocalTimeline,type BeBraveNormalTool,type BeBraveRarity,type BeBraveSessionView,type BeBraveTreeState } from "@/lib/bebrave-types";

const timelineKey="zack.bebrave.timeline.v1";
const siteTimelineKey="zack.timeline.v1";
type Scene="entry"|"base"|"admire"|"complete"|"human"|"tools"|"cache"|"cache-code"|"epic-color"|"reveal"|"warning"|"draw"|"chop"|"confirm-chop"|"strikes"|"fallen"|"stump"|"regret";
type DraftStroke={strokeId:string;strokeOrder:number;points:Array<[number,number]>};

const toolCopy:Record<BeBraveNormalTool,{label:string;dialogue:string}>={
  arrowhead:{label:"Stone-carved arrowhead",dialogue:"The arrowhead feels hefty in your grasp, its edges still razor sharp, even after the multiple lifetimes it has slept through."},
  nail:{label:"Bent rusty nail",dialogue:"The nail has a rough, flaky texture that stains your fingers red."},
  key:{label:"Brass house key",dialogue:"The key and its jagged teeth cover your fingers with a metallic scent."},
};
const tools:BeBraveNormalTool[]=["arrowhead","nail","key"];

function normalizeTimeline(value:unknown):BeBraveLocalTimeline{
  const v=value&&typeof value==="object"?value as Record<string,unknown>:{};
  const kind=v.kind==="felling"||v.kind==="felled"?v.kind:"living";
  const roll=typeof v.additionalStrikes==="number"&&Number.isInteger(v.additionalStrikes)&&v.additionalStrikes>=1&&v.additionalStrikes<=4?v.additionalStrikes:null;
  const completed=typeof v.completedAdditionalStrikes==="number"&&Number.isInteger(v.completedAdditionalStrikes)?Math.max(0,Math.min(roll||0,v.completedAdditionalStrikes)):0;
  const seq=typeof v.snapshotSequence==="number"&&Number.isSafeInteger(v.snapshotSequence)&&v.snapshotSequence>=0?v.snapshotSequence:null;
  const height=typeof v.snapshotHeight==="number"&&Number.isSafeInteger(v.snapshotHeight)&&v.snapshotHeight>=BEBRAVE_ACTIVE_HEIGHT?v.snapshotHeight:null;
  return {kind:kind==="felled"&&seq!==null&&height!==null?"felled":kind==="felling"?"felling":"living",hacked:v.hacked===true,additionalStrikes:roll,completedAdditionalStrikes:completed,snapshotSequence:seq,snapshotHeight:height,felledAt:typeof v.felledAt==="string"?v.felledAt:null,immediateFallenSeen:v.immediateFallenSeen===true};
}
function HomeControls({testMode,busy,onReset}:{testMode:boolean;busy:boolean;onReset:()=>void}){
  return <>
    <a className="bebrave-home-button" href="/" aria-label="Zack Cook — home">
      <svg className="bebrave-home-mark site-mark" viewBox="0 0 1280 1280" aria-hidden="true" focusable="false">
        <rect width="1280" height="1280" rx="200" fill="var(--midnight)"/>
        <path d="M395 200 C560 230 800 198 980 150 L1015 190 L205 875 L176 800 L800 294 C620 330 460 305 395 263 Z M220 1035 L180 993 L1034 380 L1018 445 L503 951 C665 910 800 934 938 968 L969 1040 C744 971 480 1014 268 1098 Z" fill="var(--coral)"/>
      </svg>
      <span>Zack Cook</span>
    </a>
    {testMode&&<button className="button bebrave-test-reset-button" disabled={busy} onClick={onReset}>Reset my carve limit</button>}
  </>;
}
function ActionBar({children}:{children:React.ReactNode}){return <div className="bebrave-rpg-actions" aria-label="Choices">{children}</div>;}
function Dialogue({children,actions,className=""}:{children:React.ReactNode;actions?:React.ReactNode;className?:string}){return <div className={`bebrave-rpg-hud ${className}`}><div className="bebrave-rpg-dialogue"><div className="bebrave-rpg-copy">{children}</div></div>{actions&&<ActionBar>{actions}</ActionBar>}</div>;}
function OverlayScene({visual,children,actions}:{visual:React.ReactNode;children?:React.ReactNode;actions?:React.ReactNode}){
  return <div className="bebrave-overlay">
    <div className="bebrave-overlay-main">{visual}</div>
    {children&&<Dialogue actions={actions}>{children}</Dialogue>}
  </div>;
}
function Stage({children,felled=false,marks=0,stump=false,testMode=false,testBusy=false,onTestReset=()=>{}}:{children:React.ReactNode;felled?:boolean;marks?:number;stump?:boolean;testMode?:boolean;testBusy?:boolean;onTestReset?:()=>void}){
  return <div className={`bebrave-stage ${felled?"is-bebrave-felled":""} ${stump?"is-bebrave-stump":""}`}><HomeControls testMode={testMode} busy={testBusy} onReset={onTestReset}/><div className="bebrave-stage-art" aria-hidden="true"><div className="bebrave-stage-bg"/><div className="bebrave-stage-mid"/>{!stump&&<div className="bebrave-stage-tree"/>}{stump&&<div className="bebrave-stage-stump"/>}{!stump&&marks>0&&<div className="bebrave-stage-hacks">{Array.from({length:marks},(_,i)=><i key={i} style={{transform:`translate(${i*4}px,${i*5}px) rotate(${-16+i*3}deg)`}}/>)}</div>}</div>{children}</div>;
}
function ToolImage({tool}:{tool:BeBraveNormalTool|"cache"}){return <span className={`bebrave-tool-image tool-${tool}`} aria-hidden="true"/>;}
function RarityEffect({rarity}:{rarity:BeBraveRarity}){return <span className={`bebrave-rarity-fx fx-${rarity}`} aria-hidden="true"><i/><i/><i/><i/><i/></span>;}

export function BeBraveExperience({enabled,siteKey,testMode=false}:{enabled:boolean;siteKey:string;testMode?:boolean}){
  const [scene,setScene]=useState<Scene>("entry"),[tree,setTree]=useState<BeBraveTreeState>(fallbackBeBraveTreeState),[session,setSession]=useState<BeBraveSessionView|null>(null),[draftStrokes,setDraftStrokes]=useState<DraftStroke[]>([]);
  const [growthRemaining,setGrowthRemaining]=useState(0),[serverNow,setServerNow]=useState(new Date().toISOString()),[problem,setProblem]=useState(""),[busy,setBusy]=useState(false),[cacheMessage,setCacheMessage]=useState(""),[cacheCode,setCacheCode]=useState(""),[cacheColors,setCacheColors]=useState(BEBRAVE_EPIC_COLORS),[timeline,setTimelineState]=useState<BeBraveLocalTimeline>(defaultBeBraveTimeline),[hydrated,setHydrated]=useState(false);
  const humanForm=useRef<HTMLFormElement>(null),impactRef=useRef<HTMLDivElement>(null),priorSiteTimeline=useRef("living"),toolChoiceBusy=useRef(false);
  const selectedNormal=session?.chosenTool&&session.chosenTool!=="cache"?session.chosenTool as BeBraveNormalTool:null;

  const applyTimelineTheme=useCallback((kind:BeBraveLocalTimeline["kind"])=>{document.documentElement.dataset.timeline=kind==="felled"?"felled":"living";},[]);
  const saveTimeline=useCallback((next:BeBraveLocalTimeline)=>{setTimelineState(next);applyTimelineTheme(next.kind);try{localStorage.setItem(timelineKey,JSON.stringify(next));}catch{}},[applyTimelineTheme]);
  const syncSiteTimeline=useCallback((kind:"living"|"felled",sequence:number|null=null,at:string|null=null)=>{
    const value=kind==="felled"?{kind:"felled",hacked:true,roll:null,remaining:0,felledAtGuestNumber:sequence??0,felledAt:at,carvingId:null}:{kind:"living",hacked:false,roll:null,remaining:0,felledAtGuestNumber:null,felledAt:null,carvingId:null};
    try{localStorage.setItem(siteTimelineKey,JSON.stringify(value));}catch{}document.documentElement.dataset.timeline=kind;
  },[]);

  useLayoutEffect(()=>{
    priorSiteTimeline.current=document.documentElement.dataset.timeline||"living";
    let story=defaultBeBraveTimeline;
    try{story=normalizeTimeline(JSON.parse(localStorage.getItem(timelineKey)||"null"));}catch{}
    setTimelineState(story);applyTimelineTheme(story.kind);setHydrated(true);
    return()=>{document.documentElement.dataset.timeline=priorSiteTimeline.current;};
  },[applyTimelineTheme]);

  const applyState=useCallback((data:any)=>{
    if(data.state)setTree(data.state);
    if("growthFeetRemaining" in data)setGrowthRemaining(Math.max(0,Number(data.growthFeetRemaining)||0));
    if(data.serverNow)setServerNow(data.serverNow);
    if(data.session)setSession(data.session);
    if(Array.isArray(data.draftStrokes))setDraftStrokes(data.draftStrokes);
  },[]);
  const refreshState=useCallback(async()=>{const r=await fetch("/api/bebrave/state",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"The tree could not load.");applyState(d);return d;},[applyState]);
  useEffect(()=>{if(!hydrated)return;refreshState().then(async d=>{if(timeline.kind==="felled"){setScene("entry");return;}if(timeline.kind==="felling"&&timeline.additionalStrikes){setScene("strikes");return;}if(timeline.kind==="felling"&&timeline.hacked){setScene("confirm-chop");return;}if(d.session?.status==="drawing"){const r=await fetch(`/api/bebrave/session?id=${encodeURIComponent(d.session.id)}`,{cache:"no-store"});const detail=await r.json();if(r.ok){applyState(detail);setScene("draw");}}}).catch(e=>setProblem(e instanceof Error?e.message:"The tree could not load."));},[hydrated]);

  const resumable=Boolean(session&&["tool_select","epic_color","ready","drawing"].includes(session.status));
  const growthLocked=growthRemaining>0&&!resumable;
  function sceneForSession(s:BeBraveSessionView|null){if(!s)return "human" as Scene;if(s.status==="tool_select")return "tools";if(s.status==="epic_color")return "epic-color";if(s.status==="ready")return "warning";if(s.status==="drawing")return "draw";return "admire";}
  function admire(){ setProblem(""); setScene("admire"); }
  async function beginCarve(){if(growthLocked)return;setProblem("");if(session&&["tool_select","epic_color","ready","drawing"].includes(session.status)){setScene(sceneForSession(session));return;}setScene("human");}
  async function createSession(event:React.FormEvent){event.preventDefault();if(!humanForm.current)return;setBusy(true);setProblem("");try{const r=await fetch("/api/bebrave/session",{method:"POST",body:new FormData(humanForm.current)});const d=await r.json();if(r.status===429&&"growthFeetRemaining" in d){applyState(d);setScene("entry");return;}if(!r.ok)throw Error(d.error||"The tools could not be prepared.");applyState(d);setScene(sceneForSession(d.session));}catch(e){setProblem(e instanceof Error?e.message:"The tools could not be prepared.");}finally{setBusy(false);}}
  async function chooseTool(tool:BeBraveNormalTool){if(!session||toolChoiceBusy.current)return;toolChoiceBusy.current=true;setBusy(true);setProblem("");try{const r=await fetch("/api/bebrave/session/choose",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id,tool})});const d=await r.json();if(!r.ok)throw Error(d.error);applyState(d);setScene("reveal");}catch(e){setProblem(e instanceof Error?e.message:"That tool could not be selected.");}finally{toolChoiceBusy.current=false;setBusy(false);}}
  async function tryCache(){if(!session||!cacheCode)return;setBusy(true);setCacheMessage("The keys press down with a mechanical click.");try{const r=await fetch("/api/bebrave/session/cache",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id,code:cacheCode})});const d=await r.json();if(!d.valid){setCacheMessage("The keys press down with a mechanical click.\n\nNothing happened.");return;}applyState(d);if(d.colors)setCacheColors(d.colors);setCacheMessage("The top of the cache springs open, peeling away a layer of moss. Inside sits a small pocket knife, tied with a braided parachute-cord lanyard.\n\nThe knife flicks open with a satisfying clink.");setScene("epic-color");}catch{setCacheMessage("The keys press down with a mechanical click.\n\nNothing happened.");}finally{setBusy(false);}}
  async function chooseEpicColor(color:string){if(!session)return;setBusy(true);try{const r=await fetch("/api/bebrave/session/color",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id,color})});const d=await r.json();if(!r.ok)throw Error(d.error);applyState(d);setScene("warning");}catch(e){setProblem(e instanceof Error?e.message:"That color could not be selected.");}finally{setBusy(false);}}
  async function startDrawing(){if(!session)return;setBusy(true);setProblem("");try{const r=await fetch("/api/bebrave/session/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id})});const d=await r.json();if(!r.ok)throw Error(d.error);applyState(d);setScene("draw");}catch(e){setProblem(e instanceof Error?e.message:"The timer could not start.");}finally{setBusy(false);}}
  async function drawingFinished(payload:any, finishedStrokes:DraftStroke[]){
    applyState(payload);
    await refreshState().catch(()=>{});
    setSession(payload.session||null);
    setDraftStrokes(finishedStrokes);
    setScene("complete");
  }

  async function resetTestVisitor(){
    if(!testMode)return;
    setBusy(true);setProblem("");
    try{
      const r=await fetch("/api/bebrave/test/reset",{method:"POST"});
      const d=await r.json();
      if(!r.ok)throw Error(d.error||"The test carving limit could not reset.");
      setSession(null);setDraftStrokes([]);setGrowthRemaining(0);
      await refreshState();
      setScene("entry");
    }catch(e){
      setProblem(e instanceof Error?e.message:"The test carving limit could not reset.");
    }finally{setBusy(false);}
  }

  function impact(strong=false){const el=impactRef.current;if(!el||document.documentElement.dataset.effects==="reduced")return;const d=strong?9:2;el.animate([{transform:"translate(0,0)"},{transform:`translate(${-d}px,${d*.25}px)`},{transform:`translate(${d*.7}px,${-d*.2}px)`},{transform:"translate(0,0)"}],{duration:strong?260:120,easing:"ease-out"});}
  function firstStrike(){impact();saveTimeline({...timeline,kind:"felling",hacked:true});setScene("confirm-chop");}
  function continueChop(){let roll=timeline.additionalStrikes;if(!roll){const b=new Uint8Array(1);crypto.getRandomValues(b);roll=b[0]%4+1;}saveTimeline({...timeline,kind:"felling",hacked:true,additionalStrikes:roll,completedAdditionalStrikes:timeline.completedAdditionalStrikes});setScene("strikes");}
  async function strike(){const required=timeline.additionalStrikes||1,done=timeline.completedAdditionalStrikes+1;impact(done>=required);if(done<required){saveTimeline({...timeline,kind:"felling",hacked:true,completedAdditionalStrikes:done});return;}setBusy(true);try{const r=await fetch("/api/bebrave/snapshot",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);const now=d.serverNow||new Date().toISOString();syncSiteTimeline("felled",d.state.latestSequence,now);const next:BeBraveLocalTimeline={...timeline,kind:"felled",hacked:true,completedAdditionalStrikes:done,snapshotSequence:d.state.latestSequence,snapshotHeight:d.state.height,felledAt:now,immediateFallenSeen:true};saveTimeline(next);setTree(d.state);window.location.assign("/");}catch(e){setProblem(e instanceof Error?e.message:"The final strike could not finish.");}finally{setBusy(false);}}
  useEffect(()=>{if(scene==="fallen"&&timeline.kind==="felled"&&!timeline.immediateFallenSeen)saveTimeline({...timeline,immediateFallenSeen:true});},[scene]);

  const fallenState=useMemo(()=>timeline.snapshotHeight?{...tree,height:timeline.snapshotHeight,activeBottom:timeline.snapshotHeight,activeTop:timeline.snapshotHeight-BEBRAVE_ACTIVE_HEIGHT,latestSequence:timeline.snapshotSequence||0}:tree,[tree,timeline.snapshotHeight,timeline.snapshotSequence]);
  const marks=timeline.hacked?1+timeline.completedAdditionalStrikes:0,felled=timeline.kind==="felled";
  if(!hydrated)return <Stage testMode={testMode} testBusy={busy} onTestReset={resetTestVisitor}><Dialogue>You follow a humid path into the swamp…</Dialogue></Stage>;
  if(scene==="admire")return <div className="bebrave-stage bebrave-world-stage"><HomeControls testMode={testMode} busy={busy} onReset={resetTestVisitor}/><BeBraveTree state={tree} mode="admire"/><ActionBar><button className="button" onClick={()=>setScene("entry")}>What do you do?</button></ActionBar></div>;
  if(scene==="complete"&&session){
    const toolName=session.chosenTool==="cache"
      ?"pocket knife"
      :session.chosenTool
        ?toolCopy[session.chosenTool as BeBraveNormalTool].label.toLowerCase()
        :"tool";
    return <div className="bebrave-stage bebrave-world-stage bebrave-complete-stage">
      <HomeControls testMode={testMode} busy={busy} onReset={resetTestVisitor}/>
      <BeBraveTree state={tree} mode="admire" session={session} draftStrokes={draftStrokes}/>
      <Dialogue
        className="bebrave-post-carve"
        actions={<button className="button" onClick={()=>setScene("entry")}>Back</button>}
      >
        <p>The {toolName} got too dull to keep going. The tree wears your carving proudly.</p>
      </Dialogue>
    </div>;
  }
  if(scene==="draw"&&session)return <div className="bebrave-stage bebrave-world-stage"><HomeControls testMode={testMode} busy={busy} onReset={resetTestVisitor}/><BeBraveTree state={tree} mode="draw" session={session} serverNow={serverNow} draftStrokes={draftStrokes} onFinished={drawingFinished}/></div>;
  if(scene==="fallen"&&timeline.kind==="felled")return <div className="bebrave-stage bebrave-world-stage is-bebrave-felled"><HomeControls testMode={testMode} busy={busy} onReset={resetTestVisitor}/><BeBraveTree state={fallenState} mode="fallen" cutoff={timeline.snapshotSequence||0}/></div>;

  const dead=felled&&timeline.immediateFallenSeen,stumpView=dead||scene==="stump"||scene==="regret";
  return <Stage felled={felled} marks={marks} stump={stumpView} testMode={testMode} testBusy={busy} onTestReset={resetTestVisitor}><div ref={impactRef} className="bebrave-stage-ui">
    {scene==="entry"&&<Dialogue actions={dead?<><button className="button" onClick={()=>setScene("stump")}>Look at the stump</button><button className="button" onClick={()=>setScene("regret")}>Regret your decisions</button></>:<><button className="button" onClick={()=>setScene("base")}>Nothing</button><button className="button" onClick={admire}>Admire</button><button className="button bebrave-carve-button" disabled={busy||growthLocked||!enabled} onClick={beginCarve}>{growthLocked&&<small className="bebrave-growth-wait">{growthRemaining}′ growth before next:</small>}<span>Carve</span></button><button className="button" onClick={()=>setScene("chop")}>Chop down</button></>}>{dead?<><p>You meander into a hot Florida swamp. The smell of rot fills your lungs. Before you sits an enormous stump.</p><p>You have the distinct feeling that this is your fault.</p></>:<><p>You meander into a humid Florida swamp and are greeted by a tree, impossibly tall, reaching into the clouds. The pleasant aroma of fresh cypress tingles your nose. You notice etchings in the bark of the tree, some new; others, seemingly older, higher up and out of reach.</p><p>What do you do?</p></>}{problem&&<p role="alert">{problem}</p>}</Dialogue>}
    {scene==="base"&&<ActionBar><button className="button" onClick={()=>setScene("entry")}>Back</button></ActionBar>}
    {scene==="human"&&<OverlayScene visual={<div className="bebrave-center-modal bebrave-human-modal"><form ref={humanForm} onSubmit={createSession}><HumanCheck siteKey={siteKey} action="bebrave" resetKey={session?.id||"new"}/><button className="button" disabled={busy}>{busy?"Checking…":"Continue"}</button>{problem&&<p className="form-hint" role="alert">{problem}</p>}</form></div>} />}
    {scene==="tools"&&<OverlayScene
      visual={<div className="bebrave-tool-picker" role="group" aria-label="Choose your carving tool">{tools.map(tool=><button key={tool} type="button" className="bebrave-image-choice" disabled={busy} onPointerDown={e=>{if(e.pointerType!=="mouse"){e.preventDefault();void chooseTool(tool);}}} onClick={()=>void chooseTool(tool)} aria-label={toolCopy[tool].label}><ToolImage tool={tool}/><span className="sr-only">{toolCopy[tool].label}</span></button>)}<button type="button" className="bebrave-image-choice" onClick={()=>setScene("cache")} aria-label="Mossy cache"><ToolImage tool="cache"/><span className="sr-only">Mossy cache</span></button></div>}
    ><p>You look down at the base of the trunk and see a stone-carved arrowhead, a bent rusty nail, and brass house key laying on the ground beside a mossy cache sealed by a numeric keypad. Which do you choose?</p>{problem&&<p role="alert">{problem}</p>}</OverlayScene>}
    {scene==="reveal"&&session&&selectedNormal&&<OverlayScene
      visual={<div className="bebrave-choice-reveal" aria-live="polite">{tools.map(tool=>{const rarity=session.toolResults?.[tool]||"common",chosen=tool===selectedNormal;return <div key={tool} className={`bebrave-reveal-tool ${chosen?"is-chosen":"is-missed"} rarity-${rarity}`} aria-label={`${toolCopy[tool].label}: ${rarity}`}><ToolImage tool={tool}/><RarityEffect rarity={rarity}/><span className="sr-only">{toolCopy[tool].label}: {rarity}</span></div>})}</div>}
      actions={<button className="button" onClick={()=>setScene(sceneForSession(session))}>Continue</button>}
    ><p>{toolCopy[selectedNormal].dialogue}</p></OverlayScene>}
    {scene==="cache"&&<Dialogue actions={<><button className="button" onClick={()=>setScene("cache-code")}>Yes</button><button className="button" onClick={()=>setScene("tools")}>No</button></>}>The lockbox rattles from within as you pick it up, nearly betraying the secret it was asked to keep. Enter a code?</Dialogue>}
    {scene==="cache-code"&&<OverlayScene
      visual={<div className="bebrave-center-modal bebrave-cache-modal"><input className="bebrave-code-display" value={cacheCode} inputMode="numeric" readOnly aria-label="Entered cache code"/><div className="bebrave-keypad">{["1","2","3","4","5","6","7","8","9"].map(d=><button key={d} onClick={()=>setCacheCode(v=>(v+d).slice(0,24))}>{d}</button>)}<button onClick={()=>setCacheCode("")}>C</button><button onClick={()=>setCacheCode(v=>(v+"0").slice(0,24))}>0</button><button onClick={()=>setCacheCode(v=>v.slice(0,-1))}>⌫</button></div><button className="button" disabled={busy||!cacheCode} onClick={tryCache}>Enter</button></div>}
      actions={<button className="button" onClick={()=>{setCacheCode("");setCacheMessage("");setScene("tools");}}>Back</button>}
    >{cacheMessage||"The mechanical keypad waits."}</OverlayScene>}
    {scene==="epic-color"&&<OverlayScene
      visual={<div className="bebrave-center-modal bebrave-color-modal"><div className="bebrave-knife-art" aria-hidden="true"/><div className="bebrave-color-grid">{cacheColors.map(c=><button key={c.value} className="bebrave-color-choice" style={{"--choice-color":c.value} as CSSProperties} onClick={()=>chooseEpicColor(c.value)} aria-label={c.name}><span/></button>)}</div></div>}
    >{cacheMessage||"Choose the color that answers you."}{problem&&<p role="alert">{problem}</p>}</OverlayScene>}
    {scene==="warning"&&<Dialogue actions={<button className="button" disabled={busy} onClick={startDrawing}>Start carving</button>}><p>You’ll have 60 seconds to carve once you begin. There’s no undo, so be ready.</p>{problem&&<p role="alert">{problem}</p>}</Dialogue>}
    {scene==="chop"&&<ActionBar><button className="button" onClick={firstStrike}>Chop</button></ActionBar>}
    {scene==="confirm-chop"&&<Dialogue actions={<><button className="button" onClick={()=>{saveTimeline({...timeline,kind:"living",hacked:true,additionalStrikes:null,completedAdditionalStrikes:0,snapshotSequence:null,snapshotHeight:null,felledAt:null,immediateFallenSeen:false});setScene("entry");}}>Stop</button><button className="button" onClick={continueChop}>Continue</button></>}>You hack at the tree’s hardened trunk. This tree has been here a very long time. Continue?</Dialogue>}
    {scene==="strikes"&&<ActionBar><button className="button" disabled={busy} onClick={strike}>Chop</button></ActionBar>}
    {scene==="stump"&&<ActionBar><button className="button" onClick={()=>setScene("entry")}>Back</button></ActionBar>}
    {scene==="regret"&&null}
  </div></Stage>;
}
