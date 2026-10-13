/** A single shared loop sleeps when hidden/reduced or when no enchanted marks
 * are in the camera. Scrolling, live paint and model changes explicitly wake it. */
export function createEnchantmentLoop({ request, cancel, allowed, paint, interval = 16, onFrame }:{
  request:(frame:(time:number)=>void)=>number; cancel:(id:number)=>void;
  allowed:()=>boolean; paint:(time:number)=>boolean; interval?:number;
  onFrame?:(gap:number,time:number)=>void;
}) {
  let pending = 0, last = -Infinity, lastFrame = -Infinity, disposed = false;
  const frame = (time:number) => {
    pending = 0;
    if (disposed || !allowed()) return;
    if (Number.isFinite(lastFrame)) onFrame?.(time-lastFrame,time);
    lastFrame = time;
    if (time - last < interval) { wake(); return; }
    last = time;
    if (paint(time)) wake();
  };
  const wake = () => { if (!disposed && !pending && allowed()) pending = request(frame); };
  const pause = () => { if (pending) cancel(pending); pending = 0; last = -Infinity; lastFrame = -Infinity; };
  return { wake, pause, dispose:()=>{ disposed=true; pause(); } };
}
