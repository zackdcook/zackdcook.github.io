export type TiltReading = { beta: number; gamma: number };
export const tiltStatusEvent = "zack:tilt-status";
export const recenterTiltEvent = "zack:recenter-tilt";

const angleDifference = (value: number, reference: number) => ((value - reference + 540) % 360) - 180;

/** Relative to the comfortable pose; the raised side faces the light.
 * Compensate for screen rotation before mapping left/right. */
export function tiltLight(reading: TiltReading, reference: TiltReading, screenAngle: number, width: number, height: number) {
  if (![reading.beta, reading.gamma, reference.beta, reference.gamma, screenAngle, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
  const roll = angleDifference(reading.gamma, reference.gamma);
  const pitch = angleDifference(reading.beta, reference.beta);
  const angle = screenAngle * Math.PI / 180;
  const horizontal = roll * Math.cos(angle) + pitch * Math.sin(angle);
  const vertical = pitch * Math.cos(angle) - roll * Math.sin(angle);
  // Continuous falloff avoids the abrupt stop of a clamped spotlight. Small
  // natural gestures travel; extreme angles settle into a bounded grazing light.
  const curve = (value: number) => Math.tanh(value / 18);
  return { x: width * (.5 - .68 * curve(horizontal)), y: height * (.5 - .68 * curve(vertical)) };
}

type OrientationAPI = typeof DeviceOrientationEvent & { requestPermission?: (absolute?: boolean) => Promise<"granted" | "denied"> };
export function orientationAPI(): OrientationAPI | null {
  return typeof window !== "undefined" && window.isSecureContext && "DeviceOrientationEvent" in window ? window.DeviceOrientationEvent as OrientationAPI : null;
}

export const tiltPermissionKey = "zack.tilt-permission.v1";

/** Preference intent is separate from the browser's permission. One pending
 * request per browser constructor avoids competing prompts on the same tap. */
export function createTiltPermissionGate(request: () => Promise<boolean>, remember: (allowed: boolean) => void) {
  let pending: Promise<boolean> | null = null;
  return () => {
    if (pending) return pending;
    // Invoke synchronously, while the click still has transient activation.
    const asked = request();
    pending = asked.then(allowed => { remember(allowed); return allowed; }).finally(() => { pending = null; });
    return pending;
  };
}
const permissionGates = new WeakMap<OrientationAPI, () => Promise<boolean>>();
type EarlyTilt = { ask:()=>Promise<boolean>; reading:TiltReading|null; receivedAt:number; release:()=>void };
declare global { interface Window { __zackEarlyTilt?:EarlyTilt } }
/** Hand early readings and an in-flight permission request to the real painter. */
export function consumeEarlyTilt() {
  const early=window.__zackEarlyTilt;
  if(!early)return null;
  early.release();
  return early.reading && Date.now()-early.receivedAt<1000 ? early.reading : null;
}
export function tiltPermissionDenied() {
  try { return localStorage.getItem(tiltPermissionKey) === "denied"; } catch { return false; }
}

/** Call directly from a trusted click, before awaiting anything else, for iOS. */
export function requestTiltPermission(): Promise<boolean> {
  const api = orientationAPI();
  if (!api) return Promise.resolve(false);
  if (!api.requestPermission) return Promise.resolve(true);
  if(window.__zackEarlyTilt)return window.__zackEarlyTilt.ask();
  let ask = permissionGates.get(api);
  if (!ask) {
    ask = createTiltPermissionGate(() => api.requestPermission!(false).then(value => value === "granted"), allowed => {
      try { localStorage.setItem(tiltPermissionKey, allowed ? "granted" : "denied"); } catch {}
    });
    permissionGates.set(api, ask);
  }
  return ask();
}

/** Mobile default enrollment needs a real tap on Safari. Saved opt-outs and
 * denial are respected; explicit Settings activation can retry permission. */
export function enrollTiltOnTap(target: EventTarget, enabled: () => boolean, ask = requestTiltPermission, denied = tiltPermissionDenied) {
  let attempted = false;
  const activate = (event: Event) => {
    if (!event.isTrusted || attempted || !enabled() || denied()) return;
    attempted = true;
    void ask().catch(() => {});
  };
  // Capture the release before menus/navigation consume the gesture. Safari's
  // touch pointer becomes active at release; click remains a fallback.
  target.addEventListener("pointerup", activate, { passive: true, capture:true });
  target.addEventListener("click", activate, { passive: true, capture:true });
  return () => {target.removeEventListener("pointerup",activate,true);target.removeEventListener("click",activate,true);};
}

/** Before hydration, the first actual tap can request Safari permission and
 * retain the latest pose. No sensor data is stored or transmitted. */
export const tiltStartupBootstrap = `(function(){
  if(window.__zackEarlyTilt)return;
  var root=document.documentElement,api=window.DeviceOrientationEvent;
  if(!window.isSecureContext||!api||!matchMedia('(pointer:coarse)').matches)return;
  var pending=null,attempted=false;
  var bridge={reading:null,receivedAt:0,ask:function(){
    if(pending)return pending;
    if(!api.requestPermission)return Promise.resolve(true);
    try{pending=api.requestPermission(false).then(function(value){
      var granted=value==='granted';
      try{localStorage.setItem('zack.tilt-permission.v1',granted?'granted':'denied')}catch(e){}
      return granted;
    }).finally(function(){pending=null});return pending}catch(e){return Promise.reject(e)}
  },release:function(){
    window.removeEventListener('pointerup',activate,true);
    window.removeEventListener('click',activate,true);
    window.removeEventListener('deviceorientation',reading);
  }};
  function enabled(){return root.dataset.tilt!=='false'&&root.dataset.effects!=='reduced'}
  function reading(event){
    if(!enabled()||!Number.isFinite(event.beta)||!Number.isFinite(event.gamma)||event.beta===null||event.gamma===null)return;
    bridge.reading={beta:event.beta,gamma:event.gamma};bridge.receivedAt=Date.now();
  }
  function activate(event){
    if(!event.isTrusted||attempted||!enabled())return;
    try{if(localStorage.getItem('zack.tilt-permission.v1')==='denied')return}catch(e){}
    attempted=true;bridge.ask().catch(function(){});
  }
  window.__zackEarlyTilt=bridge;
  window.addEventListener('pointerup',activate,{capture:true,passive:true});
  window.addEventListener('click',activate,{capture:true,passive:true});
  window.addEventListener('deviceorientation',reading,{passive:true});
})();`;
