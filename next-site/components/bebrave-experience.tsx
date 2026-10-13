"use client";

import { useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties } from "react";
import { HumanCheck } from "@/components/human-check";
import { BeBraveTree } from "@/components/bebrave-tree";
import { TreeAtmosphere } from "@/components/tree-atmosphere";
import { ActionBar, Dialogue, HomeControls, OverlayScene } from "./bebrave-menu";
import { ToolEncounter, ToolImage } from "./bebrave-tool-encounter";
import { BeBraveCypress } from "./bebrave-cypress";
import { usePreferences } from "./site-preferences";
import { observeBeBraveBrowser } from "@/lib/bebrave/browser-metrics";
import { afterReveal, resumedScene, toolCopy } from "@/lib/bebrave/presentation";
import { BEBRAVE_EPIC_COLORS } from "@/lib/bebrave-config";
import { treeHistory,initialHistoryWindow } from "@/lib/bebrave/history-cache";
import { BEBRAVE_ACTIVE_HEIGHT,defaultBeBraveTimeline,fallbackBeBraveTreeState,type BeBraveLocalTimeline,type BeBraveNormalTool,type BeBraveRarity,type BeBraveSessionView,type BeBraveTreeState } from "@/lib/bebrave-types";

const timelineKey="zack.bebrave.timeline.v1";
const siteTimelineKey="zack.timeline.v1";
type Scene="entry"|"base"|"admire"|"complete"|"human"|"tools"|"cache"|"cache-code"|"epic-color"|"reveal"|"warning"|"draw"|"chop"|"confirm-chop"|"strikes"|"fallen"|"stump"|"regret";
type DraftStroke={strokeId:string;strokeOrder:number;points:Array<[number,number]>};

