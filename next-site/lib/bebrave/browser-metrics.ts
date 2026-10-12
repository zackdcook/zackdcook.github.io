/** Local, Preview-only observations. No telemetry leaves the browser. */
export function observeBeBraveBrowser() {
  let frame=0,previous=0;
  const intervals:number[]=[];
  const collect=()=>{
    const sorted=[...intervals].sort((a,b)=>a-b);
    const memory=(performance as Performance & {memory?:{usedJSHeapSize:number}}).memory;
    const resources=performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const api=resources.filter(entry=>entry.name.includes("/api/bebrave/"));
    document.documentElement.dataset.bebraveMetrics=JSON.stringify({
      samples:intervals.length,medianMs:sorted.length?+sorted[Math.floor(sorted.length*.5)].toFixed(2):null,p95Ms:sorted.length?+sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))].toFixed(2):null,over33Ms:intervals.filter(value=>value>33).length,
      visibility:document.visibilityState,focused:document.hasFocus(),heapBytes:memory?.usedJSHeapSize??null,apiRequests:api.length,apiBodyBytes:api.reduce((sum,entry)=>sum+entry.encodedBodySize,0),
      drawings:document.querySelectorAll(".bebrave-published-drawing").length,svgElements:document.querySelectorAll(".bebrave-drawings *").length,
    });
  };
  const tick=(now:number)=>{
    if(document.visibilityState==="visible"&&previous){intervals.push(now-previous);if(intervals.length>180)intervals.shift();}
    previous=now;frame=requestAnimationFrame(tick);
  };
  collect();frame=requestAnimationFrame(tick);
  const timer=setInterval(collect,5000);
  return()=>{cancelAnimationFrame(frame);clearInterval(timer);delete document.documentElement.dataset.bebraveMetrics;};
}
