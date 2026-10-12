import "server-only";
import { serviceSupabase } from "../supabase";
import type { BeBravePublicStroke, BeBraveRarity } from "../bebrave-types";
import { assembleStrokes, readChunkPages, unpackDrawing, type PackedDrawing, type StrokeChunk } from "./completed-strokes";
import { buildArchive, restoreArchive } from "./archive-codec";

/** Safe to retry. The database seals only a completed session whose exact
 * source hash still matches under its row lock, without touching eligibility. */
export async function archiveCompletedSession(id:string,rarity:BeBraveRarity,seed:number) {
  const client = serviceSupabase();
  const source = await client.rpc("bebrave_archive_source",{p_session:id});
  if (source.error) throw source.error;
  const row = source.data?.[0] as {document:string;source_sha256:string}|undefined;
  if (!row) return;
  const archive = await buildArchive(row.document,rarity,seed,row.source_sha256);
  const saved = await client.rpc("bebrave_store_archive",{
    p_session:id,p_source_sha256:archive.sourceSha256,p_gzip_base64:archive.gzipBase64,
    p_payload_sha256:archive.payloadSha256,p_render_strokes:archive.renderStrokes,
  });
  if (saved.error) throw saved.error;
}

type ArchiveRow = {session_id:string;render_strokes:PackedDrawing["strokes"];geometry_gzip:string;source_sha256:string;payload_sha256:string};

/** Viewports request only small render projections. Canonical details are
 * selective, integrity checked and legacy compatible. Never fetch all history. */
export async function completedStrokes(ids:string[],projection:boolean):Promise<Map<string,BeBravePublicStroke[]>> {
  const result = new Map<string,BeBravePublicStroke[]>();
  if (!ids.length) return result;
  if (ids.length > 12) throw Error("Completed carving page exceeds its budget.");
  const client = serviceSupabase();
  const archives = await client.from("bebrave_completed_archives")
    .select(projection?"session_id,render_strokes":"session_id,geometry_gzip,source_sha256,payload_sha256")
    .in("session_id",ids);
  if (archives.error) throw archives.error;
  for (const row of (archives.data??[]) as unknown as ArchiveRow[]) {
    if (projection) {
      const drawing:PackedDrawing = {id:row.session_id,publicSequence:0,rarity:"common",color:"",effectSeed:0,strokes:row.render_strokes};
      result.set(row.session_id,unpackDrawing(drawing).strokes);
    } else {
      if (!/^\\x[0-9a-f]+$/i.test(row.geometry_gzip)) throw Error("Invalid archive container.");
      const {document} = await restoreArchive(Buffer.from(row.geometry_gzip.slice(2),"hex"),row.source_sha256,row.payload_sha256);
      if (document.sessionId !== row.session_id) throw Error("Archive session mismatch.");
      result.set(row.session_id,assembleStrokes(document.chunks).get(row.session_id)!);
    }
  }
  const legacyIds = ids.filter(id=>!result.has(id));
  if (legacyIds.length) {
    const chunks = await readChunkPages(async afterId=>{
      let query = client.from("bebrave_stroke_chunks").select("id,session_id,stroke_id,stroke_order,chunk_index,points")
        .in("session_id",legacyIds).order("id",{ascending:true}).limit(500);
      if (afterId !== null) query = query.gt("id",afterId);
      const page = await query;
      if (page.error) throw page.error;
      return (page.data??[]) as StrokeChunk[];
    },legacyIds.length*320);
    for (const [id,strokes] of assembleStrokes(chunks)) result.set(id,strokes);
  }
  return result;
}
