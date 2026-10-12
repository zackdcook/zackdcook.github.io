/** Local, Preview-only observations. No telemetry leaves the browser. */
export function observeBeBraveBrowser() {
  let frame=0,previous=0;
  let intervals:number[]=[];
  const tick=(now:number)=>{
    if(document.visibilityState==="visible"&&previous)intervals.push(now-previous);
    previous=now;
    if(intervals.length>=180){
      const sorted=[...intervals].sort((a,b)=>a-b);
      const memory=(performance as Performance & {memory?:{usedJSHeapSize:number}}).memory;
      const resources=performance.getEntriesByType("resource") as PerformanceResourceTiming[];
      const api=resources.filter(entry=>entry.name.includes("/api/bebrave/"));
      document.documentElement.dataset.bebraveMetrics=JSON.stringify({
        samples:intervals.length,medianMs:+sorted[90].toFixed(2),p95Ms:+sorted[171].toFixed(2),over33Ms:intervals.filter(value=>value>33).length,
        heapBytes:memory?.usedJSHeapSize??null,apiRequests:api.length,apiBodyBytes:api.reduce((sum,entry)=>sum+entry.encodedBodySize,0),
        drawings:document.querySelectorAll(".bebrave-published-drawing").length,svgElements:document.querySelectorAll(".bebrave-drawings *").length,
      });
      intervals=[];
    }
    frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);delete document.documentElement.dataset.bebraveMetrics;};
}
