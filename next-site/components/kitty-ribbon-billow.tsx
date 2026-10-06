"use client";

import { useEffect } from "react";

/* A deliberately slow "scarf in a breeze" motion.
   Scroll adds wind; hover adds a sustained breeze. No animation restarts. */
export function KittyRibbonBillow() {
  useEffect(() => {
    let raf=0,last=performance.now(),lastY=window.scrollY,wind=0,target=0,phase=0,hover=false;
    const reduce=()=>document.documentElement.dataset.effects==="reduced"||matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ribbon=()=>document.querySelector<SVGSVGElement>(".kitty-ribbon svg");
    const onScroll=()=>{const y=window.scrollY,d=Math.max(-60,Math.min(60,y-lastY));lastY=y;target=Math.max(-1,Math.min(1,target+d/38));};
    const onOver=(e:Event)=>{if((e.target as Element)?.closest?.(".kitty-ribbon"))hover=true;};
    const onOut=(e:Event)=>{if((e.target as Element)?.closest?.(".kitty-ribbon"))hover=false;};
    const tick=(now:number)=>{
      const dt=Math.min(40,now-last);last=now;const svg=ribbon();
      if(svg&&reduce()){svg.style.removeProperty("transform");}
      else if(svg){
        target*=Math.pow(.94,dt/16.7);
        const hoverWind=hover?.42:0;
        wind+=(target+hoverWind-wind)*Math.min(1,dt*.0045);
        phase+=dt*.00072; // ~8.7 second primary wave
        const amp=1+Math.abs(wind)*2.8+(hover?1.2:0);
        const sway=Math.sin(phase)*amp;
        const fold=Math.sin(phase*.63+1.1)*amp*.55;
        svg.style.transform=`perspective(950px) translate3d(${(wind*5+sway*.55).toFixed(2)}px,${(-Math.abs(sway)*.55).toFixed(2)}px,0) rotate(${(sway*.65).toFixed(2)}deg) rotateY(${(fold*1.5).toFixed(2)}deg) skewY(${(fold*.55).toFixed(2)}deg)`;
        svg.style.transformOrigin="50% 70%";svg.style.willChange="transform";
      }
      raf=requestAnimationFrame(tick);
    };
    addEventListener("scroll",onScroll,{passive:true});document.addEventListener("pointerover",onOver);document.addEventListener("pointerout",onOut);raf=requestAnimationFrame(tick);
    return()=>{removeEventListener("scroll",onScroll);document.removeEventListener("pointerover",onOver);document.removeEventListener("pointerout",onOut);cancelAnimationFrame(raf);const s=ribbon();s?.style.removeProperty("transform");};
  },[]);
  return null;
}
