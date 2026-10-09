import { performance } from "node:perf_hooks";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildArchive, restoreArchive } from "../lib/bebrave/archive-codec";
import { unpackDrawing } from "../lib/bebrave/completed-strokes";
import { BeBraveStroke } from "../components/bebrave-stroke";

const id=(n:number)=>`00000000-0000-4000-8000-${n.toString(16).padStart(12,"0")}`;
type Record={sequence:number;top:number;bottom:number};
function firstAtLeast(rows:Record[],key:"top"|"bottom",value:number){let l=0,r=rows.length;while(l<r){const m=(l+r)>>>1;if(rows[m][key]<value)l=m+1;else r=m;}return l;}

async function geometry(row:Record){
  const chunks=[];
  for(let stroke=0;stroke<4;stroke++){
    const points=Array.from({length:600},(_,i)=>[80+stroke*145+Math.sin(i/90)*50,row.top+70+i*2+Math.cos(i/45)*9]);
    for(let chunk=0;chunk<5;chunk++)chunks.push({id:stroke*5+chunk+1,session_id:id(row.sequence),stroke_id:id(200000+stroke),stroke_order:stroke,chunk_index:chunk,points:points.slice(chunk*120,(chunk+1)*120),created_at:"2026-10-09T12:00:00.000000+00:00"});
  }
  const source=JSON.stringify({version:1,sessionId:id(row.sequence),chunks});
  const archive=await buildArchive(source,"legendary",row.sequence);
  // Verify every generated canonical byte, not just metadata counts.
  const restored=await restoreArchive(Buffer.from(archive.gzipBase64,"base64"),archive.sourceSha256,archive.payloadSha256);
  if(restored.source!==source)throw Error("Benchmark canonical fidelity failed.");
  const packed={id:id(row.sequence),publicSequence:row.sequence,rarity:"legendary" as const,color:"#CDAAFF",effectSeed:row.sequence,strokes:archive.renderStrokes};
  return {source,archive,packed,drawing:unpackDrawing(packed)};
}

async function main(){
const report=[];
for(const population of [100,1000,10000,100000]){
  const rows=Array.from({length:population},(_,index)=>({sequence:index+1,top:7200+index*288,bottom:8640+index*288}));
  const center=rows[Math.floor(population/2)].top,first=Math.max(0,Math.floor(center/864)-2),top=first*864,bottom=(first+5)*864;
  const start=performance.now(),from=firstAtLeast(rows,"bottom",top+1),to=firstAtLeast(rows,"top",bottom);
  const visible=rows.slice(from,to),lookupMs=performance.now()-start;
  const prepared=await Promise.all(visible.map(geometry));
  const decodeStart=performance.now();
  const drawings=prepared.map(p=>unpackDrawing(p.packed));
  const decodeMs=performance.now()-decodeStart;
  const renderStart=performance.now();
  const html=renderToStaticMarkup(createElement("svg",{},drawings.flatMap(d=>d.strokes.map(stroke=>createElement(BeBraveStroke,{key:`${d.id}:${stroke.strokeId}`,stroke,rarity:d.rarity,color:d.color,seed:d.effectSeed})))));
  const renderMs=performance.now()-renderStart;
  report.push({population,sections:5,visibleCarvings:visible.length,canonicalBytes:prepared.reduce((n,p)=>n+Buffer.byteLength(p.source),0),gzipBytes:prepared.reduce((n,p)=>n+p.archive.compressedBytes,0),viewportBytes:Buffer.byteLength(JSON.stringify(prepared.map(p=>p.packed))),renderPoints:drawings.reduce((n,d)=>n+d.strokes.reduce((s,p)=>s+p.points.length,0),0),svgElements:(html.match(/<(?!(?:\/|!))/g)||[]).length,lookupMs:+lookupMs.toFixed(3),decodeMs:+decodeMs.toFixed(3),serverSvgMs:+renderMs.toFixed(3)});
}
console.log(JSON.stringify({method:"Synthetic 2,400-point carvings with individual IDs, lossless gzip round trips, original-path Legendary anchors and five indexed viewport sections. Geometry generated on demand; total populations are metadata indexes, not an allocated full-history geometry download. Timings are local Node measurements, not browser FPS or live-database latency.",results:report},null,2));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
