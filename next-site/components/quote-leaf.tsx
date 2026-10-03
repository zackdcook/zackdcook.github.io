import type { CSSProperties } from "react";
import { leafPalettes, type FollyQuote } from "@/content/folly";

// A broad, softly serrated leaf: simple vector artwork, no external assets.
const outline = "M51 332 C43 302 45 280 55 250 L86 263 L65 225 Q67 204 88 180 L117 194 L108 151 Q120 131 145 116 L169 139 L174 99 Q204 80 231 74 L250 100 L269 63 Q299 53 326 52 L337 82 L361 49 Q390 44 418 44 L425 72 L454 41 Q483 39 510 42 L510 65 L557 36 Q580 38 612 32 C589 71 583 90 565 113 L538 107 L551 135 Q535 160 510 179 L477 168 L482 201 Q459 227 425 242 L400 223 L390 259 Q359 279 329 286 L309 261 L291 299 Q260 311 226 313 L211 289 L181 323 Q149 335 118 331 L106 309 L84 337 Q66 337 51 332 Z";

export function QuoteLeaf({ quote, index, reverse = false }: { quote: FollyQuote; index: number; reverse?: boolean }) {
  const palette = leafPalettes[index % leafPalettes.length];
  return <span className={`quote-leaf ${reverse ? "quote-leaf-back" : "quote-leaf-front"}`} style={{ "--leaf-color": palette.leaf, "--leaf-ink": palette.ink } as CSSProperties}>
    <svg className="leaf-art" viewBox="0 0 640 400" aria-hidden="true" focusable="false">
      <path className="leaf-stem" d="M25 366 Q36 346 64 324 L555 83" />
      <path className="leaf-body" d={outline} />
      <g className="leaf-veins" fill="none" strokeLinecap="round">
        <path d="M62 324 Q253 232 566 70" />
        <path d="M124 294 Q118 229 145 149 M201 254 Q201 160 231 107 M282 214 Q291 132 326 79 M368 169 Q402 97 418 72 M455 126 Q492 73 510 65 M123 294 Q168 306 211 299 M201 254 Q241 276 284 281 M282 214 Q324 240 379 240 M368 169 Q408 204 460 190 M455 126 Q492 154 523 145" />
      </g>
    </svg>
    {!reverse && <span className={`leaf-words ${quote.text.length > 55 ? "leaf-words-long" : ""}`}>{quote.text}</span>}
  </span>;
}
