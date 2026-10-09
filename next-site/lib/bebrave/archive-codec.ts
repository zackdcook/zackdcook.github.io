import { createHash } from "node:crypto";
import { promisify } from "node:util";
import { gzip, gunzip } from "node:zlib";
import type { BeBraveRarity } from "../bebrave-types";
import { assembleStrokes, type PackedDrawing, type StrokeChunk } from "./completed-strokes";
import { encodePoints, simplifyPoints } from "./stroke-codec";
import { sparklePoints } from "./effect-anchors";

const compress = promisify(gzip), expand = promisify(gunzip);
export const MAX_ARCHIVE_SOURCE_BYTES = 8 * 1024 * 1024;
export const MAX_ARCHIVE_BYTES = 4 * 1024 * 1024;
export const RENDER_TOLERANCE = .2; // Render-only world units; canonical geometry stays untouched.
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export type CanonicalCarving = {
  version: 1;
  sessionId: string;
  chunks: Array<StrokeChunk & {created_at:string}>;
};
export type CarvingArchive = {
  gzipBase64: string;
  sourceSha256: string;
  payloadSha256: string;
  sourceBytes: number;
  compressedBytes: number;
  chunkCount: number;
  pointCount: number;
  renderStrokes: PackedDrawing["strokes"];
};
export const sha256 = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

/** Validate without normalizing/re-serializing: preserve the exact database text,
 * all chunk fields, timestamps, point precision and future additive fields. */
export function parseCanonical(source: string): CanonicalCarving {
  if (Buffer.byteLength(source) > MAX_ARCHIVE_SOURCE_BYTES) throw Error("Archive source exceeds its budget.");
  const document = JSON.parse(source) as CanonicalCarving;
  if (document.version !== 1 || !uuid.test(document.sessionId) || !Array.isArray(document.chunks) || document.chunks.length < 1 || document.chunks.length > 320) throw Error("Invalid canonical carving.");
  let pointCount = 0, previousId = 0;
  const pieces = new Set<string>();
  const orders = new Map<string,number>();
  for (const chunk of document.chunks) {
    if (!Number.isSafeInteger(chunk.id) || chunk.id <= previousId || chunk.session_id !== document.sessionId || !uuid.test(chunk.stroke_id) || !Number.isSafeInteger(chunk.stroke_order) || chunk.stroke_order < 0 || chunk.stroke_order > 1024 || !Number.isSafeInteger(chunk.chunk_index) || chunk.chunk_index < 0 || chunk.chunk_index > 2048 || typeof chunk.created_at !== "string" || !Number.isFinite(Date.parse(chunk.created_at))) throw Error("Invalid canonical chunk.");
    previousId = chunk.id;
    const key = `${chunk.stroke_id}:${chunk.chunk_index}`;
    if (pieces.has(key) || (orders.has(chunk.stroke_id) && orders.get(chunk.stroke_id) !== chunk.stroke_order)) throw Error("Inconsistent canonical stroke.");
    pieces.add(key); orders.set(chunk.stroke_id,chunk.stroke_order);
    if (!Array.isArray(chunk.points) || chunk.points.length < 2 || chunk.points.length > 160) throw Error("Invalid canonical points.");
    for (const p of chunk.points) {
      if (!Array.isArray(p) || p.length !== 2 || p.some(n => !Number.isFinite(n)) || p[0] < 0 || p[0] > 720 || p[1] < 0 || p[1] > 1_000_000_000) throw Error("Invalid canonical point.");
    }
    pointCount += chunk.points.length;
  }
  if (pointCount > 30_000) throw Error("Canonical carving exceeds its point budget.");
  return document;
}

export async function buildArchive(source:string,rarity:BeBraveRarity,seed:number,expectedSha256?:string):Promise<CarvingArchive> {
  const sourceSha256 = sha256(source);
  if (expectedSha256 && expectedSha256 !== sourceSha256) throw Error("Canonical checksum mismatch.");
  const document = parseCanonical(source);
  const compressed = await compress(Buffer.from(source),{level:9});
  if (compressed.length > MAX_ARCHIVE_BYTES) throw Error("Archive exceeds its compressed budget.");
  const restored = await expand(compressed,{maxOutputLength:MAX_ARCHIVE_SOURCE_BYTES});
  if (!restored.equals(Buffer.from(source))) throw Error("Archive round-trip failed.");
  const strokes = assembleStrokes(document.chunks).get(document.sessionId)!;
  return {
    gzipBase64:compressed.toString("base64"),sourceSha256,payloadSha256:sha256(compressed),
    sourceBytes:Buffer.byteLength(source),compressedBytes:compressed.length,
    chunkCount:document.chunks.length,pointCount:document.chunks.reduce((n,c)=>n+c.points.length,0),
    renderStrokes:strokes.map(({points,...stroke})=>({
      ...stroke,geometry:encodePoints(simplifyPoints(points,RENDER_TOLERANCE)),
      ...((rarity==="epic"||rarity==="legendary")?{sparkles:sparklePoints(points,seed,stroke.strokeOrder)}:{}),
    })),
  };
}

/** Canonical detail reads verify both container and original-document hashes. */
export async function restoreArchive(payload:Buffer,sourceSha256:string,payloadSha256:string):Promise<{source:string;document:CanonicalCarving}> {
  if (payload.length > MAX_ARCHIVE_BYTES || sha256(payload) !== payloadSha256) throw Error("Archive payload checksum mismatch.");
  const source = (await expand(payload,{maxOutputLength:MAX_ARCHIVE_SOURCE_BYTES})).toString("utf8");
  if (sha256(source) !== sourceSha256) throw Error("Archive source checksum mismatch.");
  return {source,document:parseCanonical(source)};
}
