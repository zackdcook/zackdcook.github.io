import type { BeBravePublicDrawing } from '../bebrave-types';

export function carvingBounds(drawing:BeBravePublicDrawing,padding=24){
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(const stroke of drawing.strokes)for(const [x,y] of stroke.points){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(!Number.isFinite(left))return {left:0,top:0,width:720,height:480};
  return {left:left-padding,top:top-padding,width:Math.max(48,right-left+padding*2),height:Math.max(48,bottom-top+padding*2)};
}

function segmentDistanceSquared(x:number,y:number,a:[number,number],b:[number,number]){
  const dx=b[0]-a[0],dy=b[1]-a[1],length=dx*dx+dy*dy;
  const t=length?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/length)):0;
  return (x-a[0]-t*dx)**2+(y-a[1]-t*dy)**2;
}

/** Inspect only loaded geometry. The earliest painter wins overlapping hits,
 * just as it does on the tree; screen-space tolerance is supplied by camera. */
export function pickCarving(drawings:BeBravePublicDrawing[],point:[number,number],radius:number){
  const [x,y]=point,limit=radius*radius;
  for(const drawing of [...drawings].sort((a,b)=>a.publicSequence-b.publicSequence)){
    const bounds=carvingBounds(drawing,radius);
    if(x<bounds.left||x>bounds.left+bounds.width||y<bounds.top||y>bounds.top+bounds.height)continue;
    for(const stroke of drawing.strokes){
      for(let i=1;i<stroke.points.length;i++)if(segmentDistanceSquared(x,y,stroke.points[i-1],stroke.points[i])<=limit)return drawing;
    }
  }
  return null;
}
