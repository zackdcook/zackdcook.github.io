import type { CSSProperties, ReactNode } from "react";
import Image, { type ImageProps } from "next/image";
import { artworkAssets, type ArtworkSlot } from "@/lib/art-assets";

/** Interchangeable decorative artwork. Native vectors, raster art and tinted masks
 * share theme selection and material lighting without client rendering or markup injection. */
export function Artwork({slot,className="",children,material}:{slot:ArtworkSlot;className?:string;children?:ReactNode;material?:"glass"|"paper"|"none"}) {
  const asset=artworkAssets[slot];
  if(asset.kind==="none")return null;
  return <span className={`artwork ${className}`} data-art-slot={slot} data-art-kind={asset.kind}
    data-material-surface={(material??asset.material)==="none"?undefined:material??asset.material}
    style={{"--art-image":`var(--asset-${slot})`,"--art-fit":asset.fit??"contain","--art-position":asset.position??"center","--art-tint":`var(--color-${asset.tint??"ink"})`} as CSSProperties}
    aria-hidden="true">
    <span className="artwork-content">{asset.kind==="native"?children:null}</span>
  </span>;
}

/** Existing photographs keep Next's responsive optimization. Theme variants use
 * the shared CSS source, so only the selected file loads, even before hydration. */
export function ArtworkImage({slot,alt,width,height,style,className="",...props}:Omit<ImageProps,"src">&{slot:ArtworkSlot}) {
  const asset=artworkAssets[slot];
  if(asset.kind==="none"||!asset.src)return null;
  if(!asset.variants&&asset.kind==="image")return <Image {...props} src={asset.src} alt={alt} width={width} height={height} className={className} style={{objectFit:asset.fit,objectPosition:asset.position,...style}}/>;
  return <span role={alt?"img":undefined} aria-label={alt||undefined} aria-hidden={!alt||undefined} className={`artwork-photo ${className}`} data-art-kind={asset.kind}
    style={{"--art-image":`var(--asset-${slot})`,"--art-tint":`var(--color-${asset.tint??"ink"})`,backgroundSize:asset.fit??"cover",backgroundPosition:asset.position??"center",aspectRatio:`${width}/${height}`,...style} as CSSProperties}/>;
}
