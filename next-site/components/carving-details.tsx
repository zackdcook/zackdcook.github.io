"use client";
import { useEffect,useRef,useState } from "react";
import type { GuestEntry } from "@/lib/guestbook";
import { SignatureArt } from "@/components/signature-art";
export function CarvingDetails({entry,emphasized=false}:{entry:GuestEntry;emphasized?:boolean}) {
 const [open,setOpen]=useState(false),[date,setDate]=useState(entry.created_at.slice(0,10));
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const root=useRef<HTMLDivElement>(null);
 const clear=()=>{if(timer.current) clearTimeout(timer.current);timer.current=null;};
 useEffect(()=>{setDate(new Date(entry.created_at).toLocaleString(undefined,{month:"long",day:"numeric",year:"numeric",hour:"numeric",minute:"2-digit"}));return clear;},[entry.created_at]);
 useEffect(()=>{if(!open)return;const close=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false);};document.addEventListener("pointerdown",close);return()=>document.removeEventListener("pointerdown",close);},[open]);
 return <div ref={root} className={"cypress-carving"+(emphasized?" carving-found":"")} style={{left:entry.x,top:entry.y,width:entry.width,height:entry.height}} onPointerEnter={e=>{if(e.pointerType==="mouse"){clear();timer.current=setTimeout(()=>setOpen(true),450);}}} onPointerLeave={e=>{clear();if(e.pointerType==="mouse")setOpen(false);}}>
   <button className="carving-inspect" aria-label={`${entry.display_name}, guest number ${entry.public_sequence}. ${entry.note}. Signed ${date}`} aria-expanded={open} onFocus={()=>setOpen(true)} onBlur={e=>{if(!e.currentTarget.parentElement?.contains(e.relatedTarget))setOpen(false);}} onClick={()=>setOpen(value=>!value)} onKeyDown={e=>{if(e.key==="Escape")setOpen(false);}}>
     <SignatureArt name={entry.display_name} note={entry.note} mode={entry.mode} font={entry.font} strokes={entry.strokes} geometry={entry.geometry} carved/>
   </button>
   {open&&<div className="carving-info" role="status"><strong>{entry.display_name}</strong><time dateTime={entry.created_at}>{date}</time>{entry.note&&<span>{entry.note}</span>}<small>Guest #{entry.public_sequence}</small></div>}
 </div>;
}
