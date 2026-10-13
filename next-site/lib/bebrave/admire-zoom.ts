export const clampAdmireZoom=(zoom:number)=>Math.max(.5,Math.min(1.5,zoom));
export const pinchAdmireZoom=(startZoom:number,startDistance:number,distance:number)=>clampAdmireZoom(startZoom*distance/Math.max(1,startDistance));
export const anchoredScroll=(worldTop:number,worldY:number,scale:number,screenY:number)=>Math.max(0,worldTop+worldY*scale-screenY);
// Fallen coordinates run from the oldest mark on the right to the base on the left.
export const fallenWorldPoint=(height:number,scrollLeft:number,scale:number,screenX:number)=>(height-(scrollLeft+screenX)/scale);
export const anchoredFallenScroll=(height:number,worldY:number,scale:number,screenX:number)=>Math.max(0,(height-worldY)*scale-screenX);
export const smoothParallaxRise=(current:number,target:number,elapsed:number)=>current+(target-current)*(1-Math.exp(-Math.min(64,elapsed)/80));
