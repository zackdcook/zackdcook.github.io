const stops = [[21,47,88],[38,25,66],[2,3,8]] as const;
const clamp = (value:number) => Math.max(0,Math.min(1,value));

/** First let the scenery travel completely out of the camera. Only then does
 * a long ascent through blue and purple start, with black at the oldest mark. */
export function admireAtmosphere(rise:number,totalRise:number,viewport:number) {
  const horizonExit=Math.max(1,Math.min(viewport*6,totalRise*.45));
  const midgroundExit=Math.max(1,Math.min(viewport*3.6,horizonExit*.7));
  const nightStart=Math.min(totalRise*.65,horizonExit+viewport*.5);
  const progress=clamp((rise-nightStart)/Math.max(1,totalRise-nightStart));
  const second=progress>=.46;
  const blend=second?(progress-.46)/.54:progress/.46;
  const a=stops[second?1:0],b=stops[second?2:1];
  const color=`#${a.map((channel,i)=>Math.round(channel+(b[i]-channel)*blend).toString(16).padStart(2,"0")).join("")}`;
  return {
    progress,color,
    horizonOpacity:1-clamp((rise-horizonExit*.75)/(horizonExit*.25)),
    midgroundOpacity:1-clamp((rise-midgroundExit*.56)/(midgroundExit*.44)),
    horizonY:rise*Math.max(.18,viewport*1.08/horizonExit),midgroundY:rise*Math.max(.4,viewport*1.08/midgroundExit),
    stars:clamp(progress*2),
  };
}
