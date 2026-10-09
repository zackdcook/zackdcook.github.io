import type { BeBravePublicDrawing, BeBravePublicStroke } from "../bebrave-types";
import { encodePoints, decodePoints, type EncodedPoints, type Point } from "./stroke-codec";

export type StrokeChunk = {
  id: number;
  session_id: string;
  stroke_id: string;
  stroke_order: number;
  chunk_index: number;
  points: Point[];
};
export type PackedDrawing = Omit<BeBravePublicDrawing,"strokes"> & {
  strokes: Array<Omit<BeBravePublicStroke,"points"> & { geometry: EncodedPoints }>;
};

/** Cursor pagination avoids the Supabase response-row cap truncating drawings. */
export async function readChunkPages(
  fetchPage:(afterId:number|null)=>Promise<StrokeChunk[]>,
  maxChunks:number,
) {
  const all:StrokeChunk[]=[];
  let cursor:number|null=null;
  for(;;) {
    const page=await fetchPage(cursor);
    if(page.length===0)return all;
    for(const row of page) {
      if(!Number.isSafeInteger(row.id)||row.id<1||(cursor!==null&&row.id<=cursor))throw new Error("Invalid stroke cursor.");
      cursor=row.id;all.push(row);
      if(all.length>maxChunks)throw new Error("Stored carving exceeds its chunk budget.");
    }
  }
}

export function assembleStrokes(chunks:StrokeChunk[]) {
  const sessions = new Map<string,Map<string,StrokeChunk[]>>();
  for(const row of chunks){let session=sessions.get(row.session_id);if(!session){session=new Map();sessions.set(row.session_id,session);}const pieces=session.get(row.stroke_id)||[];pieces.push(row);session.set(row.stroke_id,pieces);}
  const result=new Map<string,BeBravePublicStroke[]>();
  for(const [id,strokes] of sessions) {
    const assembled:BeBravePublicStroke[]=[];
    for(const [strokeId,pieces] of strokes) {
      pieces.sort((a,b)=>a.chunk_index-b.chunk_index);
      const points:Point[]=[];
      for(const piece of pieces)for(const point of piece.points){const last=points.at(-1);if(!last||last[0]!==point[0]||last[1]!==point[1])points.push(point);}
      assembled.push({strokeId,strokeOrder:Number(pieces[0].stroke_order),points});
    }
    result.set(id,assembled.sort((a,b)=>a.strokeOrder-b.strokeOrder));
  }
  return result;
}
export function packDrawing(drawing:BeBravePublicDrawing):PackedDrawing {
  return {...drawing,strokes:drawing.strokes.map(({points,...stroke})=>({...stroke,geometry:encodePoints(points)}))};
}
export function unpackDrawing(drawing:PackedDrawing|BeBravePublicDrawing):BeBravePublicDrawing {
  return {...drawing,strokes:drawing.strokes.map(stroke=>"geometry" in stroke?{strokeId:stroke.strokeId,strokeOrder:stroke.strokeOrder,points:decodePoints(stroke.geometry)}:stroke)};
}
