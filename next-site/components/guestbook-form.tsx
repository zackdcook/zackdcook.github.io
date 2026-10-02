"use client";
import { Activity,useActionState,useEffect,useRef,useState,useTransition } from "react";
import { reserveGuestbook,submitGuestbook,releaseGuestbookHold } from "@/app/actions/submissions";
import { allowedSignatureFonts,signatureFonts,initialSubmissionState,validateGuestbook,type SignatureFont,type Stroke } from "@/lib/guestbook";
import { typedGeometry,collisionMask,footprintAt,collides,validPlacement,snap,type Geometry,type FontGeometry,type TreeState } from "@/lib/tree-space";
import { SignaturePad } from "@/components/signature-pad";
import { SignatureArt } from "@/components/signature-art";
import { HumanCheck } from "@/components/human-check";
export type PlacementDraft={geometry:Geometry;mask:number[];name:string;note:string;mode:"typed"|"drawn";font:SignatureFont;strokes:Stroke[];x:number|null;y:number|null};
export const carvingStorageKey="zack.guestbook.carving.v2";
export function GuestbookForm({enabled,siteKey,open,onClose,tree,occupied,draft,onPlacement,onNavigate,onSubmitted,onRefresh}:{enabled:boolean;siteKey:string;open:boolean;onClose:()=>void;tree:TreeState;occupied:number[];draft:PlacementDraft|null;onPlacement:(draft:PlacementDraft|null)=>void;onNavigate:(y:number)=>void;onSubmitted:(id:string)=>void;onRefresh:()=>Promise<void>}) {
 const dialog=useRef<HTMLDialogElement>(null),form=useRef<HTMLFormElement>(null);
 const [step,setStep]=useState<"create"|"place"|"confirm"|"done">("create");
 const [mode,setMode]=useState<"typed"|"drawn">("typed"),[name,setName]=useState(""),[note,setNote]=useState("");
 const [font,setFont]=useState<SignatureFont>("caveat"),[strokes,setStrokes]=useState<Stroke[]>([]);
 const [geometry,setGeometry]=useState<Geometry|null>(null),[problem,setProblem]=useState(""),[reservation,setReservation]=useState("");
 const [busy,startTransition]=useTransition(),[state,action,pending]=useActionState(submitGuestbook,initialSubmissionState);
 const [reset,setReset]=useState(0);
 useEffect(()=>{if(open&&step!=="place")dialog.current?.showModal();},[open,step]);
 useEffect(()=>{
   let active=true;setGeometry(null);
   if(!name.trim())return;
   if(mode==="drawn"){setGeometry({contours:[],lines:strokes});return;}
   const controller=new AbortController();
   fetch("/fonts/geometry/"+font+".json",{signal:controller.signal}).then(r=>{if(!r.ok)throw Error("This handwriting couldn’t load.");return r.json();}).then((data:FontGeometry)=>{
     if(!active)return;try{setGeometry(typedGeometry(name.trim(),note.trim(),data));setProblem("");}catch(e){setProblem((e as Error).message);}
   }).catch(e=>{if(active&&e.name!=="AbortError")setProblem("This handwriting couldn’t load. Try again.");});
   return()=>{active=false;controller.abort();};
 },[mode,font,name,note,strokes]);
 useEffect(()=>{if(state.status==="pending"&&state.receipt){try{localStorage.setItem(carvingStorageKey,state.receipt);}catch{}onSubmitted(state.receipt);onPlacement(null);setStep("done");}},[state]);
 const valid=Boolean(draft&&draft.x!==null&&draft.y!==null&&validPlacement(draft.x,draft.y,tree)&&!collides(footprintAt(draft.mask,draft.x,draft.y),new Set(occupied)));
 async function beginPlacement(){
   try {
     validateGuestbook({mode,display_name:name,note:mode==="typed"?note:"",font,strokes});
     if(!geometry)throw Error("Wait for your preview to load.");
     const mask=collisionMask(geometry);await onRefresh();
     onPlacement({geometry,mask,name:name.trim(),note:mode==="typed"?note.trim():"",mode,font,strokes,x:null,y:null});
     setProblem("");setStep("place");dialog.current?.close();onNavigate(tree.active_bottom-500);
   }catch(e){setProblem((e as Error).message);}
 }
 function returnToCreation(){onPlacement(null);setStep("create");setProblem("");dialog.current?.showModal();}
 function move(dx:number,dy:number){
   if(!draft)return;
   const x=draft.x??snap(180),y=draft.y??snap(tree.active_top+80);
   onPlacement({...draft,x:snap(x+dx),y:snap(y+dy)});onNavigate(y);
 }
 function prepareReview(){if(!valid)return;setProblem("");setStep("confirm");setReservation("");dialog.current?.showModal();}
 async function reserve(){
   if(!form.current||!draft||draft.x===null||draft.y===null)return;
   const data=new FormData(form.current);data.set("x",String(draft.x));data.set("y",String(draft.y));
   startTransition(async()=>{
     const result=await reserveGuestbook(data);setReset(n=>n+1);
     if(result.status==="held"&&result.id){setReservation(result.id);setProblem("");}
     else{setProblem(result.message);await onRefresh();setStep("place");dialog.current?.close();}
   });
 }
 function close(){
   if(busy||pending)return;
   dialog.current?.close();onClose();
   if(reservation)releaseGuestbookHold(reservation).catch(()=>{});
   if(step==="place"||step==="confirm"){onPlacement(null);setStep("create");setReservation("");}
 }
 const preview=<SignatureArt name={name||"Your name"} note={mode==="typed"?note:""} mode={mode} font={font} strokes={strokes} geometry={geometry||undefined} carved/>;
 return <>
 <dialog ref={dialog} className="signing-dialog" aria-labelledby="signing-heading" onCancel={event=>{event.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}}>
  <div className="signing-content"><div className="calendar-dialog-heading"><h2 id="signing-heading">{step==="done"?"A little piece of history.":step==="confirm"?"This little patch is yours.":"You were here."}</h2><button type="button" className="button calendar-close" onClick={close} aria-label="Close signing">×</button></div>
  {step==="done"?<div role="status"><div className="carving-preview">{preview}</div><p>{state.message}</p><p className="form-hint">Keep this browser’s bookmark, or search your name when it’s approved.</p><button className="button" onClick={close}>Back to the tree</button></div>:<form ref={form} action={action} className="guestbook-form">
   <input name="mode" type="hidden" value={mode}/><input name="font" type="hidden" value={font}/><input name="strokes" type="hidden" value={mode==="drawn"?JSON.stringify(strokes):"null"}/><input name="reservation" type="hidden" value={reservation}/>
   <label className="honey-field" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
   <Activity mode={step==="create"?"visible":"hidden"}>
    <p>A name. A tiny note. A mark in this corner of the internet.</p>
    {!enabled&&<p className="form-status">You can try the drawing and choose a spot in this preview. Saving opens after the private database and bot protection are connected.</p>}
    <div className="signature-modes" role="group" aria-label="Make your carving"><button type="button" className="button button-small" aria-pressed={mode==="typed"} onClick={()=>setMode("typed")}>Type</button><button type="button" className="button button-small" aria-pressed={mode==="drawn"} onClick={()=>setMode("drawn")}>Draw</button></div>
    <label>Your name<input name="display_name" value={name} maxLength={40} autoComplete="name" required onChange={e=>setName(e.target.value)}/></label>
    <Activity mode={mode==="typed"?"visible":"hidden"}><fieldset className="signature-fonts"><legend>Pick your handwriting</legend>{allowedSignatureFonts.map(value=><label key={value} style={{fontFamily:signatureFonts[value]+", cursive"}}><input type="radio" checked={font===value} onChange={()=>setFont(value)}/>{signatureFonts[value]}</label>)}</fieldset></Activity>
    <input name="note" type="hidden" value={mode==="typed"?note:""}/>
    {mode==="typed"&&<label>A tiny note <small>{note.length}/60</small><input value={note} maxLength={60} placeholder="Glad I wandered in." onChange={e=>setNote(e.target.value)}/></label>}
    <Activity mode={mode==="drawn"?"visible":"hidden"}><SignaturePad onChange={setStrokes}/></Activity>
    <div className="carving-preview">{preview}</div><p className="form-hint">About three lines total. Your exact lettering or drawing becomes the carving.</p>
    <button type="button" className="button" disabled={!name.trim()||!geometry||(mode==="drawn"&&!strokes.length)||busy} onClick={()=>startTransition(beginPlacement)}>{busy?"Opening the newest bark…":"Choose my patch of bark"}</button>
   </Activity>
   {step==="confirm"&&<><input name="display_name" type="hidden" value={name}/><div className="carving-preview">{preview}</div><p>Your chosen location stays yours as the tree grows underneath it.</p>
    {!enabled?<p className="form-status">This is a placement preview. Public signing is closed until the free backend and bot check are connected.</p>:reservation?<><p role="status">Your spot is held for 20 minutes. Send it for review when you’re ready.</p><button className="button" disabled={pending}>{pending?"Sending your carving…":"Send my carving for approval"}</button></>:<><HumanCheck siteKey={siteKey} action="guestbook" resetKey={String(reset)}/><button className="button" type="button" disabled={busy} onClick={reserve}>{busy?"Reserving your spot…":"Reserve this spot"}</button></>}
    <p className="form-hint">Your name, note, and drawing become public only after approval. Keep private details out of your carving.</p>
    <button type="button" className="button button-small" onClick={()=>startTransition(async()=>{if(reservation)await releaseGuestbookHold(reservation);await onRefresh();setStep("place");setReservation("");dialog.current?.close();})} disabled={busy||pending}>Choose a different spot</button>
   </>}
   {(problem||state.status==="error")&&<p className="form-status" role="alert">{problem||state.message}</p>}
   <noscript>Signing needs JavaScript for the preview and bot check. You can still browse the readable guest list.</noscript>
  </form>}
  </div>
 </dialog>
 {open&&step==="place"&&<aside className="placement-controls" aria-label="Choose your carving location"><p><strong>Choose your patch.</strong> Tap or point at the newest bark. Drag your preview, or use the buttons.</p>
  <div className="placement-nudges" role="group" aria-label="Keyboard accessible placement"><button className="button button-small" onClick={()=>move(0,-12)}>Up</button><button className="button button-small" onClick={()=>move(-12,0)}>Left</button><button className="button button-small" onClick={()=>move(12,0)}>Right</button><button className="button button-small" onClick={()=>move(0,12)}>Down</button></div>
  <p className="form-hint" role="status">{draft?.x===null?"Choose a location to begin.":valid?"This patch is available.": "That patch overlaps a mark or leaves the newest bark. Try nearby."}</p>
  {problem&&<p role="alert">{problem}</p>}<div className="actions"><button className="button" disabled={!valid} onClick={prepareReview}>Preview &amp; reserve</button><button className="button button-small" onClick={returnToCreation}>Edit my mark</button><button className="button button-small" onClick={close}>Cancel</button></div>
 </aside>}
 </>;
}
