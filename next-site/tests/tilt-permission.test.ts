import { test } from "node:test";
import assert from "node:assert/strict";
import { createTiltPermissionGate, enrollTiltOnTap } from "../lib/phone-tilt";
import { tiltStartupBootstrap } from "../lib/phone-tilt";
import { runInNewContext } from "node:vm";

function earlyPhone({off=false,reduced=false,denied=false}={}) {
  const listeners=new Map<string,Set<(event:Record<string,unknown>)=>void>>();
  const saved=new Map<string,string>();if(denied)saved.set('zack.tilt-permission.v1','denied');
  let calls=0;let resolve!:(value:string)=>void;
  const window={isSecureContext:true,DeviceOrientationEvent:{requestPermission:()=>{calls++;return new Promise<string>(done=>{resolve=done;});}},
    addEventListener:(type:string,listener:(event:Record<string,unknown>)=>void)=>{if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type)!.add(listener);},
    removeEventListener:(type:string,listener:(event:Record<string,unknown>)=>void)=>listeners.get(type)?.delete(listener),
    __zackEarlyTilt:undefined as undefined|{ask:()=>Promise<boolean>;reading:{beta:number;gamma:number}|null;release:()=>void},
  };
  runInNewContext(tiltStartupBootstrap,{window,document:{documentElement:{dataset:{tilt:off?'false':'true',effects:reduced?'reduced':'full'}}},matchMedia:()=>({matches:true}),
    localStorage:{getItem:(key:string)=>saved.get(key),setItem:(key:string,value:string)=>saved.set(key,value)}});
  return {window,saved,listeners,dispatch:(type:string,event:Record<string,unknown>)=>listeners.get(type)?.forEach(listener=>listener(event)),calls:()=>calls,resolve:(value:string)=>resolve(value)};
}

test("first trusted phone tap enrolls before hydration, coalesces with Settings and retains an immediate pose",async()=>{
  const phone=earlyPhone();
  phone.dispatch('click',{isTrusted:false});assert.equal(phone.calls(),0);
  phone.dispatch('pointerup',{isTrusted:true});assert.equal(phone.calls(),1);
  phone.dispatch('click',{isTrusted:true});assert.equal(phone.calls(),1);
  const pending=phone.window.__zackEarlyTilt!.ask();assert.equal(phone.calls(),1);
  phone.resolve('granted');assert.equal(await pending,true);
  phone.dispatch('deviceorientation',{beta:20,gamma:-7});
  assert.equal(phone.window.__zackEarlyTilt!.reading?.beta,20);
  assert.equal(phone.window.__zackEarlyTilt!.reading?.gamma,-7);
  assert.deepEqual([...phone.saved.entries()],[['zack.tilt-permission.v1','granted']]);
  phone.window.__zackEarlyTilt!.release();
  assert.equal([...phone.listeners.values()].reduce((n,set)=>n+set.size,0),0);
});

test("early enrollment respects saved opt-out, reduced motion and permission denial",()=>{
  for(const options of [{off:true},{reduced:true},{denied:true}]){
    const phone=earlyPhone(options);phone.dispatch('pointerup',{isTrusted:true});phone.dispatch('click',{isTrusted:true});assert.equal(phone.calls(),0);
  }
});

test("tilt permission invokes synchronously, coalesces concurrent requests and records denial separately", async () => {
  let calls = 0, resolve!: (value: boolean) => void;
  const remembered: boolean[] = [];
  const ask = createTiltPermissionGate(() => { calls++; return new Promise<boolean>(done => { resolve = done; }); }, allowed => remembered.push(allowed));
  const first = ask();
  assert.equal(calls, 1, "permission must start before transient activation is lost");
  assert.equal(ask(), first);
  resolve(false);
  assert.equal(await first, false);
  assert.deepEqual(remembered, [false]);
  const retry = ask(); resolve(true);
  assert.equal(await retry, true);
  assert.equal(calls, 2);
});

test("failed sensor permission can be retried, synthetic clicks never request sensor access", async () => {
  let count = 0;
  const ask = createTiltPermissionGate(() => { count++; return Promise.reject(new Error("permission")); }, () => { throw Error("must not remember a transport failure"); });
  await assert.rejects(ask()); await assert.rejects(ask());
  assert.equal(count, 2);
  const events = new EventTarget(); let prompts = 0;
  const stop = enrollTiltOnTap(events, () => true, async () => { prompts++; return true; });
  events.dispatchEvent(new Event("click"));
  assert.equal(prompts, 0);
  stop();
});
