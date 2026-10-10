"use client";

import { useEffect } from "react";
import { approachLight, followLight, materialLight, panelLight, materialPose, glassReflection, materialGeometryEvent } from "@/lib/material-light";
import { orientationAPI, recenterTiltEvent, tiltLight, tiltStatusEvent, type TiltReading } from "@/lib/phone-tilt";

const surfacesSelector = "[data-material-surface],[data-light-source],.calendar-dialog,.preferences-dialog,.zacky-c-preview,.bebrave-human-modal,.bebrave-timer,.folly-latest .quote-leaf,.leaf-reader .reader-leaf,.button,.text-link,.stage-button,.rail-controls button,.feed-copy button,.project-description-toggle,.portrait-frame,.tactile-photo,.preference-control,.bebrave-rpg-dialogue,.bebrave-home-button";

const panelsSelector = ".bebrave-human-modal,.desk-section > .shell,.bio-section > .life-section,.shoutouts-section > .shell,.about-biography > .shell,.folly-panel,.shoutout-card,.event-callout,.writing-panel,.bebrave-rpg-dialogue";

export function PointerLight() {
  useEffect(() => {
    const surfaces = new Set<HTMLElement>(), visible = new Set<HTMLElement>(), rectangles = new Map<HTMLElement, DOMRect>();
    let x=-1000,y=-1000,released=false,source:"mouse"|"tilt"="mouse",reference:TiltReading|null=null,targetX=0,targetY=0,significantX=0,significantY=0,listening=false,orientationAngle=0,intensity=0,previousTime=0,frame=0,collectionFrame=0,dirty=true,hasLight=false;
    const coarse=matchMedia("(pointer: coarse)"),reduced=()=>document.documentElement.dataset.effects==="reduced";
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){const element=entry.target as HTMLElement;if(entry.isIntersecting)visible.add(element);else{visible.delete(element);resetSurface(element);}}dirty=true;start();},{rootMargin:"80px"});
    const resize=new ResizeObserver(()=>{dirty=true;start();});
    function paint(element:HTMLElement,bounds:DOMRect,strength:number){
      const light=element.dataset.materialKind==="panel"?panelLight(bounds,x,y,strength,window.innerHeight):materialLight(bounds,x,y,strength);
      const px=(value:number)=>`${value.toFixed(2)}px`;
      element.style.setProperty("--light-strength",light.strength.toFixed(3));element.style.setProperty("--light-x",px(light.lightX));element.style.setProperty("--light-y",px(light.lightY));
      // Mouse movement lights rims/borders without moving the physical cast. Tilt moves both.
      const dynamicCast=source==="tilt";
      element.style.setProperty("--shadow-x",dynamicCast?px(light.shadowX):"0px");element.style.setProperty("--shadow-y",dynamicCast?px(light.shadowY):"0px");element.style.setProperty("--shadow-blur",dynamicCast?px(light.blur):"0px");element.style.setProperty("--rim-x",px(light.rimX));element.style.setProperty("--rim-y",px(light.rimY));element.style.setProperty("--light-angle",`${Math.atan2(light.rimY,light.rimX)*180/Math.PI}deg`);
      element.style.setProperty("--cast-x",dynamicCast?px(light.shadowX):"0px");element.style.setProperty("--cast-y",dynamicCast?px(light.shadowY):"0px");
      if(element.hasAttribute("data-material-surface")){
        const reflection=glassReflection(bounds,x,y);
        element.style.setProperty("--glass-x",`${reflection.x.toFixed(2)}%`);element.style.setProperty("--glass-y",`${reflection.y.toFixed(2)}%`);
        if(!element.classList.contains("tactile-photo")){
          const pose=materialPose(bounds,x,y,light.strength);
          element.style.setProperty("--material-yaw",`${pose.yaw.toFixed(2)}deg`);element.style.setProperty("--material-pitch",`${pose.pitch.toFixed(2)}deg`);
          element.style.setProperty("--material-cast-x",px(pose.castX));element.style.setProperty("--material-cast-y",px(pose.castY));
        }
      }
    }
    function resetSurface(element:HTMLElement){element.style.setProperty("--light-strength","0");for(const name of ["--shadow-x","--shadow-y","--shadow-blur","--cast-x","--cast-y","--material-cast-x"])element.style.setProperty(name,"0px");for(const name of ["--rim-x","--rim-y","--material-pitch","--material-yaw","--material-cast-y"])element.style.removeProperty(name);}
    function collect(){collectionFrame=0;const next=new Set(document.querySelectorAll<HTMLElement>(surfacesSelector));for(const element of surfaces)if(!next.has(element)){observer.unobserve(element);resize.unobserve(element);surfaces.delete(element);visible.delete(element);rectangles.delete(element);}for(const element of next)if(!surfaces.has(element)){surfaces.add(element);resetSurface(element);if(!element.matches(".hero h1,.desktop-nav a"))element.dataset.material="surface";if(element.matches(panelsSelector))element.dataset.materialKind="panel";observer.observe(element);resize.observe(element);}dirty=true;start();}
    function reset(){for(const element of surfaces)resetSurface(element);cancelAnimationFrame(frame);frame=0;intensity=0;previousTime=0;}
    function tick(now:number){frame=0;if(reduced()||document.hidden){reset();return;}const target=hasLight&&!released?1:0,elapsed=previousTime?Math.min(64,now-previousTime):0;intensity=approachLight(intensity,target,elapsed);if(target){const point=followLight({x,y},{x:targetX,y:targetY},elapsed);x=point.x;y=point.y;}previousTime=now;if(dirty){for(const element of visible)rectangles.set(element,element.getBoundingClientRect());dirty=false;}for(const element of visible){const bounds=rectangles.get(element);if(bounds)paint(element,bounds,intensity);}const settling=Boolean(target)&&Math.hypot(targetX-x,targetY-y)>.2;if(Math.abs(intensity-target)>.001||settling)frame=requestAnimationFrame(tick);else previousTime=0;}
    function start(){if(!frame&&!reduced())frame=requestAnimationFrame(tick);}
    const move=(event:PointerEvent)=>{if(event.pointerType!=="mouse"||source==="tilt"||reduced())return;if(!hasLight||released){x=event.clientX;y=event.clientY;}targetX=event.clientX;targetY=event.clientY;source="mouse";released=false;hasLight=true;start();};
    const release=(event:PointerEvent)=>{if(source==="mouse"&&event.pointerType==="mouse"&&(event.type==="pointerleave"||event.type==="pointercancel")){released=true;start();}};
    const screenAngle=()=>window.screen.orientation?.angle??(window as Window&{orientation?:number}).orientation??0;
    const orientation=(event:DeviceOrientationEvent)=>{if(event.beta===null||event.gamma===null||!Number.isFinite(event.beta)||!Number.isFinite(event.gamma)||document.hidden||reduced())return;const reading={beta:event.beta,gamma:event.gamma},angle=screenAngle();if(angle!==orientationAngle){reference=null;orientationAngle=angle;}const first=reference===null;if(first){reference=reading;reset();}const point=tiltLight(reading,reference!,angle,innerWidth,innerHeight);if(!point)return;if(first){source="tilt";x=point.x;y=point.y;document.documentElement.dataset.tiltStatus="active";window.dispatchEvent(new Event(tiltStatusEvent));}targetX=point.x;targetY=point.y;if(first||Math.hypot(point.x-significantX,point.y-significantY)>2){significantX=point.x;significantY=point.y;source="tilt";hasLight=true;released=false;start();}};
    const recenter=()=>{reference=null;};
    const syncTilt=()=>{const enabled=coarse.matches&&Boolean(orientationAPI())&&document.documentElement.dataset.tilt!=="false"&&!reduced();if(enabled===listening)return;listening=enabled;reference=null;if(enabled)window.addEventListener("deviceorientation",orientation,{passive:true});else{window.removeEventListener("deviceorientation",orientation);if(source==="tilt"){reset();source="mouse";hasLight=false;released=true;}delete document.documentElement.dataset.tiltStatus;window.dispatchEvent(new Event(tiltStatusEvent));}};
    const geometry=()=>{dirty=true;start();},visibility=()=>{if(document.hidden)reset();};
    const changes=new MutationObserver(()=>{if(!collectionFrame)collectionFrame=requestAnimationFrame(collect);});
    const settings=new MutationObserver(()=>{syncTilt();if(reduced())reset();else{dirty=true;start();}});
    collect();changes.observe(document.body,{subtree:true,childList:true});settings.observe(document.documentElement,{attributes:true,attributeFilter:["data-effects","data-theme","data-timeline","data-tilt"]});syncTilt();coarse.addEventListener("change",syncTilt);window.addEventListener(recenterTiltEvent,recenter);window.addEventListener("pointermove",move,{passive:true});window.addEventListener("pointerdown",move,{passive:true});window.addEventListener("pointerup",release,{passive:true});window.addEventListener("pointercancel",release,{passive:true});document.documentElement.addEventListener("pointerleave",release,{passive:true});document.addEventListener("scroll",geometry,{passive:true,capture:true});window.addEventListener("resize",geometry,{passive:true});window.addEventListener(materialGeometryEvent,geometry,{passive:true});document.addEventListener("visibilitychange",visibility);
    return()=>{reset();cancelAnimationFrame(collectionFrame);observer.disconnect();resize.disconnect();changes.disconnect();settings.disconnect();coarse.removeEventListener("change",syncTilt);window.removeEventListener("deviceorientation",orientation);window.removeEventListener(recenterTiltEvent,recenter);window.removeEventListener("pointermove",move);window.removeEventListener("pointerdown",move);window.removeEventListener("pointerup",release);window.removeEventListener("pointercancel",release);document.documentElement.removeEventListener("pointerleave",release);document.removeEventListener("scroll",geometry,true);window.removeEventListener("resize",geometry);window.removeEventListener(materialGeometryEvent,geometry);document.removeEventListener("visibilitychange",visibility);};
  },[]);
  return null;
}
