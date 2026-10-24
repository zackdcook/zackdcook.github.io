import { memo, useId } from "react";
import { Artwork } from "./artwork";
import { artworkEnabled } from "@/lib/art-assets";
import type { FollyQuote } from "@/content/folly";
import shapes from "@/content/leaf-shapes.json";
import { leafLettering } from "@/lib/leaf-lettering";

const letteringCache = new Map<string, ReturnType<typeof leafLettering>>();
function LeafArtwork({ quote, index }: { quote: FollyQuote; index: number }) {
  const clipId = useId().replace(/:/g, "");
  const shape = shapes[(quote.shape ?? index) % shapes.length];
  const cacheKey = `${shape.name}:${quote.text}`;
  let lettering = letteringCache.get(cacheKey);
  if (!lettering) {
    lettering = leafLettering(quote.text, shape);
    if (letteringCache.size >= 256) letteringCache.clear();
    letteringCache.set(cacheKey, lettering);
  }
  const ridgeId = `${clipId}-ridge`, sheenId = `${clipId}-sheen`, foldId = `${clipId}-fold`;
  return <span className="quote-leaf">
    <svg className="leaf-art" viewBox="0 0 640 400" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId}><path d={shape.outline}/></clipPath>
        <linearGradient id={ridgeId} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="var(--leaf-raised)"/><stop offset=".38" stopColor="var(--leaf-color)"/>
          <stop offset=".49" stopColor="var(--leaf-rib-light)"/><stop offset=".515" stopColor="var(--leaf-fold)"/>
          <stop offset=".7" stopColor="var(--leaf-color)"/><stop offset="1" stopColor="var(--leaf-edge)"/>
        </linearGradient>
        <radialGradient id={sheenId}><stop stopColor="var(--folly-highlight)" stopOpacity=".7"/><stop offset="1" stopColor="var(--folly-highlight)" stopOpacity="0"/></radialGradient>
        <linearGradient id={foldId} x1="0" y1="0" x2="0" y2="1"><stop stopColor="white" stopOpacity=".24"/><stop offset=".52" stopColor="white" stopOpacity="0"/><stop offset="1" stopColor="black" stopOpacity=".16"/></linearGradient>
      </defs>
      <path className="leaf-shadow" d={shape.outline} transform="translate(0 7)" />
      <path className="leaf-edge-depth" d={shape.outline} transform="translate(0 3)"/>
      <path className="leaf-body" d={shape.outline} style={{fill:`url(#${ridgeId})`}} />
      <g clipPath={`url(#${clipId})`} className="leaf-relief">
        <path d={shape.outline} fill={`url(#${foldId})`}/>
        <ellipse className="leaf-glint" cx="320" cy="160" rx="290" ry="175" fill={`url(#${sheenId})`}/>
        <path className="leaf-fine-veins" d="M120 191Q151 159 175 146 M170 195Q203 149 238 123 M237 195Q270 140 310 112 M315 195Q350 138 390 116 M390 195Q423 151 461 135 M458 194Q488 170 513 168 M120 209Q152 240 176 254 M170 205Q203 250 238 277 M237 205Q270 260 310 288 M315 205Q350 262 390 284 M390 205Q423 249 461 265 M458 206Q488 230 513 232"/>
      </g>
      {artworkEnabled("leaf-texture")&&<><foreignObject x="0" y="0" width="640" height="400" clipPath={`url(#${clipId})`}><Artwork slot="leaf-texture" className="artwork-skin"/></foreignObject></>}
      <g className="leaf-vein-highlights" transform="translate(0 -1.5)"><path d={shape.veins}/></g>
      <g className="leaf-veins">
        <path className="leaf-center-vein" d="M64 200 H552 Q581 200 607 213" />
        <path d={shape.veins} />
      </g>
      <text className="leaf-lettering" fontSize={lettering.size} textAnchor="middle" x={lettering.centerX}
        y={lettering.centerY - (lettering.lines.length - 1) * lettering.lineHeight / 2 + lettering.size * .33}>
        {lettering.lines.map((line, i) => <tspan key={i} x={lettering.centerX} dy={i ? lettering.lineHeight : 0}>{line}</tspan>)}
      </text>
      <path className="leaf-hit" d={shape.outline} />
    </svg>
  </span>;
}
// Reader navigation moves wrappers; unchanged SVG artwork never re-renders.
export const QuoteLeaf = memo(LeafArtwork);
