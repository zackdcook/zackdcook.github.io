import { Artwork } from "./artwork";
import type { ArtworkSlot } from "@/lib/art-assets";

type Variant = "window" | "desk" | "botanical" | "pages";

/** Original, replaceable reading-room studies. No lettering or raster filters:
 * the same ink, paper and brass roles paint every timeline/appearance. */
export function StudioArtwork({slot,variant="window",className="",material="none"}: {
  slot:ArtworkSlot;variant?:Variant;className?:string;material?:"none"|"paper"|"glass";
}) {
  return <Artwork slot={slot} className={`studio-art ${className}`} material={material}>
    <svg viewBox="0 0 1440 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {variant==="window" && <>
        <g className="studio-window" transform="translate(1050 70)" fill="none">
          <path d="M0 900V250a230 230 0 0 1 460 0v650Z" fill="var(--studio-light)" opacity=".42"/>
          <path d="M20 900V250a210 210 0 0 1 420 0v650M230 40v860M20 340h420M20 650h420" stroke="var(--studio-rule)" strokeWidth="3" opacity=".58"/>
          <path d="M0 910V250a230 230 0 0 1 460 0v660" stroke="var(--studio-rule)" strokeWidth="14" opacity=".28"/>
          <circle cx="315" cy="235" r="75" fill="var(--studio-light)" opacity=".7"/>
          <path d="M32 357  -360 1060H250L438 357Z" fill="var(--studio-light)" opacity=".12"/>
        </g>
        <g className="studio-arch" fill="none" stroke="var(--studio-rule)" opacity=".25">
          <path d="M-80 1020V395a180 180 0 0 1 360 0v625M-50 1020V395a150 150 0 0 1 300 0v625" strokeWidth="2"/>
          <path d="M-80 650h360M-80 900h360" strokeWidth="1"/>
        </g>
        <g transform="translate(120 900) rotate(-9)" opacity=".6"><Books/></g>
        <g transform="translate(1335 280) rotate(165)" opacity=".45"><Sprig/></g>
        <g fill="var(--studio-rule)" opacity=".32"><circle cx="327" cy="310" r="2"/><circle cx="998" cy="115" r="2"/><circle cx="1130" cy="618" r="3"/></g>
      </>}
      {variant==="desk" && <>
        <g className="studio-desk-books" transform="translate(-25 905) rotate(-12)" opacity=".9"><Books/></g>
        <g transform="translate(1380 1040) rotate(-55)" opacity=".82"><Sprig/></g>
        <g className="studio-desk-note" transform="translate(1235 650) rotate(13)" fill="var(--studio-paper)" stroke="var(--studio-rule)" strokeWidth="1.3" opacity=".65">
          <path d="M0 0h190l-15 245H-15Z"/><path d="M5 20h175L165 250H-10" fill="none"/>
          <path d="M22 60h115M19 84h137M17 108h97M15 150h114M12 174h85" fill="none" opacity=".55"/>
          <circle cx="131" cy="204" r="15" fill="var(--studio-accent)" opacity=".65"/>
        </g>
      </>}
      {variant==="botanical" && <>
        <g transform="translate(70 1025) rotate(-28) scale(1.5)" opacity=".68"><Sprig/></g>
        <g transform="translate(1360 1040) rotate(38) scale(1.8)" opacity=".78"><Sprig/></g>
        <g fill="none" stroke="var(--studio-rule)" opacity=".24"><ellipse cx="1110" cy="660" rx="290" ry="330" strokeWidth="2"/><ellipse cx="1110" cy="660" rx="270" ry="310"/></g>
      </>}
      {variant==="pages" && <g transform="translate(445 490) rotate(-8)">
        <path d="m-30 25 300-30 280 85-10 300-286-60-292 15Z" fill="var(--studio-accent)" opacity=".32"/>
        <path d="M0 0q160-35 275 0 95-25 255 15v305q-158-35-255-15-128-32-275 0Z" fill="var(--studio-paper)" stroke="var(--studio-rule)" strokeWidth="2"/>
        <path d="M275 0v305" stroke="var(--studio-rule)" opacity=".7"/>
        <g fill="none" stroke="var(--studio-rule)" strokeWidth="1.4" opacity=".55">
          <path d="M40 70q84-13 176 0M40 98q84-13 176 0M40 126q84-13 150-4M40 175q84-13 176 0M40 203q84-13 176 0M40 231q84-13 113-8"/>
          <path d="M324 75q73-8 160 8M324 103q73-8 160 8M324 131q73-8 125 2M324 180q73-8 160 8M324 208q73-8 160 8M324 236q73-8 90-3"/>
        </g>
        <g transform="translate(530 280) rotate(35) scale(.65)" opacity=".8"><Sprig/></g>
        <path d="m281 5 18 268-12-7-10 8Z" fill="var(--studio-accent)" opacity=".85"/>
      </g>}
    </svg>
  </Artwork>;
}

function Books(){return <g stroke="var(--studio-rule)" strokeWidth="1.5">
  <path d="m-45 0 275-20 15 62-275 22Z" fill="var(--studio-accent)"/>
  <path d="m-28 10 253-18 10 36-251 20Z" fill="var(--studio-paper)"/>
  <path d="m-25 73 305 15-4 53-306-17Z" fill="var(--studio-plant)"/>
  <path d="m-6 83 274 15-2 30-274-13Z" fill="var(--studio-paper)"/>
  <path d="m-35 150 266-5 3 55-267 6Z" fill="var(--studio-light)"/>
  <g fill="none" opacity=".45"><path d="m-25 24 239-17m-236 26 239-17M-2 93l261 14M-1 111l260 14M-22 163l240-4m-239 26 240-4"/></g>
  <path d="M95-28q35-74 106-40-28 63-106 40Z" fill="var(--studio-plant)" opacity=".6"/>
  <path d="M96-27 183-59" fill="none"/>
</g>;}
function Sprig(){return <g fill="var(--studio-plant)" stroke="var(--studio-rule)" strokeWidth="1.2">
  <path d="M0 0q30-120 2-265" fill="none" strokeWidth="2"/>
  <path d="M11-53q-62-7-71-68 53 10 71 68ZM15-83q55-8 61-63-42 1-61 63ZM12-125q-54-24-43-71 39 14 43 71ZM9-164q47-7 53-56-36 5-53 56ZM3-206q-32-29-14-70 29 22 14 70Z"/>
  <g fill="none" opacity=".5"><path d="m11-53-54-51m58 21 45-46m-48 4-31-54m28 15 39-42"/></g>
  <g transform="translate(2 -289)" stroke="none" fill="var(--studio-accent)"><ellipse rx="11" ry="23" transform="rotate(20)"/><ellipse rx="11" ry="23" transform="rotate(80)"/><ellipse rx="11" ry="23" transform="rotate(140)"/><circle r="6" fill="var(--studio-light)"/></g>
</g>;}
