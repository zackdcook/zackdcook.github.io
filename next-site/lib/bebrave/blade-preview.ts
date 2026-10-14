import type {EnchantmentCamera} from "./enchantment-painter";

export const BLADE_PREVIEW_VIEWBOX="180 144 360 288";

export function bladePreviewCamera(width:number,height:number,pixelRatio=1):EnchantmentCamera {
  const scale=2*Math.min(width/720,height/576),visibleHeight=height/scale;
  const top=288-visibleHeight/2;
  return {top,height:visibleHeight,scale,pixelRatio,left:(width-720*scale)/2,offsetTop:-top*scale,viewportWidth:width,viewportHeight:height};
}
