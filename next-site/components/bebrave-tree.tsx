"use client";

import { useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type ReactNode } from "react";
import { drawingInputOpen } from "@/lib/bebrave/input-window";
import { sparklePoints } from "@/lib/bebrave/effect-anchors";
import { legendaryEffect } from "@/lib/bebrave/effects";
import { SectionCache } from "@/lib/bebrave/section-cache";
import { unpackDrawing } from "@/lib/bebrave/completed-strokes";
import { BeBraveStroke,StrokeLayers,CarvingSpark,pointsToPath } from "@/components/bebrave-stroke";
import { TreeAtmosphere } from "@/components/tree-atmosphere";
import { BeBraveInspector } from "@/components/bebrave-inspector";
import { pickCarving } from "@/lib/bebrave/carving-inspection";
import { BEBRAVE_SECTION_HEIGHT,BEBRAVE_TREE_WIDTH,type BeBravePublicDrawing,type BeBravePublicStroke,type BeBraveSessionView,type BeBraveTreeState } from "@/lib/bebrave-types";

type Mode="admire"|"draw"|"fallen"|"base";
type DraftStroke=BeBravePublicStroke;

export function BeBraveTree({state,mode,session,serverNow,draftStrokes=[],cutoff,onFinished,homeControls,admireActions,sectionSource}:{state:BeBraveTreeState;mode:Mode;session?:BeBraveSessionView|null;serverNow?:string;draftStrokes?:DraftStroke[];cutoff?:number;onFinished?:(payload:any,strokes:DraftStroke[])=>void;homeControls?:ReactNode;admireActions?:ReactNode;sectionSource?:(section:number,signal:AbortSignal)=>Promise<BeBravePublicDrawing[]>}) {
  const scene=useRef<HTMLDivElement>(null),world=useRef<HTMLDivElement>(null),horizontal=useRef<HTMLDivElement>(null);
  const activeCut=useRef<SVGPathElement>(null),activeRim=useRef<SVGPathElement>(null),activeInlay=useRef<SVGPathElement>(null),activeAnchors=useRef<SVGGElement>(null),
    activeLine=useRef<SVGPathElement>(null),activeGlow=useRef<SVGPathElement>(null),activeShimmer=useRef<SVGPathElement>(null),activeGleam=useRef<SVGGElement>(null);
  const [scale,setScale]=useState(1),[zoom,setZoom]=useState(mode==="admire"?.82:1),[range,setRange]=useState<[number,number]>([Math.max(0,Math.floor((state.height-1800)/BEBRAVE_SECTION_HEIGHT)),Math.floor(state.height/BEBRAVE_SECTION_HEIGHT)]);
  const rangeRef=useRef(range),stateRef=useRef(state);stateRef.current=state;
  const [drawings,setDrawings]=useState<BeBravePublicDrawing[]>([]),[saveError,setSaveError]=useState("");
  const [inspection,setInspection]=useState<{drawing:BeBravePublicDrawing;opener:SVGGElement|null}|null>(null);
  const inspectionTap=useRef<{pointerId:number;x:number;y:number}|null>(null);
  const inspecting=(mode==="admire"||mode==="fallen")&&!sectionSource;
  const worldTop=useRef(0),scaleRef=useRef(1),scrollFrame=useRef(0),ready=useRef(false),parallaxOrigin=useRef<number|null>(null),zoomAnchor=useRef<{x:number;y:number;screenY:number}|null>(null),zoomRef=useRef(zoom);
  zoomRef.current=zoom;
  const [fitRecap,setFitRecap]=useState(Boolean(mode==="admire"&&session?.status==="completed"));
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
    if(sectionSource)return sectionSource(section,signal);
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
  }),[state.revision,state.latestSequence,cutoff,sectionSource]);
  useEffect(()=>()=>sectionCache.dispose(),[sectionCache]);
  useEffect(()=>{
    // Nearby sections stay cached, but effects outside the actual camera sleep.
    // A single observer changes CSS state without a React animation loop.
    const root=scene.current;
    if(!root||typeof IntersectionObserver==="undefined")return;
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        const target=entry.target as SVGGElement;
        target.style.setProperty("--effect-play",entry.isIntersecting?"running":"paused");
        if(target.getAttribute("role")==="button")target.setAttribute("tabindex",entry.isIntersecting?"0":"-1");
      }
    },{root:mode==="fallen"?horizontal.current:null,rootMargin:"80px"});
    for(const drawing of root.querySelectorAll(".bebrave-published-drawing"))observer.observe(drawing);
    return()=>observer.disconnect();
  },[drawings,mode]);
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
    const measure=()=>{
      const rail=scene.current?.querySelector<HTMLElement>(".bebrave-control-rail");
      const safeTop=window.innerWidth<=700?(rail?.getBoundingClientRect().bottom||104)+16:24;
      scene.current?.style.setProperty("--bebrave-safe-top",`${safeTop}px`);
      const rect=el.getBoundingClientRect();worldTop.current=rect.top+window.scrollY;const next=mode==="fallen"&&horizontal.current?horizontal.current.clientHeight/BEBRAVE_TREE_WIDTH:rect.width/BEBRAVE_TREE_WIDTH;scaleRef.current=next;setScale(next);};
    const ro=new ResizeObserver(measure);ro.observe(mode==="fallen"&&horizontal.current?horizontal.current:el);const rail=scene.current?.querySelector(".bebrave-control-rail");if(rail)ro.observe(rail);measure();
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
      const placeCamera=()=>{
        if(mode==="fallen"&&horizontal.current){horizontal.current.scrollTo({left:0,behavior:"instant"});}
        else if(mode!=="base"){window.scrollTo({top:Math.max(0,worldTop.current+(session?.zoneBottom??state.height)*scaleRef.current-window.innerHeight+24),behavior:"instant"});}
        parallaxOrigin.current=mode==="fallen"&&horizontal.current?horizontal.current.scrollLeft:window.scrollY;
        tick();
      };
      placeCamera();
      initial=requestAnimationFrame(tick);
    }
    return()=>{ro.disconnect();target.removeEventListener("scroll",scroll);window.removeEventListener("resize",measure);cancelAnimationFrame(scrollFrame.current);cancelAnimationFrame(initial);};
  },[mode,state.height]);

  useLayoutEffect(()=>{
    if(mode!=="draw"||!world.current||!session?.zoneBottom)return;
    window.scrollTo({top:Math.max(0,worldTop.current+session.zoneBottom*scale-window.innerHeight+24),behavior:"instant"});
  },[mode,scale,session?.zoneBottom]);

  function adjustZoom(next:number){
    if(mode!=="admire")return;
    const value=Math.max(.65,Math.min(1.45,Math.round(next*100)/100));
    if(value===zoom&&!fitRecap)return;
    const container=horizontal.current,el=world.current;
    const safeTop=window.innerWidth<=700?(scene.current?.querySelector(".bebrave-control-rail")?.getBoundingClientRect().bottom||0):0;
    const screenY=(safeTop+window.innerHeight)/2;
    zoomAnchor.current={
      x:container&&el?(container.scrollLeft+container.clientWidth/2-el.offsetLeft)/scaleRef.current:360,
      y:Math.max(0,(window.scrollY+screenY-worldTop.current)/scaleRef.current),screenY
    };
    setFitRecap(false);setZoom(value);
  }
  useLayoutEffect(()=>{
    const anchor=zoomAnchor.current,container=horizontal.current,el=world.current;
    if(mode!=="admire"||!anchor||!container||!el)return;
    const targetScale=container.clientWidth*.9*zoom/BEBRAVE_TREE_WIDTH;
    if(Math.abs(scale-targetScale)>.005)return;
    zoomAnchor.current=null;
    window.scrollTo({top:Math.max(0,worldTop.current+anchor.y*scale-anchor.screenY),behavior:"instant"});
    container.scrollLeft=el.offsetLeft+anchor.x*scale-container.clientWidth/2;
  },[scale,zoom,mode,fitRecap]);

  const visual=useMemo(()=>({rarity:session?.chosenRarity||"common",color:session?.chosenColor||"#3B2418",seed:session?.effectSeed||0}),[session]);
  function worldPoint(clientX:number,clientY:number):[number,number]|null{const rect=world.current?.getBoundingClientRect();if(!rect||mode!=="draw"||session?.zoneTop==null||session.zoneBottom==null)return null;const x=(clientX-rect.left)/scaleRef.current,y=(clientY-rect.top)/scaleRef.current;if(x<0||x>BEBRAVE_TREE_WIDTH||y<session.zoneTop||y>session.zoneBottom)return null;return [Math.round(x*10)/10,Math.round(y*10)/10];}
  function inputOpen(){return drawingInputOpen(session?.drawingDeadline,Date.now(),serverOffset.current,finishing.current);}
  function paint(){paintFrame.current=0;const a=active.current;if(!a)return;const d=pointsToPath(a.points);for(const ref of [activeCut,activeRim,activeInlay,activeLine,activeGlow,activeShimmer])ref.current?.setAttribute("d",d);
    if(activeAnchors.current){const anchors=sparklePoints(a.points,visual.seed,a.strokeOrder);for(const [i,slot] of [...activeAnchors.current.children].entries()){const p=anchors[i];slot.setAttribute("visibility",p?"visible":"hidden");if(p){slot.setAttribute("transform",`translate(${p.x} ${p.y})`);const star=slot.querySelector<SVGPathElement>(".bebrave-sparkle-star");if(star)star.style.animationDelay=`-${p.delay}s`;const orbit=slot.querySelector<SVGCircleElement>(".bebrave-wisp-orbit");if(orbit){orbit.setAttribute("r",String(p.r*2.1));orbit.style.animationDelay=`-${p.delay}s`;}star?.setAttribute("d",`M0 ${-p.r} L${p.r*.22} ${-p.r*.22} L${p.r} 0 L${p.r*.22} ${p.r*.22} L0 ${p.r} L${-p.r*.22} ${p.r*.22} L${-p.r} 0 L${-p.r*.22} ${-p.r*.22} Z`);}}}
    const tip=a.points.at(-1);if(tip){activeGleam.current?.setAttribute("transform",`translate(${tip[0]} ${tip[1]})`);activeGleam.current?.setAttribute("visibility","visible");}}
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
    if(lastPoint&&inputOpen())appendPoint(lastPoint);
    // A quick tap still needs two nearby points for storage and a round-cap dot.
    if(a.points.length===1){const [x,y]=a.points[0];a.points.push([x<719?x+.3:x-.3,y]);}
    queueChunk(a,true);
    strokesRef.current=[...strokesRef.current,{strokeId:a.strokeId,strokeOrder:a.strokeOrder,points:[...a.points]}];
    setLocalStrokes(strokesRef.current);
    active.current=null;
    cancelAnimationFrame(paintFrame.current);paintFrame.current=0;
    for(const ref of [activeCut,activeRim,activeInlay,activeLine,activeGlow,activeShimmer])ref.current?.setAttribute("d","");
    if(activeAnchors.current)for(const slot of activeAnchors.current.children)slot.setAttribute("visibility","hidden");
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
  function inspectDrawing(drawing:BeBravePublicDrawing,opener?:SVGGElement){
    const source=opener||scene.current?.querySelector<SVGGElement>(`[data-drawing-id="${drawing.id}"]`)||null;
    source?.focus({preventScroll:true});
    setInspection({drawing,opener:source});
  }

  return <section ref={scene} className={`bebrave-scene is-${mode} ${fitRecap?"is-recap":""}`} style={{"--bebrave-tree-scale":scale,"--bebrave-tree-zoom":mode==="admire"?zoom:1} as CSSProperties}>
    <div className="bebrave-horizon" data-light-source aria-hidden="true"><span className="bebrave-sun"/><span className="bebrave-cloud c1"/><span className="bebrave-cloud c2"/></div>
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
          {zoom>1.11&&<><button type="button" aria-label="Pan left" onClick={()=>horizontal.current?.scrollBy({left:-horizontal.current.clientWidth*.35,behavior:"instant"})}>←</button><button type="button" aria-label="Pan right" onClick={()=>horizontal.current?.scrollBy({left:horizontal.current.clientWidth*.35,behavior:"instant"})}>→</button></>}
        </div>
        {admireActions}
      </>}
      {mode==="draw"&&<>
        <div className="bebrave-timer" data-urgent={remaining<=10} role="timer" aria-label="Carving time remaining" aria-live="off"><strong>{minutes}:{seconds}</strong></div>
        <button type="button" className="button bebrave-done-button" disabled={finishBusy} onClick={()=>void finish()}>{finishBusy?"Finishing…":"Done"}</button>
      </>}
    </aside>}
    {saveError&&<p className="bebrave-save-error" role="alert">{saveError}</p>}
    <div ref={horizontal} className={mode==="fallen"?"bebrave-fallen-scroll":"bebrave-standing-scroll"} tabIndex={inspecting?0:undefined} aria-label={inspecting?"Pan along the tree":undefined}>
      <div ref={world} className="bebrave-world" style={widthStyle}
        onPointerDown={e=>{
          if(inspecting){inspectionTap.current=e.isPrimary&&(e.pointerType!=="mouse"||e.button===0)?{pointerId:e.pointerId,x:e.clientX,y:e.clientY}:null;return;}
          if(mode!=="draw"||!inputOpen()||!session||(e.pointerType==="touch"&&!e.isPrimary)||(e.pointerType==="mouse"&&e.button!==0))return;
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
          if(inspecting){const tap=inspectionTap.current;if(tap&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>9)inspectionTap.current=null;return;}
          if(!active.current||active.current.pointerId!==e.pointerId||mode!=="draw"||!inputOpen())return;
          e.preventDefault();
          const coalesced=e.nativeEvent.getCoalescedEvents?.();
          const events=coalesced?.length?coalesced:[e.nativeEvent];
          for(const point of events){const p=worldPoint(point.clientX,point.clientY);if(p)appendPoint(p);}
        }}
        onPointerUp={e=>{
          if(inspecting){
            const tap=inspectionTap.current;inspectionTap.current=null;
            if(!tap||tap.pointerId!==e.pointerId||Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>9)return;
            const rect=e.currentTarget.getBoundingClientRect(),s=scaleRef.current;
            const point:[number,number]=mode==="fallen"?[(e.clientY-rect.top)/s,state.height-(e.clientX-rect.left)/s]:[(e.clientX-rect.left)/s,(e.clientY-rect.top)/s];
            const drawing=pickCarving(drawings,point,18/s);
            if(drawing)inspectDrawing(drawing);
            return;
          }
          if(active.current?.pointerId!==e.pointerId)return;
          e.preventDefault();stopStroke(e.pointerId,worldPoint(e.clientX,e.clientY));
          if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={e=>{inspectionTap.current=null;stopStroke(e.pointerId);}}
        onLostPointerCapture={e=>{stopStroke(e.pointerId);}}
        onContextMenu={e=>{if(mode==="draw")e.preventDefault();}}>
        <div className="bebrave-tree-space" style={{width:BEBRAVE_TREE_WIDTH,height:state.height,transform:treeTransform}}>
          <div className="bebrave-trunk" aria-hidden="true"/>
          {mode==="draw"&&session?.zoneTop!=null&&session.zoneBottom!=null&&<div className="bebrave-active-zone" style={{top:session.zoneTop,height:session.zoneBottom-session.zoneTop}} aria-hidden="true"/>}
          <svg className="bebrave-drawings" role={inspecting?"group":"img"} viewBox={`0 0 ${BEBRAVE_TREE_WIDTH} ${state.height}`} aria-label="Drawings carved into the shared cypress tree">
            {/* New work is painted first. Older public sessions are appended later, so the first person to mark a spot always stays visually on top. */}
            {localDrawing&&<g className="bebrave-local-drawing">{localDrawing.strokes.map(st=><BeBraveStroke key={st.strokeId} stroke={st} color={localDrawing.color} rarity={localDrawing.rarity} seed={localDrawing.effectSeed} effectId={localDrawing.effectId}/>)}</g>}
            {mode==="draw"&&session?.chosenColor&&session.chosenRarity&&<g className={`bebrave-stroke bebrave-${visual.rarity} is-active`} data-effect={visual.rarity==="legendary"?legendaryEffect(session.chosenEffect):undefined} style={{"--stroke-color":visual.color} as CSSProperties}>
              <StrokeLayers color={visual.color} rarity={visual.rarity} refs={{cut:activeCut,rim:activeRim,inlay:activeInlay,line:activeLine,glow:activeGlow,shimmer:activeShimmer}}/>
              {(visual.rarity==="epic"||visual.rarity==="legendary")&&<g ref={activeAnchors}>{Array.from({length:10},(_,i)=><g key={i} visibility="hidden"><CarvingSpark r={3.5} legendary={visual.rarity==="legendary"}/></g>)}</g>}
              <g ref={activeGleam} visibility="hidden" className="bebrave-contact"><circle className="bebrave-contact-ring" r="11"/><path className="bebrave-contact-ticks" d="M-17 0h5M12 0h5M0 -17v5M0 12v5"/><circle className="bebrave-contact-core" r="2.2"/></g>
            </g>}
            {drawings.map(d=><g key={d.id} className="bebrave-published-drawing" data-sequence={d.publicSequence} data-drawing-id={d.id} role={inspecting?"button":undefined} tabIndex={inspecting?0:undefined} aria-label={inspecting?`Admire ${d.rarity}`:undefined} onKeyDown={e=>{if(inspecting&&(e.key==="Enter"||e.key===" ")){e.preventDefault();inspectDrawing(d,e.currentTarget);}}}>{d.strokes.map(st=><BeBraveStroke key={st.strokeId} stroke={st} color={d.color} rarity={d.rarity} seed={d.effectSeed} effectId={d.effectId}/>)}</g>)}
          </svg>
          {mode==="fallen"&&<div className="bebrave-fallen-cut" aria-hidden="true"/>}
        </div>
      </div>
    </div>

    {inspection&&<BeBraveInspector key={inspection.drawing.id} drawing={inspection.drawing} opener={inspection.opener} onClose={()=>setInspection(null)}/>}
  </section>;
}
