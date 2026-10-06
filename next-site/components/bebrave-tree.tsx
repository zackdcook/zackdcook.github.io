"use client";

import { useCallback,useEffect,useMemo,useRef,useState,type CSSProperties } from "react";
import { BeBraveStroke,pointsToPath } from "@/components/bebrave-stroke";
import { BEBRAVE_SECTION_HEIGHT,BEBRAVE_TREE_WIDTH,type BeBravePublicDrawing,type BeBravePublicStroke,type BeBraveSessionView,type BeBraveTreeState } from "@/lib/bebrave-types";

type Mode="admire"|"draw"|"fallen"|"base";
type DraftStroke=BeBravePublicStroke;

export function BeBraveTree({state,mode,session,serverNow,draftStrokes=[],cutoff,onFinished}:{state:BeBraveTreeState;mode:Mode;session?:BeBraveSessionView|null;serverNow?:string;draftStrokes?:DraftStroke[];cutoff?:number;onFinished?:(payload:any)=>void}) {
  const scene=useRef<HTMLDivElement>(null),world=useRef<HTMLDivElement>(null),horizontal=useRef<HTMLDivElement>(null);
  const activeLine=useRef<SVGPathElement>(null),activeGlow=useRef<SVGPathElement>(null),activeShimmer=useRef<SVGPathElement>(null);
  const [scale,setScale]=useState(1),[range,setRange]=useState<[number,number]>([Math.max(0,Math.floor((state.height-1800)/BEBRAVE_SECTION_HEIGHT)),Math.floor(state.height/BEBRAVE_SECTION_HEIGHT)]);
  const rangeRef=useRef(range),stateRef=useRef(state);stateRef.current=state;
  const [drawings,setDrawings]=useState<BeBravePublicDrawing[]>([]),[saveError,setSaveError]=useState("");
  const cache=useRef(new Map<number,BeBravePublicDrawing[]>()),inflight=useRef(new Map<number,Promise<BeBravePublicDrawing[]>>());
  const worldTop=useRef(0),scaleRef=useRef(1),scrollFrame=useRef(0),ready=useRef(false),parallaxOrigin=useRef<number|null>(null);
  const [localStrokes,setLocalStrokes]=useState<DraftStroke[]>(draftStrokes),[remaining,setRemaining]=useState(60);
  const active=useRef<{strokeId:string;strokeOrder:number;points:Array<[number,number]>;sentIndex:number;chunkIndex:number}|null>(null);
  const strokeCounter=useRef(draftStrokes.reduce((m,s)=>Math.max(m,s.strokeOrder+1),0));
  const sendChain=useRef<Promise<void>>(Promise.resolve()),finishing=useRef(false),paintFrame=useRef(0),serverOffset=useRef(serverNow?Date.parse(serverNow)-Date.now():0);

  useEffect(()=>{if(serverNow)serverOffset.current=Date.parse(serverNow)-Date.now();},[serverNow]);
  useEffect(()=>{setLocalStrokes(draftStrokes);strokeCounter.current=draftStrokes.reduce((m,s)=>Math.max(m,s.strokeOrder+1),0);},[draftStrokes]);

  const maxSection=Math.max(0,Math.ceil(state.height/BEBRAVE_SECTION_HEIGHT)-1);
  const sections=useMemo(()=>Array.from({length:range[1]-range[0]+1},(_,i)=>range[0]+i),[range]);
  const load=useCallback((section:number)=>{
    if(cache.current.has(section))return Promise.resolve(cache.current.get(section)!);
    if(inflight.current.has(section))return inflight.current.get(section)!;
    const p=(async()=>{let all:BeBravePublicDrawing[]=[],before="";do{const q=new URLSearchParams({section:String(section)});if(cutoff!==undefined)q.set("cutoff",String(cutoff));if(before)q.set("before",before);const r=await fetch(`/api/bebrave/tree?${q}`,{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"Bark could not load");all.push(...d.drawings);before=d.more&&d.nextBefore?String(d.nextBefore):"";}while(before);cache.current.set(section,all);return all;})().finally(()=>inflight.current.delete(section));
    inflight.current.set(section,p);return p;
  },[cutoff]);

  useEffect(()=>{let cancelled=false;Promise.all(sections.map(load)).then(groups=>{if(cancelled)return;const map=new Map<string,BeBravePublicDrawing>();for(const d of groups.flat())map.set(d.id,d);setDrawings([...map.values()].sort((a,b)=>b.publicSequence-a.publicSequence));}).catch(()=>{if(!cancelled)setSaveError("That stretch of bark could not load.");});for(const n of [range[0]-1,range[1]+1])if(n>=0&&n<=maxSection)load(n).catch(()=>{});for(const k of cache.current.keys())if(k<range[0]-3||k>range[1]+3)cache.current.delete(k);return()=>{cancelled=true;};},[sections,load,range,maxSection]);

  useEffect(()=>{
    const el=world.current;if(!el)return;
    parallaxOrigin.current=null;
    const measure=()=>{const rect=el.getBoundingClientRect();worldTop.current=rect.top+window.scrollY;const next=mode==="fallen"&&horizontal.current?horizontal.current.clientHeight/BEBRAVE_TREE_WIDTH:Math.min(1,rect.width/BEBRAVE_TREE_WIDTH);scaleRef.current=next;setScale(next);};
    const ro=new ResizeObserver(measure);ro.observe(mode==="fallen"&&horizontal.current?horizontal.current:el);measure();
    const tick=()=>{
      scrollFrame.current=0;
      const s=stateRef.current;
      const viewport=mode==="fallen"&&horizontal.current?horizontal.current.clientWidth:window.innerHeight;
      const position=mode==="fallen"&&horizontal.current?horizontal.current.scrollLeft:window.scrollY;
      const local=mode==="fallen"&&horizontal.current?Math.max(0,s.height-horizontal.current.scrollLeft/scaleRef.current-viewport/scaleRef.current):Math.max(0,(window.scrollY-worldTop.current)/scaleRef.current);
      const center=Math.floor((local+viewport/scaleRef.current*.5)/BEBRAVE_SECTION_HEIGHT);
      const max=Math.max(0,Math.ceil(s.height/BEBRAVE_SECTION_HEIGHT)-1);
      const next:[number,number]=[Math.max(0,Math.min(max,center)-2),Math.min(max,center+2)];
      if(next[0]!==rangeRef.current[0]||next[1]!==rangeRef.current[1]){rangeRef.current=next;setRange(next);}
      if(scene.current&&document.documentElement.dataset.effects!=="reduced"){
        if(parallaxOrigin.current===null)parallaxOrigin.current=position;
        const travel=position-parallaxOrigin.current;
        scene.current.style.setProperty("--bebrave-horizon-y",`${(-travel*.055).toFixed(1)}px`);
        scene.current.style.setProperty("--bebrave-mid-y",`${(-travel*.15).toFixed(1)}px`);
      }
    };
    const target=mode==="fallen"&&horizontal.current?horizontal.current:window;
    const scroll=()=>{if(!scrollFrame.current)scrollFrame.current=requestAnimationFrame(tick);};
    target.addEventListener("scroll",scroll,{passive:true});window.addEventListener("resize",measure,{passive:true});
    let initial=0;
    if(!ready.current){
      ready.current=true;
      initial=requestAnimationFrame(()=>{
        if(mode==="fallen"&&horizontal.current){horizontal.current.scrollTo({left:0,behavior:"instant"});}
        else if(mode!=="base"){window.scrollTo({top:Math.max(0,worldTop.current+state.height*scaleRef.current-window.innerHeight*.86),behavior:"instant"});}
        parallaxOrigin.current=mode==="fallen"&&horizontal.current?horizontal.current.scrollLeft:window.scrollY;
        tick();
      });
    }
    return()=>{ro.disconnect();target.removeEventListener("scroll",scroll);window.removeEventListener("resize",measure);cancelAnimationFrame(scrollFrame.current);cancelAnimationFrame(initial);};
  },[mode,state.height]);

  const visual=useMemo(()=>({rarity:session?.chosenRarity||"common",color:session?.chosenColor||"#3B2418",seed:session?.effectSeed||0}),[session]);
  function worldPoint(clientX:number,clientY:number):[number,number]|null{const rect=world.current?.getBoundingClientRect();if(!rect||mode!=="draw"||session?.zoneTop==null||session.zoneBottom==null)return null;const x=(clientX-rect.left)/scaleRef.current,y=(clientY-rect.top)/scaleRef.current;if(x<0||x>BEBRAVE_TREE_WIDTH||y<session.zoneTop||y>session.zoneBottom)return null;return [Math.round(x*10)/10,Math.round(y*10)/10];}
  function paint(){paintFrame.current=0;const a=active.current;if(!a)return;const d=pointsToPath(a.points);activeLine.current?.setAttribute("d",d);activeGlow.current?.setAttribute("d",d);activeShimmer.current?.setAttribute("d",d);}
  function appendPoint(p:[number,number]){const a=active.current;if(!a)return;const last=a.points.at(-1);if(last&&Math.hypot(p[0]-last[0],p[1]-last[1])<1.4)return;a.points.push(p);if(!paintFrame.current)paintFrame.current=requestAnimationFrame(paint);}

  function queueChunk(a:{strokeId:string;strokeOrder:number;points:Array<[number,number]>;sentIndex:number;chunkIndex:number},force=false){
    const start=a.sentIndex===0?0:Math.max(0,a.sentIndex-1);const unsent=a.points.slice(start);if(unsent.length<2||(!force&&unsent.length<10))return;
    const chunks:Array<{index:number;points:Array<[number,number]>}>=[];let offset=0;while(offset<unsent.length-1){const part=unsent.slice(offset,Math.min(unsent.length,offset+120));if(part.length<2)break;chunks.push({index:a.chunkIndex++,points:part});offset+=part.length-1;}a.sentIndex=a.points.length;
    for(const chunk of chunks){sendChain.current=sendChain.current.then(async()=>{const r=await fetch("/api/bebrave/strokes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session!.id,strokeId:a.strokeId,strokeOrder:a.strokeOrder,chunkIndex:chunk.index,points:chunk.points})});if(!r.ok){const d=await r.json().catch(()=>({}));if(d.error!=="deadline")throw Error(d.error||"A stroke could not be saved.");}}).catch(e=>setSaveError(e instanceof Error?e.message:"A stroke could not be saved."));}
  }
  function flushActive(force=false){if(active.current)queueChunk(active.current,force);}

  useEffect(()=>{if(mode!=="draw")return;const id=setInterval(()=>flushActive(false),200);return()=>clearInterval(id);},[mode,session?.id]);

  const finish=useCallback(async()=>{if(finishing.current||!session)return;finishing.current=true;const a=active.current;if(a){queueChunk(a,true);setLocalStrokes(s=>[...s,{strokeId:a.strokeId,strokeOrder:a.strokeOrder,points:[...a.points]}]);active.current=null;}await sendChain.current;async function attempt(){const r=await fetch("/api/bebrave/session/finish",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session!.id})});const d=await r.json();if(r.status===409&&d.error==="still-active"){await new Promise(res=>setTimeout(res,180));return attempt();}if(!r.ok)throw Error(d.error||"The carving could not be finalized.");return d;}try{const d=await attempt();onFinished?.(d);}catch(e){setSaveError(e instanceof Error?e.message:"The carving could not be finalized.");finishing.current=false;}},[session,onFinished]);

  useEffect(()=>{if(mode!=="draw"||!session?.drawingDeadline)return;let ended=false;const tick=()=>{const ms=Date.parse(session.drawingDeadline!)-(Date.now()+serverOffset.current);setRemaining(Math.max(0,Math.ceil(ms/1000)));if(ms<=0&&!ended){ended=true;void finish();}};tick();const id=setInterval(tick,100);return()=>clearInterval(id);},[mode,session?.drawingDeadline,finish]);

  const localDrawing:BeBravePublicDrawing|undefined=session?.chosenRarity&&session.chosenColor?{id:"local",publicSequence:Number.MAX_SAFE_INTEGER,rarity:session.chosenRarity,color:session.chosenColor,effectSeed:session.effectSeed||0,strokes:localStrokes}:undefined;
  const widthStyle=mode==="fallen"?{width:state.height*scale,height:BEBRAVE_TREE_WIDTH*scale}:{height:state.height*scale};
  const treeTransform=mode==="fallen"?`translateX(${state.height*scale}px) rotate(90deg) scale(${scale})`:`scale(${scale})`;
  const minutes=Math.floor(remaining/60),seconds=String(remaining%60).padStart(2,"0");

  return <section ref={scene} className={`bebrave-scene is-${mode}`} style={{"--bebrave-tree-scale":scale} as CSSProperties}>
    <div className="bebrave-horizon" aria-hidden="true"><span className="bebrave-sun"/><span className="bebrave-cloud c1"/><span className="bebrave-cloud c2"/></div>
    <div className="bebrave-midground" aria-hidden="true"/>
    {mode==="draw"&&<div className="bebrave-timer" role="timer" aria-live="polite"><strong>{minutes}:{seconds}</strong><span>carving time</span></div>}
    {saveError&&<p className="bebrave-save-error" role="alert">{saveError}</p>}
    <div ref={horizontal} className={mode==="fallen"?"bebrave-fallen-scroll":"bebrave-standing-scroll"} tabIndex={mode==="fallen"?0:undefined}>
      <div ref={world} className="bebrave-world" style={widthStyle}
        onPointerDown={e=>{if(mode!=="draw"||remaining<=0||!session)return;const p=worldPoint(e.clientX,e.clientY);if(!p)return;e.currentTarget.setPointerCapture(e.pointerId);const a={strokeId:crypto.randomUUID(),strokeOrder:strokeCounter.current++,points:[p],sentIndex:0,chunkIndex:0};active.current=a;paint();e.preventDefault();}}
        onPointerMove={e=>{if(!active.current||mode!=="draw"||remaining<=0)return;const p=worldPoint(e.clientX,e.clientY);if(p)appendPoint(p);}}
        onPointerUp={e=>{const a=active.current;if(!a)return;const p=worldPoint(e.clientX,e.clientY);if(p)appendPoint(p);queueChunk(a,true);setLocalStrokes(s=>[...s,{strokeId:a.strokeId,strokeOrder:a.strokeOrder,points:[...a.points]}]);active.current=null;activeLine.current?.setAttribute("d","");activeGlow.current?.setAttribute("d","");activeShimmer.current?.setAttribute("d","");}}
        onPointerCancel={()=>{const a=active.current;if(!a)return;queueChunk(a,true);setLocalStrokes(s=>[...s,{strokeId:a.strokeId,strokeOrder:a.strokeOrder,points:[...a.points]}]);active.current=null;}}>
        <div className="bebrave-tree-space" style={{width:BEBRAVE_TREE_WIDTH,height:state.height,transform:treeTransform}}>
          <div className="bebrave-trunk" aria-hidden="true"/>
          {mode==="draw"&&session?.zoneTop!=null&&session.zoneBottom!=null&&<div className="bebrave-active-zone" style={{top:session.zoneTop,height:session.zoneBottom-session.zoneTop}} aria-hidden="true"/>}
          <svg className="bebrave-drawings" viewBox={`0 0 ${BEBRAVE_TREE_WIDTH} ${state.height}`} aria-label="Drawings carved into the shared cypress tree">
            {/* New work is painted first. Older public sessions are appended later, so the first person to mark a spot always stays visually on top. */}
            {localDrawing&&<g className="bebrave-local-drawing">{localDrawing.strokes.map(st=><BeBraveStroke key={st.strokeId} stroke={st} color={localDrawing.color} rarity={localDrawing.rarity} seed={localDrawing.effectSeed}/>)}</g>}
            {mode==="draw"&&session?.chosenColor&&session.chosenRarity&&<g className={`bebrave-stroke bebrave-${visual.rarity} is-active`}>
              {(visual.rarity==="superior"||visual.rarity==="epic")&&<path ref={activeGlow} className="bebrave-stroke-glow" stroke={visual.color}/>}
              <path ref={activeLine} className="bebrave-stroke-line" stroke={visual.color}/>
              {visual.rarity==="epic"&&<path ref={activeShimmer} className="bebrave-epic-shimmer" stroke={visual.color}/>}
            </g>}
            {drawings.map(d=><g key={d.id} data-sequence={d.publicSequence}>{d.strokes.map(st=><BeBraveStroke key={st.strokeId} stroke={st} color={d.color} rarity={d.rarity} seed={d.effectSeed}/>)}</g>)}
          </svg>
          {mode==="fallen"&&<div className="bebrave-fallen-cut" aria-hidden="true"/>}
        </div>
      </div>
    </div>
    {mode==="draw"&&<p className="bebrave-draw-hint">Draw directly on the highlighted five-foot band. There is no undo.</p>}
  </section>;
}
