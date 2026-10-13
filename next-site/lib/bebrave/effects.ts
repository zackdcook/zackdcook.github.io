/** Stable IDs and descriptions are also stored in the private effect catalog. */
export const LEGENDARY_EFFECTS = {
  "will-o-wisp-v1": "Luminous carving with orbiting will-o-wisp lights and faceted glints.",
  "hearts-v1": "Enchanted aura with glowing heart particles that lift, flutter, and softly fade.",
  "rainbow-v1": "A flowing rainbow carving and aura with prismatic motes and sparkling energy trails.",
  "blood-v1": "Crimson red strokes with a pulsing black aura and falling dark red blood droplets.",
} as const;
export type LegendaryEffectId = keyof typeof LEGENDARY_EFFECTS;
export const DEFAULT_LEGENDARY_EFFECT:LegendaryEffectId="will-o-wisp-v1";
export function legendaryEffect(id?:string|null):LegendaryEffectId {
  return id && Object.hasOwn(LEGENDARY_EFFECTS,id) ? id as LegendaryEffectId : DEFAULT_LEGENDARY_EFFECT;
}
export function legendaryColor(effectId:string|undefined|null,color:string) {
  return legendaryEffect(effectId)==="blood-v1" ? "#C51D36" : color;
}
