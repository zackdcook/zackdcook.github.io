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
  return <span className="quote-leaf">
    <svg className="leaf-art" viewBox="0 0 640 400" aria-hidden="true" focusable="false">
      <path className="leaf-shadow" d={shape.outline} transform="translate(0 7)" />
      <path className="leaf-body" d={shape.outline} />
      {artworkEnabled("leaf-texture")&&<><defs><clipPath id={clipId}><path d={shape.outline}/></clipPath></defs><foreignObject x="0" y="0" width="640" height="400" clipPath={`url(#${clipId})`}><Artwork slot="leaf-texture" className="artwork-skin"/></foreignObject></>}
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
