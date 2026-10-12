"use client";

import { useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type ReactNode } from "react";
import { drawingInputOpen } from "@/lib/bebrave/input-window";
import { sparklePoints } from "@/lib/bebrave/effect-anchors";
import { carvingBounds } from "@/lib/bebrave/carving-inspection";
import { SectionCache } from "@/lib/bebrave/section-cache";
import { unpackDrawing } from "@/lib/bebrave/completed-strokes";
import { BeBraveCarving,CarvingSpark,carvingToPath,pointsToPath,sparkGeometry,enchantmentParticleStyle } from "@/components/bebrave-stroke";
import { admireAtmosphere } from "@/lib/bebrave/admire-atmosphere";
import { TreeAtmosphere } from "@/components/tree-atmosphere";
import { BEBRAVE_SECTION_HEIGHT,BEBRAVE_TREE_WIDTH,type BeBravePublicDrawing,type BeBravePublicStroke,type BeBraveSessionView,type BeBraveTreeState } from "@/lib/bebrave-types";

type Mode="admire"|"draw"|"fallen"|"base";
type DraftStroke=BeBravePublicStroke;
// The draft-sync effect depends on identity, including when the prop is omitted.
const emptyDraftStrokes:DraftStroke[]=[];

export function BeBraveTree({state,mode,session,serverNow,draftStrokes=emptyDraftStrokes,cutoff,onFinished,homeControls,admireActions,sectionSource}:{state:BeBraveTreeState;mode:Mode;session?:BeBraveSessionView|null;serverNow?:string;draftStrokes?:DraftStroke[];cutoff?:number;onFinished?:(payload:any,strokes:DraftStroke[])=>void;homeControls?:ReactNode;admireActions?:ReactNode;sectionSource?:(section:number,signal:AbortSignal)=>Promise<BeBravePublicDrawing[]>}) {
  const scene=useRef<HTMLDivElement>(null),world=useRef<HTMLDivElement>(null),horizontal=useRef<HTMLDivElement>(null);
  const activeEdge=useRef<SVGPathElement>(null),activeCut=useRef<SVGPathElement>(null),activeRim=useRef<SVGPathElement>(null),activeInlay=useRef<SVGPathElement>(null),activeAnchors=useRef<SVGGElement>(null),
    activeLine=useRef<SVGPathElement>(null),activeHalo=useRef<SVGPathElement>(null),activeGlow=useRef<SVGPathElement>(null),activeShimmer=useRef<SVGPathElement>(null),activeGleam=useRef<SVGGElement>(null);
  const [scale,setScale]=useState(1),[range,setRange]=useState<[number,number]>([Math.max(0,Math.floor((state.height-1800)/BEBRAVE_SECTION_HEIGHT)),Math.floor(state.height/BEBRAVE_SECTION_HEIGHT)]);
  const rangeRef=useRef(range),stateRef=useRef(state);stateRef.current=state;
  const [drawings,setDrawings]=useState<BeBravePublicDrawing[]>([]),[saveError,setSaveError]=useState("");
  const [paintBand,setPaintBand]=useState<[number,number]>([Math.max(0,state.height-2880),state.height]);
  const boundedDrawings=useMemo(()=>drawings.map(drawing=>({drawing,bounds:carvingBounds(drawing,72)})),[drawings]);
  const visibleDrawings=useMemo(()=>boundedDrawings.filter(({bounds})=>bounds.top+bounds.height>=paintBand[0]&&bounds.top<=paintBand[1]).map(({drawing})=>drawing),[boundedDrawings,paintBand]);
  const worldTop=useRef(0),scaleRef=useRef(1),scrollFrame=useRef(0),ready=useRef(false),parallaxOrigin=useRef<number|null>(null);
  const fitRecap=mode==="admire"&&session?.status==="completed";
  const initialAdmireCamera=useRef(mode==="admire");
  const [localStrokes,setLocalStrokes]=useState<DraftStroke[]>(draftStrokes),[remaining,setRemaining]=useState(60),[finishBusy,setFinishBusy]=useState(false);
  const strokesRef=useRef<DraftStroke[]>(draftStrokes);
  const settledPath=useRef(carvingToPath(draftStrokes));
  const active=useRef<{pointerId:number;strokeId:string;strokeOrder:number;points:Array<[number,number]>;sentIndex:number;chunkIndex:number}|null>(null);
  const strokeCounter=useRef(draftStrokes.reduce((m,s)=>Math.max(m,s.strokeOrder+1),0));
  const sendChain=useRef<Promise<void>>(Promise.resolve()),finishing=useRef(false),paintFrame=useRef(0),serverOffset=useRef(serverNow?Date.parse(serverNow)-Date.now():0);

  useEffect(()=>{if(serverNow)serverOffset.current=Date.parse(serverNow)-Date.now();},[serverNow]);
  useEffect(()=>{strokesRef.current=draftStrokes;settledPath.current=carvingToPath(draftStrokes);setLocalStrokes(draftStrokes);strokeCounter.current=draftStrokes.reduce((m,s)=>Math.max(m,s.strokeOrder+1),0);},[draftStrokes]);

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
    const visible=new Set<SVGGElement>();
    const update=()=>{
      // Every visible Epic continues emitting. Crowded views reduce emitter
      // density rather than freezing older visitors' enchantments.
      root.dataset.crowdedEffects=String(visible.size>12);
      for(const target of visible)target.style.setProperty("--effect-play",document.visibilityState==="visible"?"running":"paused");
    };
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        const target=entry.target as SVGGElement;
        if(entry.isIntersecting)visible.add(target);
        else{visible.delete(target);target.style.setProperty("--effect-play","paused");}
      }
      update();
    },{root:mode==="fallen"?horizontal.current:null,rootMargin:"80px"});
    for(const drawing of root.querySelectorAll(".bebrave-published-drawing"))observer.observe(drawing);
    document.addEventListener("visibilitychange",update);
    return()=>{observer.disconnect();document.removeEventListener("visibilitychange",update);};
  },[visibleDrawings,mode]);
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
    if(mode==="admire")initialAdmireCamera.current=true;
    parallaxOrigin.current=null;
    const measure=()=>{
      const rail=scene.current?.querySelector<HTMLElement>(".bebrave-control-rail");
      const footer=scene.current?.querySelector<HTMLElement>(".bebrave-admire-actions");
      const floor=footer?Math.ceil(window.innerHeight-footer.getBoundingClientRect().top+10):0;
      scene.current?.style.setProperty("--bebrave-admire-floor",`${floor}px`);
      const safeTop=(rail?.getBoundingClientRect().bottom||80)+12;
      scene.current?.style.setProperty("--bebrave-safe-top",`${safeTop}px`);
      const rect=el.getBoundingClientRect();worldTop.current=rect.top+window.scrollY;const next=mode==="fallen"&&horizontal.current?horizontal.current.clientHeight/BEBRAVE_TREE_WIDTH:rect.width/BEBRAVE_TREE_WIDTH;scaleRef.current=next;setScale(next);
      if(!scrollFrame.current)scrollFrame.current=requestAnimationFrame(()=>tick());};
    const ro=new ResizeObserver(measure);ro.observe(mode==="fallen"&&horizontal.current?horizontal.current:el);const rail=scene.current?.querySelector(".bebrave-control-rail"),footer=scene.current?.querySelector(".bebrave-admire-actions");if(rail)ro.observe(rail);if(footer)ro.observe(footer);measure();
    const tick=()=>{
      scrollFrame.current=0;
      const s=stateRef.current;
      const viewport=mode==="fallen"&&horizontal.current?horizontal.current.clientWidth:window.innerHeight;
      const position=mode==="fallen"&&horizontal.current?horizontal.current.scrollLeft:window.scrollY;
      const local=mode==="fallen"&&horizontal.current?Math.max(0,s.height-horizontal.current.scrollLeft/scaleRef.current-viewport/scaleRef.current):Math.max(0,(window.scrollY-worldTop.current)/scaleRef.current);
      // Retain the five-section data cache; paint only a camera-sized band.
      // Quantized overscan avoids a React update for every scrolling pixel.
      const step=BEBRAVE_SECTION_HEIGHT/4;
      const band:[number,number]=[Math.max(0,Math.floor(local/step)*step-120),Math.ceil((local+viewport/scaleRef.current)/step)*step+120];
      setPaintBand(previous=>previous[0]===band[0]&&previous[1]===band[1]?previous:band);
      const center=Math.floor((local+viewport/scaleRef.current*.5)/BEBRAVE_SECTION_HEIGHT);
      const max=Math.max(0,Math.ceil(s.height/BEBRAVE_SECTION_HEIGHT)-1);
      const next:[number,number]=[Math.max(0,Math.min(max,center)-2),Math.min(max,center+2)];
      if(next[0]!==rangeRef.current[0]||next[1]!==rangeRef.current[1]){rangeRef.current=next;setRange(next);}
      if(mode==="admire"&&scene.current){
        const floor=parseFloat(scene.current.style.getPropertyValue("--bebrave-admire-floor")||"0");
        const total=Math.max(1,s.height*scaleRef.current-viewport+floor);
        const rise=Math.max(0,worldTop.current+total-position);
        const sky=admireAtmosphere(rise,total,viewport);
        const reduced=document.documentElement.dataset.effects==="reduced";
        const style=scene.current.style;
        style.setProperty("--bebrave-horizon-y",`${reduced?0:sky.horizonY.toFixed(1)}px`);
        style.setProperty("--bebrave-mid-y",`${reduced?0:sky.midgroundY.toFixed(1)}px`);
        style.setProperty("--bebrave-sky-color",sky.color);
        style.setProperty("--bebrave-horizon-opacity",String(sky.horizonOpacity));
        style.setProperty("--bebrave-mid-opacity",String(sky.midgroundOpacity));
        style.setProperty("--bebrave-stars",String(sky.stars));
        style.setProperty("--bebrave-ground-atmosphere",String(1-sky.progress));
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
        else if(mode!=="base"){const floor=mode==="admire"?parseFloat(scene.current?.style.getPropertyValue("--bebrave-admire-floor")||"0"):0;window.scrollTo({top:Math.max(0,worldTop.current+(session?.zoneBottom??state.height)*scaleRef.current-window.innerHeight+floor),behavior:"instant"});}
        parallaxOrigin.current=mode==="fallen"&&horizontal.current?horizontal.current.scrollLeft:window.scrollY;
        tick();
      };
      placeCamera();
      initial=requestAnimationFrame(tick);
    }
    return()=>{ro.disconnect();target.removeEventListener("scroll",scroll);window.removeEventListener("resize",measure);cancelAnimationFrame(scrollFrame.current);cancelAnimationFrame(initial);};
  },[mode,state.height]);

  useLayoutEffect(()=>{
    if(!world.current||(mode!=="draw"&&!(mode==="admire"&&initialAdmireCamera.current)))return;
    // The first measurement changes the scaled spacer height. Place the camera
    // after that render, so the browser cannot clamp it to the unscaled height.
    if(Math.abs(scale-scaleRef.current)>.001)return;
    const bottom=session?.zoneBottom??state.height;
    const floor=mode==="admire"?parseFloat(scene.current?.style.getPropertyValue("--bebrave-admire-floor")||"0"):0;
    window.scrollTo({top:Math.max(0,worldTop.current+bottom*scale-window.innerHeight+floor),behavior:"instant"});
    if(mode==="admire")initialAdmireCamera.current=false;
  },[mode,scale,session?.zoneBottom,state.height]);

  const visual=useMemo(()=>({rarity:session?.chosenRarity||"common",color:session?.chosenColor||"#3B2418",seed:session?.effectSeed||0}),[session]);
  function worldPoint(clientX:number,clientY:number):[number,number]|null{const rect=world.current?.getBoundingClientRect();if(!rect||mode!=="draw"||session?.zoneTop==null||session.zoneBottom==null)return null;const x=(clientX-rect.left)/scaleRef.current,y=(clientY-rect.top)/scaleRef.current;if(x<0||x>BEBRAVE_TREE_WIDTH||y<session.zoneTop||y>session.zoneBottom)return null;return [Math.round(x*10)/10,Math.round(y*10)/10];}
  function inputOpen(){return drawingInputOpen(session?.drawingDeadline,Date.now(),serverOffset.current,finishing.current);}
  function paint(){paintFrame.current=0;const a=active.current;if(!a)return;const d=[settledPath.current,pointsToPath(a.points)].filter(Boolean).join(" ");for(const ref of [activeEdge,activeCut,activeRim,activeInlay,activeLine,activeHalo,activeGlow,activeShimmer])ref.current?.setAttribute("d",d);
    if(activeAnchors.current){
      const anchors=sparklePoints(a.points,visual.seed,a.strokeOrder);
      for(const [i,slot] of [...activeAnchors.current.children].entries()){
        const p=anchors[i];slot.setAttribute("visibility",p?"visible":"hidden");
        if(!p)continue;
        slot.setAttribute("transform",`translate(${p.x} ${p.y})`);
        const shape=sparkGeometry(p.r,visual.rarity==="legendary");
        const star=slot.querySelector<SVGPathElement>(".bebrave-sparkle-star");
        if(star){star.setAttribute("d",shape.star);star.style.animationDelay=`-${p.delay}s`;}
        slot.querySelector(".bebrave-sparkle-facets")?.setAttribute("d",shape.facets);
        slot.querySelector(".bebrave-sparkle-core")?.setAttribute("r",String(shape.core*(visual.rarity==="legendary"?1:.72)));
        slot.querySelector(".bebrave-energy-mote")?.setAttribute("r",String(p.r*1.65));
        const orbit=slot.querySelector<SVGCircleElement>(".bebrave-wisp-orbit");
        if(orbit){orbit.setAttribute("r",String(shape.orbit));orbit.style.animationDelay=`-${p.delay}s`;}
        const particle=slot.querySelector<SVGGElement>(".bebrave-energy-particle");
        if(particle){
          const style=enchantmentParticleStyle(p.r,p.delay) as Record<string,string>;
          for(const key of ["--particle-x","--particle-y","--particle-curl","--particle-duration","--trail-opacity"])particle.style.setProperty(key,style[key]);
          particle.style.animationDelay=style.animationDelay;
        }
        const satellite=slot.querySelector<SVGCircleElement>(".bebrave-energy-satellite");
        if(satellite){
          const style=enchantmentParticleStyle(p.r+1,p.delay+1.8) as Record<string,string>;
          for(const key of ["--particle-x","--particle-y","--particle-curl","--particle-duration"])satellite.style.setProperty(key,style[key]);
          satellite.style.animationDelay=style.animationDelay;satellite.setAttribute("r",String(p.r*.55));
        }
      }
    }
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
    settledPath.current=carvingToPath(strokesRef.current);
    setLocalStrokes(strokesRef.current);
    active.current=null;
    cancelAnimationFrame(paintFrame.current);paintFrame.current=0;
    for(const ref of [activeEdge,activeCut,activeRim,activeInlay,activeLine,activeHalo,activeGlow,activeShimmer])ref.current?.setAttribute("d",settledPath.current);
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
  return <section ref={scene} className={`bebrave-scene is-${mode} ${fitRecap?"is-recap":""}`} style={{"--bebrave-tree-scale":scale,"--bebrave-bark-bottom":`${state.height*scale}px`} as CSSProperties}>
    <div className="bebrave-horizon" data-light-source aria-hidden="true"><span className="bebrave-night-stars"/></div>
    <div className="bebrave-midground" aria-hidden="true"/>
    <TreeAtmosphere/>
    {(mode==="draw"||mode==="admire")&&<aside className="bebrave-control-rail" aria-label={mode==="draw"?"Carving controls":"Tree controls"}>
      {homeControls}
      {mode==="draw"&&<>
        <div className="bebrave-timer" data-urgent={remaining<=10} role="timer" aria-label="Carving time remaining" aria-live="off"><strong>{minutes}:{seconds}</strong></div>
        <button type="button" className="button bebrave-done-button" disabled={finishBusy} onClick={()=>void finish()}>{finishBusy?"Finishing…":"Done"}</button>
      </>}
    </aside>}
    {mode==="admire"&&admireActions&&<aside className="bebrave-admire-actions bebrave-menu-panel" aria-label="Admire controls">{admireActions}</aside>}
    {saveError&&<p className="bebrave-save-error" role="alert">{saveError}</p>}
    <div ref={horizontal} className={mode==="fallen"?"bebrave-fallen-scroll":"bebrave-standing-scroll"} aria-label={mode==="fallen"?"Pan along the fallen tree":undefined}>
      <div ref={world} className="bebrave-world" style={widthStyle}
        onPointerDown={e=>{
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
          if(!active.current||active.current.pointerId!==e.pointerId||mode!=="draw"||!inputOpen())return;
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
          <svg className="bebrave-drawings" role="img" viewBox={`0 0 ${BEBRAVE_TREE_WIDTH} ${state.height}`} aria-label="Drawings carved into the shared cypress tree">
            {/* New work is painted first. Older public sessions are appended later, so the first person to mark a spot always stays visually on top. */}
            {localDrawing&&<g className="bebrave-local-drawing"><BeBraveCarving strokes={localDrawing.strokes} color={localDrawing.color} rarity={localDrawing.rarity} seed={localDrawing.effectSeed} effectId={localDrawing.effectId} active={mode==="draw"} pathRefs={mode==="draw"?{edge:activeEdge,cut:activeCut,rim:activeRim,inlay:activeInlay,line:activeLine,halo:activeHalo,glow:activeGlow,shimmer:activeShimmer}:undefined}>
              {mode==="draw"&&<>
              {(visual.rarity==="epic"||visual.rarity==="legendary")&&<g ref={activeAnchors}>{Array.from({length:10},(_,i)=><g key={i} visibility="hidden"><CarvingSpark r={3.5} legendary={visual.rarity==="legendary"}/></g>)}</g>}
              <g ref={activeGleam} visibility="hidden" className="bebrave-contact"><circle className="bebrave-contact-ring" r="11"/><path className="bebrave-contact-ticks" d="M-17 0h5M12 0h5M0 -17v5M0 12v5"/><circle className="bebrave-contact-core" r="2.2"/></g>
              </>}
            </BeBraveCarving></g>}
            {visibleDrawings.map(d=><g key={d.id} className="bebrave-published-drawing" data-sequence={d.publicSequence} data-drawing-id={d.id}><BeBraveCarving strokes={d.strokes} color={d.color} rarity={d.rarity} seed={d.effectSeed} effectId={d.effectId}/></g>)}
          </svg>
          {mode==="fallen"&&<div className="bebrave-fallen-cut" aria-hidden="true"/>}
        </div>
      </div>
    </div>

  </section>;
}
