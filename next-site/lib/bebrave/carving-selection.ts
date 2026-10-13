/** WebKit can start selection on descendants or retain a range from the code
 * input. Lock the whole drawing document, and restore ordinary browsing after. */
export function lockCarvingSelection(root: HTMLElement) {
  const document=root.ownerDocument, previous=document.documentElement.dataset.bebraveDrawing;
  document.documentElement.dataset.bebraveDrawing="true";
  document.defaultView?.getSelection()?.removeAllRanges();
  const block=(event:Event)=>event.preventDefault();
  const options={capture:true};
  root.addEventListener("selectstart",block,options);
  root.addEventListener("contextmenu",block,options);
  return()=>{
    root.removeEventListener("selectstart",block,options);root.removeEventListener("contextmenu",block,options);
    if(previous===undefined)delete document.documentElement.dataset.bebraveDrawing;
    else document.documentElement.dataset.bebraveDrawing=previous;
  };
}
