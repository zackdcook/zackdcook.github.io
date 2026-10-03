import { useId } from "react";
import { signatureNameLines, strokePath, type SignatureFont, type Stroke } from "@/lib/guestbook";
import { geometryPath, type Geometry } from "@/lib/tree-space";
import { signatureFonts } from "@/lib/guestbook";

export function SignatureArt({ name, note, mode, font, strokes, geometry, carved = false }: { name: string; note: string; mode: "typed" | "drawn"; font: SignatureFont; strokes: Stroke[] | null; geometry?:Geometry; carved?: boolean }) {
  const id = `bark${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const lines = signatureNameLines(name);
  const marks = geometry ? <g>{geometry.contours.length>0&&<path d={geometryPath(geometry.contours)} fill="currentColor" fillRule="evenodd"/>}{geometry.lines.map((line,i)=><path key={i} d={strokePath(line)} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>)}</g> : mode === "drawn" ? strokes?.map((stroke, i) => <path key={i} d={strokePath(stroke)} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />) : <g fill="currentColor" style={{ fontFamily: signatureFonts[font]+", cursive" }}>
    {lines.map((line, index) => <text key={index} x="300" y={lines.length === 1 ? 106 : 73 + index * 53} textAnchor="middle" fontSize={font === "handlee" ? 42 : 52}>{line}</text>)}
    {note && <text x="300" y="167" textAnchor="middle" fontSize={Math.min(24, 600 / Math.max(1, [...note].length))}>{note}</text>}
  </g>;
  return <svg className="signature-art" viewBox="0 0 600 210" role="img" aria-label={`${name || "Your signature"}${note ? `: ${note}` : ""}`}>
    {carved && <defs><filter id={id} x="-10%" y="-12%" width="120%" height="124%"><feTurbulence type="fractalNoise" baseFrequency=".018 .11" numOctaves="2" seed="7" result="grain" /><feDisplacementMap in="SourceGraphic" in2="grain" scale="1.3" xChannelSelector="R" yChannelSelector="G" /></filter></defs>}
    {carved ? <g filter={`url(#${id})`}>
      <g className="carved-edge" color="#e1bd8c" opacity=".75">{marks}</g>
      <g className="carved-shadow" color="#20160e" opacity=".95">{marks}</g>
      <g className="carved-interior" color="#4b3120">{marks}</g>
    </g> : <g color="currentColor">{marks}</g>}
  </svg>;
}
