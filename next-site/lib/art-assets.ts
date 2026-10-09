import assets from "@/design/art-assets.json";

export type ArtworkSlot = keyof typeof assets;
export type ArtworkTheme = "living-light" | "living-dark" | "felled-light" | "felled-dark";
export type ArtworkDefinition = {
  kind: "native" | "image" | "mask" | "none";
  src?: string;
  variants?: Partial<Record<ArtworkTheme,string>>;
  fit?: "contain" | "cover";
  position?: string;
  tint?: "ink" | "accent" | "foliage" | "brass" | "sun";
  material?: "glass" | "paper" | "none";
};

export const artworkAssets: Record<ArtworkSlot,ArtworkDefinition> = assets as Record<ArtworkSlot,ArtworkDefinition>;

/** Public assets only. No HTML injection, runtime fetch, credential or external origin. */
export function artworkSource(slot: ArtworkSlot, theme: ArtworkTheme = "living-light") {
  const asset = artworkAssets[slot];
  return asset.variants?.[theme] ?? asset.src;
}

export function artworkEnabled(slot: ArtworkSlot) { return artworkAssets[slot].kind !== "none"; }
