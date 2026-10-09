"use client";

import { useEffect,useId,useRef,useState } from 'react';
import type { BeBravePublicDrawing } from '@/lib/bebrave-types';
import { carvingBounds } from '@/lib/bebrave/carving-inspection';
import { BeBraveStroke } from './bebrave-stroke';

/** A selective original-art lens. The viewport projection appears immediately;
 * only this one published canonical record is fetched, never the whole tree. */
export function BeBraveInspector({drawing,opener,onClose}:{drawing:BeBravePublicDrawing;opener:SVGGElement|null;onClose:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null),title=useId();
  const [detail,setDetail]=useState(drawing),[canonical,setCanonical]=useState(false),[problem,setProblem]=useState('');
  useEffect(()=>{if(dialog.current&&!dialog.current.open)dialog.current.showModal();return()=>{if(opener?.isConnected)opener.focus({preventScroll:true});};},[opener]);
  useEffect(()=>{
    const controller=new AbortController();
    fetch(`/api/bebrave/carvings/${encodeURIComponent(drawing.id)}`,{signal:controller.signal}).then(async response=>{
      if(!response.ok)throw Error('That stretch of bark could not load.');
      const data=await response.json();
      if(data.drawing?.id!==drawing.id||!Array.isArray(data.drawing.strokes))throw Error('That stretch of bark could not load.');
      setDetail(data.drawing);setCanonical(true);
    }).catch(error=>{if(!controller.signal.aborted)setProblem(error instanceof Error?error.message:'That stretch of bark could not load.');});
    return()=>controller.abort();
  },[drawing.id]);
  const bounds=carvingBounds(detail,32);
  return <dialog ref={dialog} className="bebrave-inspector" aria-labelledby={title} onClose={onClose} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}>
    <header className="bebrave-inspector-heading"><h2 id={title}>Admire</h2><button type="button" className="button" aria-label="Back" onClick={()=>dialog.current?.close()}>×</button></header>
    <div className="bebrave-inspector-art" data-detail={canonical?'canonical':'projection'} aria-busy={!canonical&&!problem}>
      <span aria-hidden="true"/>
      <svg viewBox={`${bounds.left} ${bounds.top} ${bounds.width} ${bounds.height}`} role="img" aria-label="Drawings carved into the shared cypress tree">
        {detail.strokes.map(stroke=><BeBraveStroke key={stroke.strokeId} stroke={stroke} color={detail.color} rarity={detail.rarity} seed={detail.effectSeed} effectId={detail.effectId}/>)}
      </svg>
    </div>
    {problem&&<p role="alert">{problem}</p>}
  </dialog>;
}
