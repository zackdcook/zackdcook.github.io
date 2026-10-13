/** WebKit can start selection on descendants or retain a range from the code
 * input. Lock the whole drawing document, and restore ordinary browsing after. */
export function lockCarvingSelection(root: HTMLElement) {
  const document=root.ownerDocument, previous=document.documentElement.dataset.bebraveDrawing;
  document.documentElement.dataset.bebraveDrawing="true";
  const editable=document.activeElement as HTMLElement|null;
  if(editable?.matches("input,textarea,[contenteditable='true']"))editable.blur();
  const clear=()=>{
    const selection=document.defaultView?.getSelection();
    if(selection?.rangeCount)selection.removeAllRanges();
  };
  clear();
  const block=(event:Event)=>event.preventDefault();
  const options={capture:true};
  // Safari can target an ancestor or the document during repeated taps.
  document.addEventListener("selectstart",block,options);
  document.addEventListener("contextmenu",block,options);
  document.addEventListener("dragstart",block,options);
  document.addEventListener("selectionchange",clear);
  document.addEventListener("pointerdown",clear,options);
  const surface=root.querySelector<HTMLElement>(".bebrave-world");
  // Pointer events still draw; cancel the native touch gesture that creates a
  // long-press callout or double-tap selection, including the empty bark.
  surface?.addEventListener("touchstart",block,{passive:false});
  surface?.addEventListener("touchmove",block,{passive:false});
  return()=>{
    document.removeEventListener("selectstart",block,options);document.removeEventListener("contextmenu",block,options);
    document.removeEventListener("dragstart",block,options);document.removeEventListener("selectionchange",clear);
    document.removeEventListener("pointerdown",clear,options);
    surface?.removeEventListener("touchstart",block);surface?.removeEventListener("touchmove",block);
    if(previous===undefined)delete document.documentElement.dataset.bebraveDrawing;
    else document.documentElement.dataset.bebraveDrawing=previous;
  };
}
