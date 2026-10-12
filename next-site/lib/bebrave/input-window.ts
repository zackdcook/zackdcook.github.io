/** Check the authoritative deadline for every input event, independently of the HUD tick. */
export function drawingInputOpen(deadline:string|null|undefined,now:number,serverOffset:number,finishing:boolean) {
  return !finishing && Boolean(deadline) && now + serverOffset < Date.parse(deadline!);
}
