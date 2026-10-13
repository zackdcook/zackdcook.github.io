export const clampAdmireZoom=(zoom:number)=>Math.max(.5,Math.min(1.5,zoom));
export const pinchAdmireZoom=(startZoom:number,startDistance:number,distance:number)=>clampAdmireZoom(startZoom*distance/Math.max(1,startDistance));
export const anchoredScroll=(worldTop:number,worldY:number,scale:number,screenY:number)=>Math.max(0,worldTop+worldY*scale-screenY);
export const smoothParallaxRise=(current:number,target:number,elapsed:number)=>current+(target-current)*(1-Math.exp(-Math.min(64,elapsed)/80));
