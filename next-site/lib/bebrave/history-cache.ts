import type { BeBravePublicDrawing,BeBraveTreeState } from "../bebrave-types";
import { BEBRAVE_SECTION_HEIGHT } from "../bebrave-types";
import { carvingBounds } from "./carving-inspection";
import { unpackDrawing,type PackedDrawing } from "./completed-strokes";

type FetchWindow=(first:number,last:number,before:number|undefined,signal:AbortSignal)=>Promise<{drawings:Array<BeBravePublicDrawing|PackedDrawing>;more:boolean;nextBefore:number|null}>;
/** One immutable snapshot, decoded once, shared by entry preloading and Admire.
 * Pages appear progressively; flinging never builds an unbounded request queue. */
export class TreeHistoryCache {
  private drawings=new Map<string,{drawing:BeBravePublicDrawing;top:number;bottom:number}>();
  private ready=new Set<number>();
  private requests=new Map<string,{first:number;last:number;controller:AbortController;promise:Promise<void>}>();
  private listeners=new Set<()=>void>();
  private first=0;private last=0;
  constructor(private fetchWindow:FetchWindow){}
  subscribe(listener:()=>void){this.listeners.add(listener);return()=>{this.listeners.delete(listener);};}
  setWindow(first:number,last:number){
    this.first=Math.max(0,first-3);this.last=last+3;
    for(const n of this.ready)if(n<this.first||n>this.last)this.ready.delete(n);
    for(const [id,d] of this.drawings)if(d.bottom<this.first*BEBRAVE_SECTION_HEIGHT||d.top>(this.last+1)*BEBRAVE_SECTION_HEIGHT)this.drawings.delete(id);
    for(const [key,r] of this.requests)if(r.last<this.first||r.first>this.last){r.controller.abort();this.requests.delete(key);}
  }
  read(first:number,last:number){
    return [...this.drawings.values()].filter(d=>d.bottom>=first*BEBRAVE_SECTION_HEIGHT&&d.top<=(last+1)*BEBRAVE_SECTION_HEIGHT).map(d=>d.drawing).sort((a,b)=>b.publicSequence-a.publicSequence);
  }
  load(first:number,last:number):Promise<void>{
    if(Array.from({length:last-first+1},(_,i)=>first+i).every(n=>this.ready.has(n)))return Promise.resolve();
    const key=`${first}:${last}`,pending=this.requests.get(key);if(pending)return pending.promise;
    while(this.requests.size>=2){const [old,r]=this.requests.entries().next().value!;r.controller.abort();this.requests.delete(old);}
    const controller=new AbortController();
    const promise=(async()=>{
      let before:number|undefined;
      do{
        const page=await this.fetchWindow(first,last,before,controller.signal);
        if(controller.signal.aborted)return;
        for(const packed of page.drawings){
          if(this.drawings.has(packed.id))continue;
          const drawing=unpackDrawing(packed);
          const bounds=carvingBounds(drawing,260),bottom=bounds.top+bounds.height;
          if(bottom>=this.first*BEBRAVE_SECTION_HEIGHT&&bounds.top<=(this.last+1)*BEBRAVE_SECTION_HEIGHT)this.drawings.set(drawing.id,{drawing,top:bounds.top,bottom});
        }
        for(const listener of this.listeners)listener();
        const next=page.more?page.nextBefore:null;
        if(next!==null&&before!==undefined&&next>=before)throw Error("Invalid history cursor");
        before=next??undefined;
      }while(before!==undefined);
      for(let n=Math.max(first,this.first);n<=Math.min(last,this.last);n++)this.ready.add(n);
    })().finally(()=>{if(this.requests.get(key)?.controller===controller)this.requests.delete(key);});
    this.requests.set(key,{first,last,controller,promise});return promise;
  }
  cancel(){for(const r of this.requests.values())r.controller.abort();this.requests.clear();}
  dispose(){this.cancel();this.drawings.clear();this.ready.clear();this.listeners.clear();}
  get size(){return this.drawings.size;}
  get pendingCount(){return this.requests.size;}
}

const snapshots=new Map<number,TreeHistoryCache>();
export function treeHistory(state:BeBraveTreeState,cutoff=state.latestSequence){
  let cache=snapshots.get(cutoff);
  if(!cache){
    cache=new TreeHistoryCache(async(first,last,before,signal)=>{
      const q=new URLSearchParams({from:String(first),to:String(last),format:"compact-v1",cutoff:String(cutoff)});
      if(before!==undefined)q.set("before",String(before));
      const response=await fetch(`/api/bebrave/tree?${q}`,{signal});const data=await response.json();
      if(!response.ok)throw Error(data.error||"Bark could not load");
      return data;
    });
    snapshots.set(cutoff,cache);
    if(snapshots.size>2){const [old,value]=snapshots.entries().next().value!;value.dispose();snapshots.delete(old);}
  }
  return cache;
}

export function initialHistoryWindow(height:number,viewport:number,scale:number):[number,number]{
  const last=Math.max(0,Math.ceil(height/BEBRAVE_SECTION_HEIGHT)-1);
  return [Math.max(0,last-Math.ceil(viewport/Math.max(.05,scale)/BEBRAVE_SECTION_HEIGHT)-1),last];
}
