import { aboutMemories } from "@/content/about-photos";
import styles from "@/app/aboutme/aboutme.module.css";
import photoStyles from "./photo-frame.module.css";
import type { CSSProperties } from "react";

export function AboutMemoryPhoto({ id, inline = false }: { id: string; inline?: boolean }) {
  const photo = aboutMemories.find(memory => memory.id === id);
  if (!photo?.src) return null;
  return <figure className={`${inline ? styles.inlinePhoto : styles.railPhoto} tactile-photo ${photoStyles.frame}`} data-memory-image={id} data-inline-memory={inline || undefined} style={{ aspectRatio: `${photo.width}/${photo.height}` } as CSSProperties}>
    <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
  </figure>;
}
