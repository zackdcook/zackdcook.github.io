/** Stable renderer IDs are persisted with each carving, independently of codes. */
export const DEFAULT_LEGENDARY_EFFECT="will-o-wisp-v1";
export function legendaryEffect(id?:string|null) {
  switch(id){
    case "will-o-wisp-v1":return DEFAULT_LEGENDARY_EFFECT;
    default:return DEFAULT_LEGENDARY_EFFECT;
  }
}
