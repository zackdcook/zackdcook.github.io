import type { FollyQuote } from "@/content/folly";
import shapes from "@/content/leaf-shapes.json";
import { leafLettering } from "@/lib/leaf-lettering";

// Crop the original uploaded art in SVG and map its two inks to exact palette
// values. Every leaf reuses the same cached PNG sheets.
function PaletteFilter({ id, colors, crop }: { id: string; colors: number[][]; crop: number[] }) {
  return <filter id={id} filterUnits="userSpaceOnUse" x={crop[0]} y={crop[1]} width={crop[2]} height={crop[3]} colorInterpolationFilters="sRGB">
    <feColorMatrix type="matrix" values=".638 2.146 .216 0 -.2 .638 2.146 .216 0 -.2 .638 2.146 .216 0 -.2 0 0 0 1 0" />
    <feComponentTransfer>
      <feFuncR type="discrete" tableValues={colors.map(color => color[0]/255).join(" ")} />
      <feFuncG type="discrete" tableValues={colors.map(color => color[1]/255).join(" ")} />
      <feFuncB type="discrete" tableValues={colors.map(color => color[2]/255).join(" ")} />
      <feFuncA type="discrete" tableValues="0 1" />
    </feComponentTransfer>
  </filter>;
}
export function QuoteLeaf({ quote, index, instance = "pile", blank = false }: { quote: FollyQuote; index: number; instance?: string; blank?: boolean }) {
  const shape = shapes[(blank ? index : quote.shape ?? index) % shapes.length];
  const [x,y,width,height] = shape.crop;
  const id = `folly-${quote.id}-${instance}`, lettering = leafLettering(quote.text,shape);
  return <span className="quote-leaf">
    <svg className="leaf-art" viewBox="0 0 640 400" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${id}-crop`}><rect x={x} y={y} width={width} height={height} /></clipPath>
        <PaletteFilter id={`${id}-living`} crop={shape.crop} colors={[[57,51,19],[102,105,62]]} />
        <PaletteFilter id={`${id}-felled`} crop={shape.crop} colors={[[67,40,24],[153,88,42]]} />
        <radialGradient id={`${id}-light`} className="leaf-edge-light" cx=".5" cy="0" r=".95">
          <stop offset="0" stopColor="var(--folly-highlight)" stopOpacity=".6" /><stop offset="1" stopColor="var(--folly-highlight)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="leaf-shadow" transform="translate(0 10)" fill="var(--folly-depth)" stroke="var(--folly-depth)" strokeLinejoin="round">
        <path d={shape.outline} strokeWidth="16" opacity=".025" /><path d={shape.outline} strokeWidth="8" opacity=".045" /><path d={shape.outline} opacity=".17" />
      </g>
      <g transform={shape.transform} clipPath={`url(#${id}-crop)`}>
        <image className="leaf-sheet-living" href="/images/folly/living-leaves.png" width="2000" height="1291" filter={`url(#${id}-living)`} />
        <image className="leaf-sheet-felled" href="/images/folly/felled-leaves.png" width="2000" height="1291" filter={`url(#${id}-felled)`} />
      </g>
      <path className="leaf-edge" d={shape.outline} fill="none" stroke={`url(#${id}-light)`} />
      {!blank && <text className="leaf-lettering" fontSize={lettering.size} textAnchor="middle" x={lettering.centerX}
        y={lettering.centerY - (lettering.lines.length-1)*lettering.lineHeight/2 + lettering.size*.33}>
        {lettering.lines.map((line,i) => <tspan key={i} x={lettering.centerX} dy={i ? lettering.lineHeight : 0}>{line}</tspan>)}
      </text>}
      <path className="leaf-hit" d={shape.outline} />
    </svg>
  </span>;
}
