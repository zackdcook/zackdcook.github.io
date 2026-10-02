"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback,useEffect,useMemo,useRef,useState,type CSSProperties } from "react";
import { TreeSection } from "@/components/tree-section";
import { CarvingDetails } from "@/components/carving-details";
import { SignatureArt } from "@/components/signature-art";
import { treeWidth,treeSectionHeight,carvingWidth,carvingHeight,fallenBaseUnits,snap,validPlacement,footprintAt,collides,type TreeState } from "@/lib/tree-space";
import type { GuestEntry } from "@/lib/guestbook";
import type { PlacementDraft } from "@/components/guestbook-form";
import { myCarvingStatus } from "@/app/actions/submissions";
import { usePreferences } from "@/components/site-preferences";
import { carvingBookmarkKey } from "@/lib/local-timeline";

const GuestbookForm=dynamic(()=>import("@/components/guestbook-form").then(module=>module.GuestbookForm),{ssr:false,loading:()=> <p className="tree-status">Opening the carving desk…</p>});
const bookmarkKey=carvingBookmarkKey;
type SearchResult=Pick<GuestEntry,"id"|"display_name"|"public_sequence"|"y"|"created_at">;

export function CypressTree({initialState,initialEntries,enabled,siteKey,fallen=false,cutoff,initialSigning=false}:{initialState:TreeState;initialEntries:GuestEntry[];enabled:boolean;siteKey:string;fallen?:boolean;cutoff?:number;initialSigning?:boolean}) {
 const {timeline,changeTimeline}=usePreferences();
 const snapshotQuery=cutoff===undefined?"":"&cutoff="+cutoff;
 const [tree,setTree]=useState(initialState),[scale,setScale]=useState(1),[range,setRange]=useState<[number,number]>([Math.max(0,Math.floor((initialState.height-864)/864)-1),Math.floor(initialState.height/864)]);
 const [entries,setEntries]=useState(initialEntries),[error,setError]=useState(""),[signing,setSigning]=useState(initialSigning&&!fallen),[draft,setDraft]=useState<PlacementDraft|null>(null),[occupied,setOccupied]=useState<number[]>([]);
 const [query,setQuery]=useState(""),[results,setResults]=useState<SearchResult[]>([]),[searching,setSearching]=useState(false),[bookmark,setBookmark]=useState<string|null>(null),[notice,setNotice]=useState(""),[highlight,setHighlight]=useState("");
 const world=useRef<HTMLDivElement>(null),scene=useRef<HTMLDivElement>(null),horizontal=useRef<HTMLDivElement>(null),ghost=useRef<HTMLDivElement>(null),minimap=useRef<HTMLInputElement>(null);
 const cache=useRef(new Map<number,GuestEntry[]>()),inflight=useRef(new Map<number,Promise<GuestEntry[]>>());
 const currentRange=useRef(range),worldTop=useRef(0),currentScale=useRef(1),scrollFrame=useRef(0),paintFrame=useRef(0),pendingPoint=useRef<{x:number;y:number}|null>(null),pointerStart=useRef<{x:number;y:number;id:number}|null>(null),dragging=useRef(false),ready=useRef(false);
 const draftRef=useRef(draft),occupiedRef=useRef(new Set<number>()),treeRef=useRef(tree),highlightTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 draftRef.current=draft;treeRef.current=tree;occupiedRef.current=new Set(occupied);
 const sections=useMemo(()=>Array.from({length:range[1]-range[0]+1},(_,i)=>range[0]+i),[range]);
 const load=useCallback((section:number):Promise<GuestEntry[]>=>{
   if(cache.current.has(section))return Promise.resolve(cache.current.get(section)!);
   if(inflight.current.has(section))return inflight.current.get(section)!;
   const promise=(async()=>{
     let list:GuestEntry[]=[],cursor="";
     do{
       const response=await fetch("/api/tree?section="+section+cursor+snapshotQuery);
       const data=await response.json();if(!response.ok)throw Error(data.error);
       list.push(...data.entries);
       const last=data.entries.at(-1);
       cursor=data.more&&last?"&afterY="+last.y+"&afterId="+last.id:"";
     }while(cursor);
     cache.current.set(section,list);return list;
   })().finally(()=>inflight.current.delete(section));
   inflight.current.set(section,promise);return promise;
 },[snapshotQuery]);
 useEffect(()=>{
   let cancelled=false;
   Promise.all(sections.map(load)).then(groups=>{if(!cancelled){setEntries([...new Map(groups.flat().map(entry=>[entry.id,entry])).values()]);setError("");}}).catch(()=>{if(!cancelled)setError("That part of the tree couldn’t load. Try again.");});
  const max=Math.floor(tree.height/treeSectionHeight);
   for(const neighbor of [range[0]-1,range[1]+1])if(neighbor>=0&&neighbor<=max)load(neighbor).catch(()=>{});
   // Bounded cache as well as bounded DOM; long histories don't accumulate forever.
   for(const key of cache.current.keys())if(key<range[0]-3||key>range[1]+3)cache.current.delete(key);
   return()=>{cancelled=true;};
 },[range,sections,load,tree.height]);
 const navigate=useCallback((y:number)=>{
   const motion=document.documentElement.dataset.effects==="reduced";
   if(fallen&&horizontal.current)horizontal.current.scrollTo({left:Math.max(0,(treeRef.current.height+fallenBaseUnits-y)*currentScale.current-horizontal.current.clientWidth*.42),behavior:motion?"instant":"smooth"});
   else window.scrollTo({top:Math.max(0,worldTop.current+y*currentScale.current-window.innerHeight*.42),behavior:motion?"instant":"smooth"});
 },[fallen]);
 const refresh=useCallback(async()=>{
   if(fallen)return;
   const response=await fetch("/api/tree?placement=1",{cache:"no-store"}),data=await response.json();
   if(!response.ok)throw Error(data.error);
   setTree(data.state);setOccupied(data.occupied);
 },[fallen]);
 useEffect(()=>{
   const el=world.current;if(!el)return;
   const measure=()=>{const rect=el.getBoundingClientRect();worldTop.current=rect.top+window.scrollY;const next=fallen&&horizontal.current?horizontal.current.clientHeight/treeWidth:rect.width/treeWidth;currentScale.current=next;setScale(next);};
   const resize=new ResizeObserver(measure);resize.observe(fallen&&horizontal.current?horizontal.current:el);measure();
   function tick(){
     scrollFrame.current=0;
     const viewport=fallen&&horizontal.current?horizontal.current.clientWidth:window.innerHeight;
     const local=fallen&&horizontal.current?Math.max(0,treeRef.current.height+fallenBaseUnits-horizontal.current.scrollLeft/currentScale.current-viewport/currentScale.current):Math.max(0,(window.scrollY-worldTop.current)/currentScale.current);
     const center=Math.floor((local+viewport/currentScale.current*.5)/treeSectionHeight);
     const max=Math.max(0,Math.ceil(treeRef.current.height/treeSectionHeight)-1);
     const next:[number,number]=[Math.max(0,Math.min(max,center)-2),Math.min(max,center+2)];
     if(next[0]!==currentRange.current[0]||next[1]!==currentRange.current[1]){currentRange.current=next;setRange(next);}
     const ratio=Math.min(1,Math.max(0,local/Math.max(1,treeRef.current.height-viewport/currentScale.current)));
     if(minimap.current)minimap.current.value=String(Math.round(ratio*100));
     if(scene.current&&document.documentElement.dataset.effects!=="reduced"){
       scene.current.style.setProperty("--swamp-drift",(-Math.sin((window.scrollY-worldTop.current)/2500)*35).toFixed(2)+"px");
       scene.current.style.setProperty("--moss-drift",(-Math.sin((window.scrollY-worldTop.current)/1100)*65).toFixed(2)+"px");
     }
   }
   const scroll=()=>{if(!scrollFrame.current)scrollFrame.current=requestAnimationFrame(tick);};
   const scrolling=fallen&&horizontal.current?horizontal.current:window;
   scrolling.addEventListener("scroll",scroll,{passive:true});window.addEventListener("resize",measure,{passive:true});
   let initialFrame=0;
   if(!ready.current){ready.current=true;initialFrame=requestAnimationFrame(()=>{if(fallen){horizontal.current?.scrollTo({left:0,behavior:"instant"});el.scrollIntoView({block:"center",behavior:"instant"});}else window.scrollTo({top:Math.max(0,worldTop.current+treeRef.current.height*currentScale.current-window.innerHeight*.85),behavior:"instant"});tick();});}
   scroll();
   return()=>{resize.disconnect();scrolling.removeEventListener("scroll",scroll);window.removeEventListener("resize",measure);cancelAnimationFrame(scrollFrame.current);cancelAnimationFrame(initialFrame);};
 },[fallen]);
 useEffect(()=>{
   try{const id=localStorage.getItem(bookmarkKey);if(id&&/^[a-f0-9-]{36}$/i.test(id))setBookmark(id);}catch{}
   if(!fallen)myCarvingStatus().then(status=>{
     if(!status)return;setBookmark(status.id);
     if(status.status==="approved"){
       try{if(localStorage.getItem(bookmarkKey+".seen")!==status.id)setNotice("Your carving is on the tree.");}catch{}
     }else if(status.status==="pending")setNotice("Your spot is reserved while your carving waits for approval.");
     else if(status.status==="expired")setNotice("Your reservation expired before review. You can choose a fresh patch and sign again.");
   }).catch(()=>{});
   return()=>{if(highlightTimer.current)clearTimeout(highlightTimer.current);cancelAnimationFrame(paintFrame.current);};
 },[fallen]);
 useEffect(()=>{const id=new URL(window.location.href).searchParams.get("id");if(id&&/^[a-f0-9-]{36}$/i.test(id))find(id);},[]);
 useEffect(()=>{
   if(!ghost.current||!draft||draft.x===null||draft.y===null)return;
   ghost.current.style.left=draft.x+"px";ghost.current.style.top=draft.y+"px";ghost.current.hidden=false;
   ghost.current.dataset.valid=String(validPlacement(draft.x,draft.y,tree)&&!collides(footprintAt(draft.mask,draft.x,draft.y),occupiedRef.current));
 },[draft,tree]);
 function paint(){
   paintFrame.current=0;const p=pendingPoint.current,d=draftRef.current,g=ghost.current;if(!p||!d||!g)return;
   g.hidden=false;g.style.left=p.x+"px";g.style.top=p.y+"px";
   g.dataset.valid=String(validPlacement(p.x,p.y,treeRef.current)&&!collides(footprintAt(d.mask,p.x,p.y),occupiedRef.current));
 }
 function preview(clientX:number,clientY:number){
   const rect=world.current!.getBoundingClientRect();
   pendingPoint.current={x:snap((clientX-rect.left)/currentScale.current-carvingWidth/2),y:snap((clientY-rect.top)/currentScale.current-carvingHeight/2)};
   if(!paintFrame.current)paintFrame.current=requestAnimationFrame(paint);
 }
 function commit(){const p=pendingPoint.current;if(p&&draftRef.current)setDraft({...draftRef.current,x:p.x,y:p.y});}
 async function find(id:string){
   try{
     setError("");const response=await fetch("/api/tree?id="+encodeURIComponent(id)+snapshotQuery),data=await response.json();
     if(!response.ok)throw Error(data.error);
     if(!data.entry){setNotice("That carving isn’t public yet. It may still be waiting for approval.");return;}
     const entry=data.entry as GuestEntry;await load(Math.floor(entry.y/treeSectionHeight));navigate(entry.y);
     setHighlight(id);if(highlightTimer.current)clearTimeout(highlightTimer.current);highlightTimer.current=setTimeout(()=>setHighlight(""),3500);
   }catch{setError("That carving couldn’t load just now. Please try again.");}
 }
 async function search(event:React.FormEvent){event.preventDefault();setSearching(true);try{const response=await fetch("/api/tree?q="+encodeURIComponent(query)+snapshotQuery);const data=await response.json();if(!response.ok)throw Error();setResults(data.results);setError(data.results.length?"":"No public carvings with that name yet.");}catch{setError("Search couldn’t load. Please try again.");}finally{setSearching(false);}}
 const selectionValid=Boolean(draft&&draft.x!==null&&draft.y!==null&&validPlacement(draft.x,draft.y,tree)&&!collides(footprintAt(draft.mask,draft.x,draft.y),new Set(occupied)));
 return <div className={"cypress-experience"+(fallen?" fallen-experience":"")}>
  <nav className="tree-controls" aria-label="Explore the guestbook">
   <button className="button button-small" onClick={()=>navigate(tree.oldest?.y??0)}>↑ Oldest{tree.oldest?" · #"+tree.oldest.public_sequence:""}</button>
   <button className="button button-small" onClick={()=>navigate(tree.newest?.y??tree.height-300)}>↓ Newest{tree.newest?" · #"+tree.newest.public_sequence:""}</button>
   {bookmark&&<button className="button button-small" onClick={()=>find(bookmark)}>Find My Carving</button>}
   {!fallen&&!timeline.carvingId&&<button className="button" onClick={()=>{setSigning(true);refresh().catch(()=>{});}}>Sign My Guestbook</button>}
   <Link className="button button-small" href={"/tree/entries"+(fallen?"?cutoff="+cutoff:"")}>Readable guest list</Link>
  </nav>
  <div className="tree-search shell"><form onSubmit={search}><label htmlFor="carving-search">Find a name on the tree</label><div><input id="carving-search" value={query} maxLength={40} onChange={e=>setQuery(e.target.value)} type="search"/><button className="button button-small" disabled={searching||!query.trim()}>{searching?"Searching…":"Search"}</button></div></form>
   {results.length>0&&<ul>{results.map(result=><li key={result.id}><button className="button button-small" onClick={()=>{find(result.id);setResults([]);}}>{result.display_name} · #{result.public_sequence}</button></li>)}</ul>}
   {notice&&<p className="tree-notice" role="status">{notice}{bookmark&&notice.includes("on the tree")&&<button className="button button-small" onClick={()=>find(bookmark)}>Find My Carving</button>}<button className="notice-dismiss" aria-label="Dismiss message" onClick={()=>{setNotice("");try{if(bookmark)localStorage.setItem(bookmarkKey+".seen",bookmark);}catch{}}}>×</button></p>}
   {error&&<p role="status">{error}<button className="button button-small" onClick={()=>{cache.current.clear();setRange([...range]);}}>Try again</button></p>}
  </div>
  {fallen&&<p className="fallen-instruction shell">The same tree. Every mark where it was. Scroll sideways to follow its history.</p>}
  <div ref={scene} className={"tree-scene"+(draft?" is-placing":"")} style={{"--tree-scale":scale} as CSSProperties}>
   <div className="swamp-distance" aria-hidden="true"/><div className="swamp-middle" aria-hidden="true"/><div className="moss-foreground" aria-hidden="true"/>
   <label className="tree-minimap"><span className="sr-only">Position on the tree, oldest to newest</span><input ref={minimap} type="range" min="0" max="100" defaultValue="100" onChange={e=>navigate(Number(e.target.value)/100*tree.height)} aria-label="Position on the tree, oldest to newest"/></label>
   <div ref={horizontal} className={fallen?"fallen-scroll":"standing-scroll"} tabIndex={fallen?0:undefined} role={fallen?"region":undefined} aria-label={fallen?"Fallen tree. Scroll horizontally, or use Left and Right.":undefined}>
   <div ref={world} className="tree-world" style={fallen?{width:(tree.height+fallenBaseUnits)*scale,height:treeWidth*scale}:{height:tree.height*scale}}
    onPointerDown={e=>{if(!draft)return;pointerStart.current={x:e.clientX,y:e.clientY,id:e.pointerId};if((e.target as Element).closest(".placement-ghost")){dragging.current=true;e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();}preview(e.clientX,e.clientY);}}
    onPointerMove={e=>{if(draft&&(e.pointerType==="mouse"||dragging.current))preview(e.clientX,e.clientY);}}
    onPointerUp={e=>{if(!draft)return;const start=pointerStart.current;if(dragging.current||(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<8)){preview(e.clientX,e.clientY);commit();}dragging.current=false;pointerStart.current=null;}}
    onPointerCancel={()=>{dragging.current=false;pointerStart.current=null;}}>
    {fallen&&<img className="fallen-origin" src="/images/cypress-felled-base.webp" alt="A chopped cypress stump beside the severed base of the fallen tree" width="1200" height="800" style={{width:fallenBaseUnits*scale*1.9}}/>}
    <div className="tree-space" style={{width:treeWidth,height:tree.height,transform:fallen?`translateX(${(tree.height+fallenBaseUnits)*scale}px) rotate(90deg) scale(${scale})`:"scale("+scale+")"}}>
     {sections.map(section=><TreeSection key={section} section={section}/>)}
     {entries.map(entry=><CarvingDetails key={entry.id} entry={entry} emphasized={highlight===entry.id}/>)}
     {!tree.approved_count&&!draft&&<div className="tree-first-note" style={{top:tree.active_bottom-520}}><p>No carvings yet.</p><p>There’s a little patch of history waiting for you.</p></div>}
     {draft&&<><div className="active-bark-hint" style={{top:tree.active_top,height:tree.active_bottom-tree.active_top}} aria-hidden="true"/><div ref={ghost} hidden={draft.x===null} className="placement-ghost" data-valid={selectionValid} style={{left:draft.x??0,top:draft.y??0,width:carvingWidth,height:carvingHeight}}><SignatureArt name={draft.name} note={draft.note} mode={draft.mode} font={draft.font} strokes={draft.strokes} geometry={draft.geometry} carved/><span>Preview · awaiting approval</span></div></>}
    </div>
   </div>
   </div>
   <div className="tree-frontier-label"><p>{fallen?"A moment kept in bark.":"The newest five feet."}</p><span>{tree.approved_count} permanent {tree.approved_count===1?"mark":"marks"}{fallen?" · this local tree has stopped growing.":" · a foot of new bark for every two guests."}</span></div>
  </div>
  {signing&&!fallen&&<GuestbookForm enabled={enabled} siteKey={siteKey} open={signing} onClose={()=>setSigning(false)} tree={tree} occupied={occupied} draft={draft} onPlacement={setDraft} onNavigate={navigate} onRefresh={refresh} onSubmitted={id=>{changeTimeline({...timeline,carvingId:id});setBookmark(id);setNotice("Your spot is reserved while your carving waits for approval.");}}/>}
  <p className="tree-afterword shell">Every mark stays beside its neighbors. New bark grows below; history stays put. <Link href="/privacy">A note about privacy</Link>.</p>
 </div>;
}