function normalizeTimeline(value:unknown):BeBraveLocalTimeline{
  const v=value&&typeof value==="object"?value as Record<string,unknown>:{};
  const kind=v.kind==="felling"||v.kind==="felled"?v.kind:"living";
  const roll=typeof v.additionalStrikes==="number"&&Number.isInteger(v.additionalStrikes)&&v.additionalStrikes>=1&&v.additionalStrikes<=4?v.additionalStrikes:null;
  const completed=typeof v.completedAdditionalStrikes==="number"&&Number.isInteger(v.completedAdditionalStrikes)?Math.max(0,Math.min(roll||0,v.completedAdditionalStrikes)):0;
  const seq=typeof v.snapshotSequence==="number"&&Number.isSafeInteger(v.snapshotSequence)&&v.snapshotSequence>=0?v.snapshotSequence:null;
  const height=typeof v.snapshotHeight==="number"&&Number.isSafeInteger(v.snapshotHeight)&&v.snapshotHeight>=BEBRAVE_ACTIVE_HEIGHT?v.snapshotHeight:null;
  return {kind:kind==="felled"&&seq!==null&&height!==null?"felled":kind==="felling"?"felling":"living",hacked:v.hacked===true,additionalStrikes:roll,completedAdditionalStrikes:completed,snapshotSequence:seq,snapshotHeight:height,felledAt:typeof v.felledAt==="string"?v.felledAt:null,immediateFallenSeen:v.immediateFallenSeen===true};
}
function Stage({children,felled=false,marks=0,stump=false,homeControls,scene="entry",impactRef,falling=false}:{children:React.ReactNode;felled?:boolean;marks?:number;stump?:boolean;homeControls?:React.ReactNode;scene?:string;impactRef?:React.RefObject<HTMLDivElement|null>;falling?:boolean}){
  return <div data-bebrave-scene={scene} className={`bebrave-stage ${falling?"is-falling":""} ${felled?"is-bebrave-felled":""} ${stump?"is-bebrave-stump":""}`}>{homeControls||<HomeControls/>}<div className="bebrave-stage-art" data-light-source aria-hidden="true"><div className="bebrave-stage-bg"/>{!stump&&<BeBraveCypress marks={marks} impactRef={impactRef}/>}{stump&&<div className="bebrave-stage-stump"/>}<div className="bebrave-stage-mid"/><TreeAtmosphere/></div>{children}</div>;
}
export function BeBraveExperience({enabled,siteKey,testMode=false}:{enabled:boolean;siteKey:string;testMode?:boolean}){
  const { reduced } = usePreferences();
  useEffect(()=>testMode?observeBeBraveBrowser():undefined,[testMode]);
  const [highlightedTool,setHighlightedTool]=useState<BeBraveNormalTool|"cache"|null>(null),[revealSettled,setRevealSettled]=useState(false),[falling,setFalling]=useState(false),[freshlyFelled,setFreshlyFelled]=useState(false);
  const strikeBusy=useRef(false);
  const cacheBusy=useRef(false),colorBusy=useRef(false),startBusy=useRef(false),createBusy=useRef(false);
  const [scene,setScene]=useState<Scene>("entry"),[tree,setTree]=useState<BeBraveTreeState>(fallbackBeBraveTreeState),[session,setSession]=useState<BeBraveSessionView|null>(null),[draftStrokes,setDraftStrokes]=useState<DraftStroke[]>([]);
  const [growthRemaining,setGrowthRemaining]=useState(0),[serverNow,setServerNow]=useState(new Date().toISOString()),[problem,setProblem]=useState(""),[busy,setBusy]=useState(false),[cacheMessage,setCacheMessage]=useState(""),[cacheCode,setCacheCode]=useState(""),[cacheColors,setCacheColors]=useState(BEBRAVE_EPIC_COLORS),[timeline,setTimelineState]=useState<BeBraveLocalTimeline>(defaultBeBraveTimeline),[hydrated,setHydrated]=useState(false);
  const humanForm=useRef<HTMLFormElement>(null),impactRef=useRef<HTMLDivElement>(null),priorSiteTimeline=useRef("living"),toolChoiceBusy=useRef(false);
  useEffect(()=>{
    if(!testMode)return;
    if(session)document.documentElement.dataset.bebraveSession=JSON.stringify({id:session.id,status:session.status,rarity:session.chosenRarity,color:session.chosenColor,effectId:session.chosenEffect,seed:session.effectSeed,deadline:session.drawingDeadline});
    else delete document.documentElement.dataset.bebraveSession;
    return()=>{delete document.documentElement.dataset.bebraveSession;};
  },[session,testMode]);
  const selectedNormal=session?.chosenTool&&session.chosenTool!=="cache"?session.chosenTool as BeBraveNormalTool:null;
  useEffect(()=>{
    if(scene!=="reveal"){setRevealSettled(false);return;}
    if(reduced){setRevealSettled(true);return;}
    const timer=setTimeout(()=>setRevealSettled(true),950);
    return()=>clearTimeout(timer);
  },[scene,reduced,session?.id]);
  useEffect(()=>{
    if(["draw","admire","fallen"].includes(scene))return;
    const frame=requestAnimationFrame(()=>document.querySelector<HTMLElement>(".bebrave-stage [data-menu-focus], .bebrave-stage input, .bebrave-stage .bebrave-rpg-actions button:not(:disabled)")?.focus({preventScroll:true}));
    return()=>cancelAnimationFrame(frame);
  },[scene]);

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
  useEffect(()=>{
    if(!hydrated||tree.latestSequence===0)return;
    const cache=treeHistory(tree),[first,last]=initialHistoryWindow(tree.height,window.innerHeight,Math.min(window.innerWidth*.6,570)/720);
    cache.setWindow(first,last);void cache.load(first,last).catch(()=>{});
  },[hydrated,tree.latestSequence,tree.height]);
  const sceneForSession=resumedScene;
  function admire(){ setProblem(""); setScene("admire"); }
  async function beginCarve(){if(growthLocked)return;setProblem("");if(session&&["tool_select","epic_color","ready","drawing"].includes(session.status)){setScene(sceneForSession(session));return;}setHighlightedTool(null);if(testMode){await prepareSession(new FormData());return;}setScene("human");}
  async function createSession(event:React.FormEvent){event.preventDefault();if(humanForm.current)await prepareSession(new FormData(humanForm.current));}
  async function prepareSession(form:FormData){if(createBusy.current)return;createBusy.current=true;setBusy(true);setProblem("");try{const r=await fetch("/api/bebrave/session",{method:"POST",body:form});const d=await r.json();if(r.status===429&&"growthFeetRemaining" in d){applyState(d);setScene("entry");return;}if(!r.ok)throw Error(d.error||"The tools could not be prepared.");applyState(d);setScene(sceneForSession(d.session));}catch(e){setProblem(e instanceof Error?e.message:"The tools could not be prepared.");}finally{createBusy.current=false;setBusy(false);}}
  async function chooseTool(tool:BeBraveNormalTool){if(!session||toolChoiceBusy.current)return;if(session.chosenTool){setScene("reveal");return;}toolChoiceBusy.current=true;setBusy(true);setProblem("");try{const r=await fetch("/api/bebrave/session/choose",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id,tool})});const d=await r.json();if(!r.ok)throw Error(d.error);applyState(d);setScene("reveal");}catch(e){setProblem(e instanceof Error?e.message:"That tool could not be selected.");}finally{toolChoiceBusy.current=false;setBusy(false);}}
  async function tryCache(){if(!session||!cacheCode||cacheBusy.current)return;if(session.chosenTool){setScene("reveal");return;}cacheBusy.current=true;setBusy(true);setCacheMessage("The keys press down with a mechanical click.");try{const r=await fetch("/api/bebrave/session/cache",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id,code:cacheCode})});const d=await r.json();if(!r.ok||!d.valid){setCacheMessage("The keys press down with a mechanical click.\n\nNothing happened.");return;}applyState(d);if(d.colors)setCacheColors(d.colors);setCacheMessage("The top of the cache springs open, peeling away a layer of moss. Inside sits a small pocket knife, tied with a braided parachute-cord lanyard.\n\nThe knife flicks open with a satisfying clink.");setScene("reveal");}catch{setCacheMessage("The keys press down with a mechanical click.\n\nNothing happened.");}finally{cacheBusy.current=false;setBusy(false);}}
  async function chooseEpicColor(color:string){if(!session||colorBusy.current)return;colorBusy.current=true;setBusy(true);try{const r=await fetch("/api/bebrave/session/color",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id,color})});const d=await r.json();if(!r.ok)throw Error(d.error);applyState(d);setScene("warning");}catch(e){setProblem(e instanceof Error?e.message:"That color could not be selected.");}finally{colorBusy.current=false;setBusy(false);}}
  async function startDrawing(){if(!session||startBusy.current)return;startBusy.current=true;setBusy(true);setProblem("");try{const r=await fetch("/api/bebrave/session/start",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session.id})});const d=await r.json();if(!r.ok)throw Error(d.error);applyState(d);setScene("draw");}catch(e){setProblem(e instanceof Error?e.message:"The timer could not start.");}finally{startBusy.current=false;setBusy(false);}}
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
      setSession(null);setDraftStrokes([]);setHighlightedTool(null);setGrowthRemaining(0);
      await refreshState();setScene("entry");
    }catch(e){setProblem(e instanceof Error?e.message:"The test carving limit could not reset.");}
    finally{setBusy(false);}
  }
  const homeControls=<HomeControls testMode={testMode} drawing={scene==="draw"} busy={busy||scene==="draw"||falling} onReset={resetTestVisitor} onResetTimeline={()=>{
    saveTimeline(defaultBeBraveTimeline);syncSiteTimeline("living");setFreshlyFelled(false);setScene("entry");
  }}/>;

  function impact(strong=false){const el=impactRef.current;if(!el||reduced)return;const d=strong?9:2;return el.animate([{transform:"translate(0,0)"},{transform:`translate(${-d}px,${d*.25}px)`},{transform:`translate(${d*.7}px,${-d*.2}px)`},{transform:"translate(0,0)"}],{duration:strong?260:120,easing:"ease-out"});}
  async function firstStrike(){if(strikeBusy.current)return;strikeBusy.current=true;setBusy(true);const hit=impact();saveTimeline({...timeline,kind:"felling",hacked:true});setScene("confirm-chop");try{await hit?.finished.catch(()=>{});}finally{strikeBusy.current=false;setBusy(false);}}
  function continueChop(){if(strikeBusy.current)return;let roll=timeline.additionalStrikes;if(!roll){const b=new Uint8Array(1);crypto.getRandomValues(b);roll=b[0]%4+1;}saveTimeline({...timeline,kind:"felling",hacked:true,additionalStrikes:roll,completedAdditionalStrikes:timeline.completedAdditionalStrikes});setScene("strikes");}
  async function strike(){if(strikeBusy.current)return;strikeBusy.current=true;setBusy(true);const required=timeline.additionalStrikes||1,done=timeline.completedAdditionalStrikes+1;try{const hit=impact(done>=required);if(done<required){saveTimeline({...timeline,kind:"felling",hacked:true,completedAdditionalStrikes:done});await hit?.finished.catch(()=>{});return;}await hit?.finished.catch(()=>{});const r=await fetch("/api/bebrave/snapshot",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);const now=d.serverNow||new Date().toISOString();setFalling(true);
      if(!reduced)await new Promise(resolve=>setTimeout(resolve,1100));
      syncSiteTimeline("felled",d.state.latestSequence,now);const next:BeBraveLocalTimeline={...timeline,kind:"felled",hacked:true,completedAdditionalStrikes:done,snapshotSequence:d.state.latestSequence,snapshotHeight:d.state.height,felledAt:now,immediateFallenSeen:true};saveTimeline(next);setTree(d.state);setFreshlyFelled(true);setScene("entry");}catch(e){setProblem(e instanceof Error?e.message:"The final strike could not finish.");}finally{strikeBusy.current=false;setFalling(false);setBusy(false);}}
  useEffect(()=>{if(scene==="fallen"&&timeline.kind==="felled"&&!timeline.immediateFallenSeen)saveTimeline({...timeline,immediateFallenSeen:true});},[scene]);

  const fallenState=useMemo(()=>timeline.snapshotHeight?{...tree,height:timeline.snapshotHeight,activeBottom:timeline.snapshotHeight,activeTop:timeline.snapshotHeight-BEBRAVE_ACTIVE_HEIGHT,latestSequence:timeline.snapshotSequence||0}:tree,[tree,timeline.snapshotHeight,timeline.snapshotSequence]);
  const marks=timeline.hacked?1+timeline.completedAdditionalStrikes+(falling?1:0):0,felled=timeline.kind==="felled";
  if(!hydrated)return <Stage homeControls={homeControls}><Dialogue>You follow a humid path into the swamp…</Dialogue></Stage>;
  if(scene==="admire")return <div data-bebrave-scene={scene} className="bebrave-stage bebrave-world-stage"><BeBraveTree state={tree} mode="admire" homeControls={homeControls} admireActions={<button className="button bebrave-back-button" onClick={()=>setScene("entry")}>Back</button>}/></div>;
  if(scene==="complete"&&session){
    const toolName=session.chosenTool==="cache"
      ?"pocket knife"
      :session.chosenTool
        ?toolCopy[session.chosenTool as BeBraveNormalTool].label.toLowerCase()
        :"tool";
    return <div data-bebrave-scene="complete" className="bebrave-stage bebrave-world-stage bebrave-complete-stage">
      <BeBraveTree key={`complete-${session.id}`} state={tree} mode="admire" session={session} draftStrokes={draftStrokes} homeControls={homeControls}
        admireActions={<div className="bebrave-completion"><p role="status">{session.status==="empty"?"No mark was left.":<>The {toolName} got too dull to keep going. The tree wears your carving proudly.</>}</p><button className="button" onClick={()=>setScene("entry")}>Back</button></div>}/>
    </div>;
  }
  if(scene==="draw"&&session)return <div data-bebrave-scene={scene} className="bebrave-stage bebrave-world-stage"><BeBraveTree state={tree} mode="draw" session={session} serverNow={serverNow} draftStrokes={draftStrokes} onFinished={drawingFinished} homeControls={homeControls}/></div>;
  if(scene==="fallen"&&timeline.kind==="felled")return <div className="bebrave-stage bebrave-world-stage is-bebrave-felled">{homeControls}<BeBraveTree state={fallenState} mode="fallen" cutoff={timeline.snapshotSequence||0}/><ActionBar><button className="button" onClick={()=>{setFreshlyFelled(false);setScene("entry");}}>Back</button></ActionBar></div>;

  const dead=felled,stumpView=dead||scene==="stump"||scene==="regret";
  return <Stage homeControls={homeControls} scene={scene} felled={felled} marks={marks} stump={stumpView} impactRef={impactRef} falling={falling}><div className="bebrave-stage-ui">
    {scene==="entry"&&<Dialogue actions={dead?<>{freshlyFelled&&<button className="button" onClick={()=>setScene("fallen")}>Admire</button>}<button className="button" onClick={()=>setScene("stump")}>Look at the stump</button><button className="button" onClick={()=>setScene("regret")}>Regret your decisions</button></>:<><button className="button bebrave-carve-button" disabled={busy||growthLocked||!enabled} onClick={beginCarve}>{growthLocked&&<small className="bebrave-growth-wait">{growthRemaining}′ growth before next:</small>}<span>Carve something new</span></button><button className="button" onClick={admire}>Admire old carvings</button><button className="button" onClick={()=>setScene("chop")}>Chop that bitch down</button><a className="button" href="/">Leave</a></>}>{dead?<p>You meander into a hot Florida swamp. The smell of rot fills your lungs. Before you sits an enormous stump.</p>:<><p>You meander into a humid Florida swamp and are greeted by a tree, impossibly tall, reaching into the clouds. The pleasant aroma of fresh cypress tingles your nose. You notice etchings in the bark of the tree, some new; others, seemingly older, higher up and out of reach.</p><p>What do you do?</p></>}{problem&&<p role="alert">{problem}</p>}</Dialogue>}
    {scene==="base"&&<ActionBar><button className="button" onClick={()=>setScene("entry")}>Back</button></ActionBar>}
    {scene==="human"&&<OverlayScene visual={<div className="bebrave-center-modal bebrave-human-modal"><form ref={humanForm} onSubmit={createSession}>{!testMode&&<HumanCheck siteKey={siteKey} action="bebrave" resetKey={session?.id||"new"}/>}<button className="button" disabled={busy} data-menu-focus>{busy?"Checking…":"Continue"}</button><button type="button" className="button" disabled={busy} onClick={()=>setScene("entry")}>Back</button>{problem&&<p className="form-hint" role="alert">{problem}</p>}</form></div>} />}
    {scene==="tools"&&<OverlayScene
      visual={<ToolEncounter session={session} selected={highlightedTool} busy={busy} onHighlight={setHighlightedTool} onChoose={tool=>{setHighlightedTool(tool);if(tool==="cache")setScene("cache");else void chooseTool(tool);}}/>}
      actions={<button className="button" onClick={()=>setScene("entry")} disabled={busy}>Back</button>}
    ><p hidden={Boolean(highlightedTool)}>You look down at the base of the trunk and see a stone-carved arrowhead, a bent rusty nail, and brass house key laying on the ground beside a mossy cache sealed by a numeric keypad. Which do you choose?</p>{highlightedTool&&<p>{highlightedTool!=="cache"?toolCopy[highlightedTool].dialogue:"The lockbox rattles from within as you pick it up, nearly betraying the secret it was asked to keep."}</p>}{problem&&<p role="alert">{problem}</p>}</OverlayScene>}
    {scene==="reveal"&&session&&<OverlayScene
      visual={<ToolEncounter session={session} reveal/>}
      actions={<button className="button" disabled={!revealSettled||busy} onClick={()=>setScene(afterReveal(session))}>Continue</button>}
    ><p>{selectedNormal?toolCopy[selectedNormal].dialogue:cacheMessage||"The knife flicks open with a satisfying clink."}</p></OverlayScene>}
    {scene==="cache"&&<Dialogue actions={<><button className="button" onClick={()=>setScene("cache-code")}>Yes</button><button className="button" onClick={()=>setScene("tools")}>No</button></>}>The lockbox rattles from within as you pick it up, nearly betraying the secret it was asked to keep. Enter a code?</Dialogue>}
    {scene==="cache-code"&&<OverlayScene
      visual={<div className="bebrave-center-modal bebrave-cache-modal bebrave-menu-panel"><ToolImage tool="cache"/><input className="bebrave-code-display" value={cacheCode} inputMode="text" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={24} onChange={e=>setCacheCode(e.target.value.replace(/[^a-z0-9]/gi," ").replace(/ /g,"").toUpperCase())} onKeyDown={e=>{if(e.key==="Enter"&&!busy){e.preventDefault();void tryCache();}}} aria-label="Entered cache code"/><div className="bebrave-keypad">{["1","2","3","4","5","6","7","8","9"].map(d=><button key={d} onClick={()=>setCacheCode(v=>(v+d).slice(0,24))}>{d}</button>)}<button onClick={()=>setCacheCode("")}>C</button><button onClick={()=>setCacheCode(v=>(v+"0").slice(0,24))}>0</button><button onClick={()=>setCacheCode(v=>v.slice(0,-1))}>⌫</button></div><button className="button" disabled={busy||!cacheCode} onClick={tryCache}>Enter</button></div>}
      actions={<button className="button" disabled={busy} onClick={()=>{setCacheCode("");setCacheMessage("");setScene("tools");}}>Back</button>}
    >{cacheMessage||"The mechanical keypad waits."}</OverlayScene>}
    {scene==="epic-color"&&<OverlayScene
      actions={<button className="button" disabled={busy} onClick={()=>setScene("entry")}>Back</button>}
      visual={<div className="bebrave-center-modal bebrave-color-modal bebrave-menu-panel"><div className={`bebrave-color-emblem rarity-${session?.chosenRarity}`}>{session?.chosenTool==="cache"&&<span className="bebrave-color-cache"><ToolImage tool="cache-open"/></span>}<ToolImage tool={session?.chosenTool==="cache"?"knife":session?.chosenTool||"knife"}/><span className="bebrave-rarity-name">{session?.chosenRarity}</span></div><div className="bebrave-color-grid">{(session?.chosenEffect==="blood-v1"?[{name:"Crimson",value:"#C51D36"}]:cacheColors).map(c=><button key={c.value} className="bebrave-color-choice" disabled={busy} style={{"--choice-color":c.value} as CSSProperties} onClick={()=>chooseEpicColor(c.value)} aria-label={c.name}><span/><small>{c.name}</small></button>)}</div></div>}
    >{cacheMessage||"Choose the color that answers you."}{problem&&<p role="alert">{problem}</p>}</OverlayScene>}
    {scene==="warning"&&<Dialogue actions={<><button className="button" disabled={busy} onClick={()=>setScene("entry")}>Back</button><button className="button" disabled={busy} onClick={startDrawing}>Start carving</button></>}><p>You’ll have 60 seconds to carve once you begin. There’s no undo, so be ready.</p>{problem&&<p role="alert">{problem}</p>}</Dialogue>}
    {scene==="chop"&&<ActionBar><button className="button" onClick={firstStrike}>Chop</button></ActionBar>}
    {scene==="confirm-chop"&&<Dialogue actions={<><button className="button" disabled={busy} onClick={()=>{saveTimeline({...timeline,kind:"living",hacked:true,additionalStrikes:null,completedAdditionalStrikes:0,snapshotSequence:null,snapshotHeight:null,felledAt:null,immediateFallenSeen:false});setScene("entry");}}>Stop</button><button className="button" disabled={busy} onClick={continueChop}>Continue</button></>}>You hack at the tree’s hardened trunk. This tree has been here a very long time. Continue?</Dialogue>}
    {scene==="strikes"&&<ActionBar><button className="button" disabled={busy} onClick={strike}>Chop</button></ActionBar>}
    {scene==="stump"&&<ActionBar><button className="button" onClick={()=>{setFreshlyFelled(false);setScene("entry");}}>Back</button></ActionBar>}
    {scene==="regret"&&<Dialogue actions={<button className="button" onClick={()=>{setFreshlyFelled(false);setScene("entry");}}>Back</button>}><p>You have the distinct feeling that this is your fault.</p></Dialogue>}
  </div></Stage>;
}
