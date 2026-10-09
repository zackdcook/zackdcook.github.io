export function sparklePoints(points:Array<[number,number]>,seed:number,strokeOrder:number) {
  if(!points.length)return [];
  let state=(seed ^ Math.imul(strokeOrder+1,2654435761))>>>0;
  const next=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const length=points.slice(1).reduce((sum,point,index)=>sum+Math.hypot(point[0]-points[index][0],point[1]-points[index][1]),0);
  const targetCount=Math.max(1,Math.min(10,Math.round(length/90)));
  const positions:number[]=[];
  let distance=0;
  for(let index=1;index<points.length;index++){
    distance+=Math.hypot(points[index][0]-points[index-1][0],points[index][1]-points[index-1][1]);
    positions.push(distance);
  }
  return Array.from({length:targetCount},(_,index)=>{
    const wanted=length*((index+.4+.2*next())/targetCount);
    const at=positions.findIndex(d=>d>=wanted);
    const segment=at<0?points.length-2:at;
    const before=segment>0?positions[segment-1]:0;
    const span=(positions[segment]||length)-before;
    const t=span>0?(wanted-before)/span:0;
    const from=points[Math.max(0,segment)],to=points[Math.min(points.length-1,segment+1)];
    const point:[number,number]=[from[0]+(to[0]-from[0])*t,from[1]+(to[1]-from[1])*t];
    return {x:point[0]+(next()-.5)*10,y:point[1]+(next()-.5)*10,r:2.5+next()*2,delay:next()*3.8};
  });
}
