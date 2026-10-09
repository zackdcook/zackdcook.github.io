"use client";

import { useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type ReactNode } from "react";
import { legendaryEffect } from "@/lib/bebrave/effects";
import { SectionCache } from "@/lib/bebrave/section-cache";
import { unpackDrawing } from "@/lib/bebrave/completed-strokes";
import { BeBraveStroke,pointsToPath } from "@/components/bebrave-stroke";
import { TreeAtmosphere } from "@/components/tree-atmosphere";
import { BEBRAVE_SECTION_HEIGHT,BEBRAVE_TREE_WIDTH,type BeBravePublicDrawing,type BeBravePublicStroke,type BeBraveSessionView,type BeBraveTreeState } from "@/lib/bebrave-types";

type Mode="admire"|"draw"|"fallen"|"base";
type DraftStroke=BeBravePublicStroke;

export function BeBraveTree({state,mode,session,serverNow,draftStrokes=[],cutoff,onFinished,homeControls,admireActions}:{state:BeBraveTreeState;mode:Mode;session?:BeBraveSessionView|null;serverNow?:string;draftStrokes?:DraftStroke[];cutoff?:number;onFinished?:(payload:any,strokes:DraftStroke[])=>void;homeControls?:ReactNode;admireActions?:ReactNode}) {
  const scene=useRef<HTMLDivElement>(null),world=useRef<HTMLDivElement>(null),horizontal=useRef<HTMLDivElement>(null);
  const activeLine=useRef<SVGPathElement>(null),activeGlow=useRef<SVGPathElement>(null),activeShimmer=useRef<SVGPathElement>(null),activeGleam=useRef<SVGGElement>(null);
  const [scale,setScale]=useState(1),[zoom,setZoom]=useState(mode==="admire"?.82:1),[range,setRange]=useState<[number,number]>([Math.max(0,Math.floor((state.height-1800)/BEBRAVE_SECTION_HEIGHT)),Math.floor(state.height/BEBRAVE_SECTION_HEIGHT)]);
  const rangeRef=useRef(range),stateRef=useRef(state);stateRef.current=state;
  const [drawings,setDrawings]=useState<BeBravePublicDrawing[]>([]),[saveError,setSaveError]=useState("");
  const worldTop=useRef(0),scaleRef=useRef(1),scrollFrame=useRef(0),ready=useRef(false),parallaxOrigin=useRef<number|null>(null),zoomAnchor=useRef<number|null>(null),zoomRef=useRef(zoom);
  zoomRef.current=zoom;
  const [localStrokes,setLocalStrokes]=useState<DraftStroke[]>(draftStrokes),[remaining,setRemaining]=useState(60),[finishBusy,setFinishBusy]=useState(false);
  const strokesRef=useRef<DraftStroke[]>(draftStrokes);
  const active=useRef<{pointerId:number;strokeId:string;strokeOrder:number;points:Array<[number,number]>;sentIndex:number;chunkIndex:number}|null>(null);
  const strokeCounter=useRef(draftStrokes.reduce((m,s)=>Math.max(m,s.strokeOrder+1),0));
  const sendChain=useRef<Promise<void>>(Promise.resolve()),finishing=useRef(false),paintFrame=useRef(0),serverOffset=useRef(serverNow?Date.parse(serverNow)-Date.now():0);

  useEffect(()=>{if(serverNow)serverOffset.current=Date.parse(serverNow)-Date.now();},[serverNow]);
  useEffect(()=>{strokesRef.current=draftStrokes;setLocalStrokes(draftStrokes);strokeCounter.current=draftStrokes.reduce((m,s)=>Math.max(m,s.strokeOrder+1),0);},[draftStrokes]);

  const maxSection=Math.max(0,Math.ceil(state.height/BEBRAVE_SECTION_HEIGHT)-1);
  const sections=useMemo(()=>Array.from({length:range[1]-range[0]+1},(_,i)=>range[0]+i),[range]);
  const sectionCache=useMemo(()=>new SectionCache<BeBravePublicDrawing[]>(async(section,signal)=>{
    const all:BeBravePublicDrawing[]=[];
    let before="";
    do {
      const q=new URLSearchParams({section:String(section),format:"compact-v1",revision:String(state.revision),cutoff:String(cutoff??state.latestSequence)});
      if(before)q.set("before",before);
      const response=await fetch(`/api/bebrave/tree?${q}`,{signal});
      const data=await response.json();
      if(!response.ok)throw Error(data.error||"Bark could not load");
      all.push(...data.drawings.map(unpackDrawing));
      const next=data.more&&data.nextBefore?String(data.nextBefore):"";
      if(next&&before&&Number(next)>=Number(before))throw Error("Bark could not load");
      before=next;
    } while(before&&!signal.aborted);
    return all;
  }),[state.revision,state.latestSequence,cutoff]);
  useEffect(()=>()=>sectionCache.dispose(),[sectionCache]);
  useEffect(()=>{
    let cancelled=false;
    sectionCache.setWindow(range[0],range[1]);
    Promise.all(sections.map(n=>sectionCache.load(n))).then(groups=>{
      if(cancelled)return;
      const map=new Map<string,BeBravePublicDrawing>();
      for(const drawing of groups.flat())map.set(drawing.id,drawing);
      setDrawings([...map.values()].sort((a,b)=>b.publicSequence-a.publicSequence));
    }).catch(()=>{if(!cancelled)setSaveError("That stretch of bark could not load.");});
    for(const n of [range[0]-1,range[1]+1])if(n>=0&&n<=maxSection)sectionCache.load(n).catch(()=>{});
    return()=>{cancelled=true;};
  },[sectionCache,sections,range,maxSection]);

  useLayoutEffect(()=>{
    const el=world.current;if(!el)return;
    parallaxOrigin.current=null;
    const measure=()=>{const rect=el.getBoundingClientRect();worldTop.current=rect.top+window.scrollY;const next=mode==="fallen"&&horizontal.current?horizontal.current.clientHeight/BEBRAVE_TREE_WIDTH:rect.width/BEBRAVE_TREE_WIDTH;scaleRef.current=next;setScale(next);};
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
        const travel=(position-parallaxOrigin.current)*(mode==="admire"?zoomRef.current:1);
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
        else if(mode!=="base"){window.scrollTo({top:Math.max(0,worldTop.current+state.height*scaleRef.current-window.innerHeight),behavior:"instant"});}
        parallaxOrigin.current=mode==="fallen"&&horizontal.current?horizontal.current.scrollLeft:window.scrollY;
        tick();
      });
    }
    return()=>{ro.disconnect();target.removeEventListener("scroll",scroll);window.removeEventListener("resize",measure);cancelAnimationFrame(scrollFrame.current);cancelAnimationFrame(initial);};
  },[mode,state.height]);

  function adjustZoom(next:number){
    if(mode!=="admire")return;
    const value=Math.max(.65,Math.min(1.45,Math.round(next*100)/100));
    if(value===zoom)return;
    zoomAnchor.current=Math.max(0,(window.scrollY+window.innerHeight/2-worldTop.current)/scaleRef.current);
    setZoom(value);
  }
  useLayoutEffect(()=>{
    if(mode!=="admire"||zoomAnchor.current===null)return;
    const targetScale=(horizontal.current?.clientWidth || window.innerWidth)*.9*zoom/BEBRAVE_TREE_WIDTH;
    if(Math.abs(scale-targetScale)>.03)return;
    const anchor=zoomAnchor.current;
    zoomAnchor.current=null;
    window.scrollTo({top:Math.max(0,worldTop.current+anchor*scale-window.innerHeight/2),behavior:"instant"});
  },[scale,zoom,mode]);

  const visual=useMemo(()=>({rarity:session?.chosenRarity||"common",color:session?.chosenColor||"#3B2418",seed:session?.effectSeed||0}),[session]);
  function worldPoint(clientX:number,clientY:number):[number,number]|null{const rect=world.current?.getBoundingClientRect();if(!rect||mode!=="draw"||session?.zoneTop==null||session.zoneBottom==null)return null;const x=(clientX-rect.left)/scaleRef.current,y=(clientY-rect.top)/scaleRef.current;if(x<0||x>BEBRAVE_TREE_WIDTH||y<session.zoneTop||y>session.zoneBottom)return null;return [Math.round(x*10)/10,Math.round(y*10)/10];}
  function paint(){paintFrame.current=0;const a=active.current;if(!a)return;const d=pointsToPath(a.points);activeLine.current?.setAttribute("d",d);activeGlow.current?.setAttribute("d",d);activeShimmer.current?.setAttribute("d",d);const tip=a.points.at(-1);if(tip){activeGleam.current?.setAttribute("transform",`translate(${tip[0]} ${tip[1]})`);activeGleam.current?.setAttribute("visibility","visible");}}
  function appendPoint(p:[number,number]){const a=active.current;if(!a)return;const last=a.points.at(-1);if(last&&Math.hypot(p[0]-last[0],p[1]-last[1])<1.4)return;a.points.push(p);if(!paintFrame.current)paintFrame.current=requestAnimationFrame(paint);}

  function queueChunk(a:{pointerId:number;strokeId:string;strokeOrder:number;points:Array<[number,number]>;sentIndex:number;chunkIndex:number},force=false){
    const start=a.sentIndex===0?0:Math.max(0,a.sentIndex-1);const unsent=a.points.slice(start);if(unsent.length<2||(!force&&unsent.length<10))return;
    const chunks:Array<{index:number;points:Array<[number,number]>}>=[];let offset=0;while(offset<unsent.length-1){const part=unsent.slice(offset,Math.min(unsent.length,offset+120));if(part.length<2)break;chunks.push({index:a.chunkIndex++,points:part});offset+=part.length-1;}a.sentIndex=a.points.length;
    for(const chunk of chunks){sendChain.current=sendChain.current.then(async()=>{const r=await fetch("/api/bebrave/strokes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session!.id,strokeId:a.strokeId,strokeOrder:a.strokeOrder,chunkIndex:chunk.index,points:chunk.points})});if(!r.ok){const d=await r.json().catch(()=>({}));if(d.error!=="deadline")throw Error(d.error||"A stroke could not be saved.");}}).catch(e=>setSaveError(e instanceof Error?e.message:"A stroke could not be saved."));}
  }
  function flushActive(force=false){if(active.current)queueChunk(active.current,force);}

  function stopStroke(pointerId:number,lastPoint?:[number,number]|null){
    const a=active.current;
    if(!a||a.pointerId!==pointerId)return;
    if(lastPoint)appendPoint(lastPoint);
    // A quick tap still needs two nearby points for storage and a round-cap dot.
    if(a.points.length===1){const [x,y]=a.points[0];a.points.push([x<719?x+.3:x-.3,y]);}
    queueChunk(a,true);
    strokesRef.current=[...strokesRef.current,{strokeId:a.strokeId,strokeOrder:a.strokeOrder,points:[...a.points]}];
    setLocalStrokes(strokesRef.current);
    active.current=null;
    cancelAnimationFrame(paintFrame.current);paintFrame.current=0;
    activeLine.current?.setAttribute("d","");
    activeGlow.current?.setAttribute("d","");
    activeShimmer.current?.setAttribute("d","");
    activeGleam.current?.setAttribute("visibility","hidden");
  }

  useEffect(()=>{if(mode!=="draw")return;const id=setInterval(()=>flushActive(false),200);return()=>clearInterval(id);},[mode,session?.id]);

  const finish=useCallback(async()=>{if(finishing.current||!session)return;finishing.current=true;setFinishBusy(true);const a=active.current;if(a)stopStroke(a.pointerId);await sendChain.current;async function attempt(){const r=await fetch("/api/bebrave/session/finish",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:session!.id})});const d=await r.json();if(r.status===409&&d.error==="still-active"){await new Promise(res=>setTimeout(res,180));return attempt();}if(!r.ok)throw Error(d.error||"The carving could not be finalized.");return d;}try{const d=await attempt();onFinished?.(d,[...strokesRef.current]);}catch(e){setSaveError(e instanceof Error?e.message:"The carving could not be finalized.");finishing.current=false;setFinishBusy(false);}},[session,onFinished]);

  useEffect(()=>{if(mode!=="draw"||!session?.drawingDeadline)return;let ended=false;const tick=()=>{const ms=Date.parse(session.drawingDeadline!)-(Date.now()+serverOffset.current);setRemaining(Math.max(0,Math.ceil(ms/1000)));if(ms<=0&&!ended){ended=true;void finish();}};tick();const id=setInterval(tick,100);return()=>clearInterval(id);},[mode,session?.drawingDeadline,finish]);

  const showLocal=mode==="draw"||(mode==="admire"&&session?.status==="completed"&&!drawings.some(d=>d.id===session.id));
  const localDrawing:BeBravePublicDrawing|undefined=showLocal&&session?.chosenRarity&&session.chosenColor?{id:"local",publicSequence:Number.MAX_SAFE_INTEGER,rarity:session.chosenRarity,color:session.chosenColor,effectSeed:session.effectSeed||0,effectId:session.chosenEffect||undefined,strokes:localStrokes}:undefined;
  const widthStyle=mode==="fallen"?{width:state.height*scale,height:BEBRAVE_TREE_WIDTH*scale}:{height:state.height*scale};
  const treeTransform=mode==="fallen"?`translateX(${state.height*scale}px) rotate(90deg) scale(${scale})`:`scale(${scale})`;
  const minutes=Math.floor(remaining/60),seconds=String(remaining%60).padStart(2,"0");

  return <section ref={scene} className={`bebrave-scene is-${mode}`} style={{"--bebrave-tree-scale":scale,"--bebrave-tree-zoom":mode==="admire"?zoom:1} as CSSProperties}>
    <div className="bebrave-horizon" aria-hidden="true"><span className="bebrave-sun"/><span className="bebrave-cloud c1"/><span className="bebrave-cloud c2"/></div>
    <div className="bebrave-midground" aria-hidden="true"/>
    <TreeAtmosphere/>
    {(mode==="draw"||mode==="admire")&&<aside className="bebrave-control-rail" aria-label={mode==="draw"?"Carving controls":"Tree controls"}>
      {homeControls}
      {mode==="admire"&&<>
        <div className="bebrave-zoom-controls" role="group" aria-label="Zoom tree">
          <button type="button" onClick={()=>adjustZoom(zoom-.1)} disabled={zoom<=.65} aria-label="Zoom out">−</button>
          <span>{Math.round(zoom*100)}%</span>
          <button type="button" onClick={()=>adjustZoom(zoom+.1)} disabled={zoom>=1.45} aria-label="Zoom in">+</button>
          <button type="button" onClick={()=>adjustZoom(.82)} aria-label="Reset zoom">Reset</button>
        </div>
        {admireActions}
      </>}
      {mode==="draw"&&<>
        <div className="bebrave-timer" role="timer" aria-label="Carving time remaining" aria-live="off"><strong>{minutes}:{seconds}</strong></div>
        <button type="button" className="button bebrave-done-button" disabled={finishBusy} onClick={()=>void finish()}>{finishBusy?"Finishing…":"Done"}</button>
      </>}
    </aside>}
    {saveError&&<p className="bebrave-save-error" role="alert">{saveError}</p>}
    <div ref={horizontal} className={mode==="fallen"?"bebrave-fallen-scroll":"bebrave-standing-scroll"} tabIndex={mode==="fallen"?0:undefined}>
      <div ref={world} className="bebrave-world" style={widthStyle}
        onPointerDown={e=>{
          if(mode!=="draw"||remaining<=0||!session||(e.pointerType==="touch"&&!e.isPrimary)||(e.pointerType==="mouse"&&e.button!==0))return;
          if(active.current){
            if(e.currentTarget.hasPointerCapture(active.current.pointerId))return;
            stopStroke(active.current.pointerId);
          }
          const p=worldPoint(e.clientX,e.clientY);if(!p)return;
          e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);
          active.current={pointerId:e.pointerId,strokeId:crypto.randomUUID(),strokeOrder:strokeCounter.current++,points:[p],sentIndex:0,chunkIndex:0};
          if(!paintFrame.current)paintFrame.current=requestAnimationFrame(paint);
        }}
        onPointerMove={e=>{
          if(!active.current||active.current.pointerId!==e.pointerId||mode!=="draw"||remaining<=0)return;
          e.preventDefault();
          const coalesced=e.nativeEvent.getCoalescedEvents?.();
          const events=coalesced?.length?coalesced:[e.nativeEvent];
          for(const point of events){const p=worldPoint(point.clientX,point.clientY);if(p)appendPoint(p);}
        }}
        onPointerUp={e=>{
          if(active.current?.pointerId!==e.pointerId)return;
          e.preventDefault();stopStroke(e.pointerId,worldPoint(e.clientX,e.clientY));
          if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={e=>{stopStroke(e.pointerId);}}
        onLostPointerCapture={e=>{stopStroke(e.pointerId);}}
        onContextMenu={e=>{if(mode==="draw")e.preventDefault();}}>
        <div className="bebrave-tree-space" style={{width:BEBRAVE_TREE_WIDTH,height:state.height,transform:treeTransform}}>
          <div className="bebrave-trunk" aria-hidden="true"/>
          {mode==="draw"&&session?.zoneTop!=null&&session.zoneBottom!=null&&<div className="bebrave-active-zone" style={{top:session.zoneTop,height:session.zoneBottom-session.zoneTop}} aria-hidden="true"/>}
          <svg className="bebrave-drawings" viewBox={`0 0 ${BEBRAVE_TREE_WIDTH} ${state.height}`} aria-label="Drawings carved into the shared cypress tree">
            {/* New work is painted first. Older public sessions are appended later, so the first person to mark a spot always stays visually on top. */}
            {localDrawing&&<g className="bebrave-local-drawing">{localDrawing.strokes.map(st=><BeBraveStroke key={st.strokeId} stroke={st} color={localDrawing.color} rarity={localDrawing.rarity} seed={localDrawing.effectSeed} effectId={localDrawing.effectId}/>)}</g>}
            {mode==="draw"&&session?.chosenColor&&session.chosenRarity&&<g className={`bebrave-stroke bebrave-${visual.rarity} is-active`} data-effect={visual.rarity==="legendary"?legendaryEffect(session.chosenEffect):undefined} style={{"--stroke-color":visual.color} as CSSProperties}>
              {(visual.rarity==="superior"||visual.rarity==="epic"||visual.rarity==="legendary")&&<path ref={activeGlow} className="bebrave-stroke-glow" stroke={visual.color}/>}
              <path ref={activeLine} className="bebrave-stroke-line" stroke={visual.color}/>
              {(visual.rarity==="epic"||visual.rarity==="legendary")&&<><path ref={activeShimmer} className="bebrave-epic-shimmer" stroke={visual.color}/><g ref={activeGleam} visibility="hidden" className="bebrave-sparkle">{visual.rarity==="legendary"&&<circle className="bebrave-wisp-orbit" r="8"/>}<path className="bebrave-sparkle-star" d="M0 -4 L1 -1 L4 0 L1 1 L0 4 L-1 1 L-4 0 L-1 -1 Z"/><circle className="bebrave-sparkle-core" r="1"/></g></>}
            </g>}
            {drawings.map(d=><g key={d.id} data-sequence={d.publicSequence}>{d.strokes.map(st=><BeBraveStroke key={st.strokeId} stroke={st} color={d.color} rarity={d.rarity} seed={d.effectSeed} effectId={d.effectId}/>)}</g>)}
          </svg>
          {mode==="fallen"&&<div className="bebrave-fallen-cut" aria-hidden="true"/>}
        </div>
      </div>
    </div>

  </section>;
}
