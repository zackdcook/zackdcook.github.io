import type { CSSProperties } from "react";
import { leafPalettes, type FollyQuote } from "@/content/folly";

// Four soft variations of the same simple leaf. Its vein is the reading axis.
const outlines = [
  "M66 200 C143 42 350 26 611 200 C414 372 201 363 66 200Z",
  "M66 200 C166 48 399 67 611 200 C436 323 242 368 66 200Z",
  "M66 200 C177 27 376 69 611 200 C447 365 222 327 66 200Z",
  "M66 200 C136 62 335 25 611 200 C410 326 195 366 66 200Z",
];
function lettering(text: string) {
  const words = text.split(" ");
  let split = 1, score = Infinity;
  for (let i = 1; i < words.length; i++) {
    const difference = Math.abs(words.slice(0,i).join(" ").length - words.slice(i).join(" ").length);
    if (difference < score) { score = difference; split = i; }
  }
  return [words.slice(0,split).join(" "), words.slice(split).join(" ")];
}
export function QuoteLeaf({ quote, index, reverse = false, instance = "pile" }: { quote: FollyQuote; index: number; reverse?: boolean; instance?: string }) {
  const palette = leafPalettes[index % leafPalettes.length], outline = outlines[index % outlines.length];
  const id = `folly-${quote.id}-${instance}-${reverse ? "back" : "front"}`, [above, below] = lettering(quote.text);
  return <span className={`quote-leaf ${reverse ? "quote-leaf-back" : "quote-leaf-front"}`} style={{ "--leaf-color": palette.leaf, "--leaf-ink": palette.ink } as CSSProperties}>
    <svg className="leaf-art" viewBox="0 0 640 400" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${id}-leaf-clip`}><path d={outline} /></clipPath>
        <radialGradient id={`${id}-leaf-light`} className="leaf-edge-light" cx=".5" cy="0" r=".95">
          <stop offset="0" stopColor="var(--floral,#FFF8ED)" stopOpacity=".8" /><stop offset=".65" stopColor="var(--leaf-color)" stopOpacity=".25" /><stop offset="1" stopColor="var(--leaf-ink)" stopOpacity=".3" />
        </radialGradient>
      </defs>
      <path className="leaf-stem" d="M25 205 Q44 211 77 200" />
      <path className="leaf-thickness" d={outline} />
      <path className="leaf-body" d={outline} />
      <path className="leaf-edge" d={outline} fill="none" stroke={`url(#${id}-leaf-light)`} />
      <g className="leaf-veins" clipPath={`url(#${id}-leaf-clip)`} fill="none" strokeLinecap="round">
        <path className="leaf-center-vein" d="M70 200 Q326 194 565 200" />
        <path d="M170 199 Q135 145 127 131 M260 197 Q225 104 221 92 M364 197 Q337 105 323 83 M463 198 Q442 133 429 120 M170 199 Q150 260 144 282 M260 197 Q243 287 240 310 M364 197 Q354 276 349 308 M463 198 Q447 251 438 274" />
      </g>
      <path className="leaf-hit" d={outline} />
    </svg>
    {!reverse && <span className={`leaf-lettering ${quote.text.length > 40 ? "leaf-lettering-long" : ""}`} aria-hidden="true"><span className="leaf-words leaf-words-above">{above}</span><span className="leaf-words leaf-words-below">{below}</span></span>}
  </span>;
}
