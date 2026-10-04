import type { CSSProperties } from "react";
import type { FollyQuote } from "@/content/folly";
import { leafLettering, leafTextArea } from "@/lib/leaf-lettering";

// Broad, irregular blades with little serrations and rolled tips. Every
// variation shares a safe reading area on either side of the central fold.
const outlines = [
  "M72 200 Q97 157 133 128 L132 110 Q155 116 179 90 L190 75 Q210 84 231 68 L252 55 Q273 65 301 52 L325 46 Q338 63 364 60 L390 61 Q398 76 422 76 L448 80 Q444 97 472 98 L501 114 Q496 130 522 133 L549 153 Q540 165 568 177 L613 200 Q580 219 568 237 L541 248 Q541 266 513 274 L488 297 Q478 287 464 302 L436 319 Q427 310 406 327 L377 340 Q365 328 345 341 L312 348 Q301 333 281 339 L245 337 Q248 322 221 323 L188 306 Q191 293 167 285 L141 267 Q145 253 122 248 Q91 226 72 200Z",
  "M72 200 Q95 161 121 139 Q127 114 151 116 Q165 86 190 93 Q213 67 239 78 Q268 48 294 65 Q324 44 350 61 Q379 54 401 77 Q431 71 448 94 Q476 94 490 117 Q520 122 527 143 Q570 161 615 200 Q579 225 552 242 Q543 266 517 269 Q502 299 477 293 Q454 322 427 313 Q404 343 375 329 Q345 354 316 337 Q286 347 262 330 Q231 338 209 315 Q181 317 164 291 Q132 285 126 260 Q91 238 72 200Z",
  "M72 200 Q93 153 139 118 Q132 105 154 103 Q182 74 208 83 Q213 65 233 76 Q264 51 291 65 Q308 47 326 64 Q359 52 383 74 Q402 68 413 85 Q449 79 465 108 Q482 101 488 122 Q535 134 551 162 Q579 172 614 200 Q573 229 550 238 Q547 265 518 272 Q515 289 493 286 Q471 316 442 311 Q431 330 412 316 Q377 345 350 333 Q335 352 315 338 Q280 348 258 329 Q238 338 226 320 Q191 316 173 290 Q154 299 148 277 Q114 257 72 200Z",
  "M72 200 Q93 165 122 139 L128 120 Q148 126 167 103 L192 86 Q212 92 231 76 L260 63 Q275 76 296 63 L327 58 Q340 72 364 69 L392 76 Q405 87 427 85 L450 102 Q464 111 484 112 L505 135 Q534 145 552 166 L611 200 Q565 224 550 244 Q525 247 513 272 L488 293 Q470 288 450 308 L424 320 Q401 315 383 333 L352 343 Q337 329 311 341 L281 339 Q268 325 243 329 L214 316 Q211 298 185 299 L159 277 Q160 261 137 255 Q101 234 72 200Z",
];
const branches = [
  "M142 199 Q151 175 148 159 M187 199 Q205 155 196 123 M240 199 Q263 143 252 100 M299 199 Q321 131 310 83 M360 199 Q385 143 378 105 M424 199 Q445 156 439 135 M483 200 Q507 175 500 155",
  "M142 201 Q158 233 151 245 M190 201 Q213 252 203 276 M242 201 Q266 267 258 300 M300 201 Q323 272 315 313 M361 201 Q388 259 382 291 M426 201 Q449 249 445 275 M484 200 Q511 219 506 243",
];
export function QuoteLeaf({ quote, index, instance = "pile", blank = false }: { quote: FollyQuote; index: number; instance?: string; blank?: boolean }) {
  const palette = index % 4, outline = outlines[index % outlines.length];
  const id = `folly-${quote.id}-${instance}`, lettering = leafLettering(quote.text);
  return <span className="quote-leaf" style={{ "--leaf-color": `var(--folly-leaf-${palette})`, "--leaf-ink": `var(--folly-ink-${palette})` } as CSSProperties}>
    <svg className="leaf-art" viewBox="0 0 640 400" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-fold`} x1=".1" y1="0" x2=".6" y2="1">
          <stop offset="0" stopColor="var(--folly-highlight)" stopOpacity=".17" /><stop offset=".47" stopColor="var(--folly-highlight)" stopOpacity="0" /><stop offset=".51" stopColor="var(--folly-depth)" stopOpacity=".14" /><stop offset="1" stopColor="var(--folly-depth)" stopOpacity=".03" />
        </linearGradient>
        <radialGradient id={`${id}-light`} className="leaf-edge-light" cx=".5" cy="0" r=".95">
          <stop offset="0" stopColor="var(--folly-highlight)" stopOpacity=".8" /><stop offset=".65" stopColor="var(--leaf-color)" stopOpacity=".25" /><stop offset="1" stopColor="var(--leaf-ink)" stopOpacity=".3" />
        </radialGradient>
      </defs>
      {/* A vector cast avoids a filtered bitmap per leaf on mobile Safari. */}
      <g className="leaf-shadow" transform="translate(0 10)" fill="var(--folly-depth)" stroke="var(--folly-depth)" strokeLinejoin="round" aria-hidden="true">
        <path d={outline} strokeWidth="16" opacity=".025" /><path d={outline} strokeWidth="8" opacity=".045" /><path d={outline} strokeWidth="0" opacity=".12" />
        <path d="M21 217 Q45 222 76 200" fill="none" strokeWidth="14" strokeLinecap="round" opacity=".12" />
      </g>
      <path className="leaf-stem-depth" d="M21 221 Q45 222 76 200" />
      <path className="leaf-stem" d="M21 217 Q45 222 76 200" />
      <path className="leaf-thickness" d={outline} />
      <path className="leaf-body" d={outline} />
      <path d={outline} fill={`url(#${id}-fold)`} />
      <g>
        <g className="leaf-veins" fill="none" strokeLinecap="round">{branches.map((path,i) => <path key={i} d={path} />)}</g>
        <path className="leaf-center-vein" d="M72 200 Q312 194 579 200" />
        <path className="leaf-vein-rim" d="M76 197 Q312 192 579 197" />
        <path className="leaf-tip-fold" d="M572 178 Q582 197 613 200 Q582 207 567 225 Q582 201 572 178Z" />
      </g>
      <path className="leaf-edge" d={outline} fill="none" stroke={`url(#${id}-light)`} />
      {!blank && <g className="leaf-lettering" fontSize={lettering.size} textAnchor="middle">
        {lettering.lines.map((lines,band) => <text key={band} x={leafTextArea.centerX} y={leafTextArea.centersY[band] - (lines.length-1)*lettering.lineHeight/2 + lettering.size*.33}>
          {lines.map((line,i) => <tspan key={i} x={leafTextArea.centerX} dy={i ? lettering.lineHeight : 0}>{line}</tspan>)}
        </text>)}
      </g>}
      <path className="leaf-hit" d={outline} />
    </svg>
  </span>;
}
