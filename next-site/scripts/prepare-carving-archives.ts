/** Prepare reviewed RPC arguments from a service-only SQL export. No keys needed.
 * Input rows: id, chosen_rarity, effect_seed, document, source_sha256.
 * Keep export/output outside the repository and deployment directory. */
import { readFile, writeFile } from "node:fs/promises";
import { buildArchive, parseCanonical } from "../lib/bebrave/archive-codec";
import type { BeBraveRarity } from "../lib/bebrave-types";

type SourceRow={id:string;chosen_rarity:BeBraveRarity;effect_seed:number;document:string;source_sha256:string};
const [input,output]=process.argv.slice(2);
if (!input||!output) throw Error("Specify an input export and private output file.");
async function main(){
const rows=JSON.parse(await readFile(input,"utf8")) as SourceRow[];
const prepared=[];
for(const row of rows){
  if(parseCanonical(row.document).sessionId!==row.id)throw Error("Export session mismatch.");
  const archive=await buildArchive(row.document,row.chosen_rarity,Number(row.effect_seed||0),row.source_sha256);
  prepared.push({id:row.id,sourceBytes:archive.sourceBytes,compressedBytes:archive.compressedBytes,
    rpc:{p_session:row.id,p_source_sha256:archive.sourceSha256,p_gzip_base64:archive.gzipBase64,p_payload_sha256:archive.payloadSha256,p_render_strokes:archive.renderStrokes}});
}
await writeFile(output,JSON.stringify(prepared),{mode:0o600});
console.log(JSON.stringify({prepared:prepared.length,sourceBytes:prepared.reduce((n,a)=>n+a.sourceBytes,0),compressedBytes:prepared.reduce((n,a)=>n+a.compressedBytes,0)}));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
