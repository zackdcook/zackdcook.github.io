import { test, mock } from "node:test";
import assert from "node:assert/strict";

let mount: (() => void | (() => void)) | undefined;
mock.module("react", { exports: { useEffect: (effect: () => void | (() => void)) => { mount = effect; } } });
const { PointerLight } = await import("../components/pointer-light.tsx");

/** Exercise the actual controller with a deterministic DOM/event fixture.
 * This measures frame scheduling, culling and writes, not browser GPU/FPS. */
test("one thousand surfaces keep scroll reads culled, idle writes zero and teardown complete", () => {
  let reads = 0, writes = 0, clock = 0, serial = 0, scroll = 0;
  const frames = new Map<number, FrameRequestCallback>();
  class Style {
    properties = new Map<string,string>();
    transform = "";
    getPropertyValue(name: string) { return this.properties.get(name) || ""; }
    setProperty(name: string, value: string) { writes++; this.properties.set(name,value); }
    removeProperty(name: string) { if (this.properties.delete(name)) writes++; return ""; }
  }
  class Surface extends EventTarget {
    style = new Style();
    dataset: Record<string,string> = {};
    constructor(readonly index: number, readonly kind = "button") { super(); }
    matches(selector: string) { return selector.split(",").some(part => part === `.${this.kind}`); }
    closest() { return null; }
    querySelector() { return null; }
    hasAttribute() { return false; }
    contains(element: Surface) { return this === element; }
    getBoundingClientRect() { reads++; return {left:20,top:this.index*40-scroll,width:120,height:40}; }
  }
  class Observation {
    disconnected = false;
    constructor(readonly callback: (entries: {target:Surface;isIntersecting:boolean}[]) => void) { observers.push(this); }
    observe() {} unobserve() {}
    disconnect() { this.disconnected = true; }
  }
  class Mutation {
    disconnected = false;
    constructor(readonly callback: (records: {type:string}[]) => void) { mutations.push(this); }
    observe() {} disconnect() { this.disconnected = true; }
  }
  const observers: Observation[] = [], mutations: Mutation[] = [];
  const surfaces = Array.from({length:1000}, (_,i) => new Surface(i));
  const root = new Surface(-1), ambient = new Surface(-1), dialog = new Surface(-1,"calendar-dialog");
  surfaces.push(dialog);
  let modalOpen = false;
  const documentFixture = Object.assign(new EventTarget(), {
    documentElement: root, body: new Surface(-1), hidden: false,
    querySelectorAll: (selector: string) => selector === "[data-public-mote]" ? [] : surfaces,
    querySelector: (selector: string) => selector === "[data-public-light]" ? ambient : modalOpen ? dialog : null,
  });
  const windowFixture = Object.assign(new EventTarget(), {screen:{orientation:{angle:0}}});
  const globals = {
    document:documentFixture,window:windowFixture,Element:Surface,
    IntersectionObserver:Observation,ResizeObserver:Observation,MutationObserver:Mutation,
    innerWidth:1280,innerHeight:800,
    matchMedia:() => ({matches:false,addEventListener(){},removeEventListener(){}}),
    requestAnimationFrame:(callback:FrameRequestCallback) => { const id=++serial; frames.set(id,callback); return id; },
    cancelAnimationFrame:(id:number) => frames.delete(id),
  };
  const descriptors = new Map(Object.keys(globals).concat("scrollY").map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  for (const [key,value] of Object.entries(globals)) Object.defineProperty(globalThis,key,{value,configurable:true});
  Object.defineProperty(globalThis,"scrollY",{get:()=>scroll,configurable:true});
  const flush = () => {
    let count=0;
    while(frames.size) {
      assert.ok(++count<160,"a settled light must stop scheduling frames");
      const pending=[...frames.values()]; frames.clear(); clock+=16;
      for(const callback of pending) callback(clock);
    }
  };
  let cleanup: (() => void) | void = undefined;
  try {
    PointerLight(); cleanup=mount?.();
    observers[0].callback(surfaces.slice(0,25).concat(dialog).map(target=>({target,isIntersecting:true})));
    flush();
    assert.ok(surfaces.every(surface => surface.style.properties.size === 0), "idle initialization must preserve streamed HTML styles");
    assert.ok(surfaces.every(surface => Object.keys(surface.dataset).length === 0), "surface classification must not change server-rendered attributes");
    const pointer=Object.assign(new Event("pointermove"),{pointerType:"mouse",clientX:140,clientY:260});
    windowFixture.dispatchEvent(pointer); flush();
    reads=0; writes=0;
    for(let step=0;step<100;step++) {
      scroll+=1; documentFixture.dispatchEvent(new Event("scroll")); flush();
    }
    assert.equal(reads,2600,"scroll reads only the 26 intersecting surfaces");
    assert.ok(writes<100*26*8,"unchanged properties must not be rewritten every frame");
    reads=0; writes=0;
    documentFixture.dispatchEvent(new Event("scroll")); flush();
    assert.equal(writes,0,"stationary momentum/duplicate events cause no style writes");
    assert.equal(root.style.properties.size,0,"light motion must not invalidate inherited root styles");
    modalOpen=true; mutations[0].callback([{type:"attributes"}]); flush();
    reads=0; scroll++; documentFixture.dispatchEvent(new Event("scroll")); flush();
    assert.equal(reads,1,"a modal suspends background surface geometry work");
    assert.equal(ambient.style.getPropertyValue("--world-light-strength"),"0");
    cleanup?.(); cleanup=undefined;
    assert.equal(frames.size,0);
    assert.ok(observers.every(observer=>observer.disconnected));
    assert.ok(mutations.every(observer=>observer.disconnected));
    windowFixture.dispatchEvent(pointer);
    assert.equal(frames.size,0,"teardown removes input listeners");
  } finally {
    cleanup?.();
    for(const [key,descriptor] of descriptors) {
      if(descriptor) Object.defineProperty(globalThis,key,descriptor);
      else Reflect.deleteProperty(globalThis,key);
    }
    mock.restoreAll();
  }
});
