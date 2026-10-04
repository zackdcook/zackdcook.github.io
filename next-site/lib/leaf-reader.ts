export type ReaderLayer = { index: number; key: number; falling: boolean };
export type LeafReaderStack = { current: ReaderLayer; underneath: ReaderLayer | null; retiring: ReaderLayer | null; serial: number };
export const leafFallMs = 1450;
export const leafRetireMs = 1900;
export const leafFadeStartMs = leafRetireMs * .58;

export function createLeafReader(index: number, falling=true, serial=0): LeafReaderStack {
  return {current:{index,key:serial,falling},underneath:null,retiring:null,serial};
}
export function selectedReaderLeaf(stack: LeafReaderStack) { return stack.current.index; }
/** A new blade starts falling immediately. The buried blade stays opaque until
 * near landing, then fades slowly. The stack is bounded to three paint layers
 * even when another navigation interrupts the fall. */
export function requestReaderLeaf(stack: LeafReaderStack, index: number, reduced=false): LeafReaderStack {
  if(index===stack.current.index) return stack;
  const serial=stack.serial+1;
  return {current:{index,key:serial,falling:!reduced},underneath:{...stack.current,falling:false},retiring:reduced ? null : stack.underneath,serial};
}
export function finishReaderFall(stack: LeafReaderStack): LeafReaderStack {
  if(!stack.retiring && !stack.current.falling) return stack;
  return {...stack,current:{...stack.current,falling:false},retiring:null};
}
