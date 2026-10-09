/** A small, cancellable cache whose lifetime is one tree revision/snapshot. */
export class SectionCache<T> {
  private values=new Map<number,T>();
  private pending=new Map<number,{controller:AbortController;promise:Promise<T>}>();
  private lower=0;
  private upper=0;
  constructor(private fetchSection:(section:number,signal:AbortSignal)=>Promise<T>){}
  setWindow(first:number,last:number){
    this.lower=Math.max(0,first-3);this.upper=last+3;
    for(const key of this.values.keys())if(!this.contains(key))this.values.delete(key);
    for(const [key,entry] of this.pending)if(!this.contains(key)){entry.controller.abort();this.pending.delete(key);}
  }
  private contains(key:number){return key>=this.lower&&key<=this.upper;}
  load(section:number):Promise<T>{
    if(!this.contains(section))return Promise.reject(new DOMException("Outside viewport","AbortError"));
    if(this.values.has(section))return Promise.resolve(this.values.get(section)!);
    const pending=this.pending.get(section);if(pending)return pending.promise;
    const controller=new AbortController();
    const promise=this.fetchSection(section,controller.signal).then(value=>{
      if(!controller.signal.aborted&&this.contains(section))this.values.set(section,value);
      return value;
    }).finally(()=>{if(this.pending.get(section)?.controller===controller)this.pending.delete(section);});
    this.pending.set(section,{controller,promise});return promise;
  }
  dispose(){for(const entry of this.pending.values())entry.controller.abort();this.pending.clear();this.values.clear();}
  get size(){return this.values.size;}
  get pendingCount(){return this.pending.size;}
}
