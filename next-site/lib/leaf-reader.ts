export type ReaderLayer = { index: number; key: number; falling: boolean };
export type LeafReaderStack = { current: ReaderLayer; underneath: ReaderLayer | null; pending: number | null; serial: number };
export const leafRetireMs = 150;

export function createLeafReader(index: number, falling=true, serial=0): LeafReaderStack {
  return { current:{index,key:serial,falling}, underneath:null, pending:null, serial };
}
export function selectedReaderLeaf(stack: LeafReaderStack) { return stack.pending ?? stack.current.index; }

function landNext(stack: LeafReaderStack, index: number, falling: boolean): LeafReaderStack {
  const serial=stack.serial+1;
  return { current:{index,key:serial,falling}, underneath:{...stack.current,falling:false}, pending:null, serial };
}
/** Reuse the buried slot: fade it out before inserting the next falling blade.
 * The current blade stays put and becomes the new underneath layer. There are
 * never three SVG leaves, even when navigation interrupts an animation. */
export function requestReaderLeaf(stack: LeafReaderStack, index: number, reduced=false): LeafReaderStack {
  if (index===selectedReaderLeaf(stack)) return stack;
  if (index===stack.current.index) return {...stack,pending:null};
  if (reduced || !stack.underneath) return landNext(stack,index,!reduced);
  return {...stack,pending:index};
}
export function beginReaderFall(stack: LeafReaderStack): LeafReaderStack {
  return stack.pending===null ? stack : landNext(stack,stack.pending,true);
}
