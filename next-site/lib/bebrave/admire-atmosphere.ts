const stops = [[21,47,88],[38,25,66],[2,3,8]] as const;
const topStops = [[10,26,57],[27,17,49],[1,2,5]] as const;
const bottomStops = [[35,32,76],[31,17,47],[2,3,8]] as const;
const clamp = (value:number) => Math.max(0,Math.min(1,value));
function skyColor(progress:number,palette:ReadonlyArray<readonly number[]>) {
  const second=progress>=.46;
  const blend=second?(progress-.46)/.54:progress/.46;
  const a=palette[second?1:0],b=palette[second?2:1];
  return `#${a.map((channel,i)=>Math.round(channel+(b[i]-channel)*blend).toString(16).padStart(2,"0")).join("")}`;
}

/** First let the scenery travel completely out of the camera. Only then does
 * a long ascent through blue and purple start, with black at the oldest mark. */
export function admireAtmosphere(rise:number,totalRise:number,viewport:number) {
  const horizonExit=Math.max(1,Math.min(viewport*10.8,totalRise*.6));
  const midgroundExit=Math.max(1,Math.min(viewport*4.9,horizonExit*.62));
  const nightStart=Math.min(totalRise*.82,horizonExit+viewport*.8);
  const progress=clamp((rise-nightStart)/Math.max(1,totalRise-nightStart));
  return {
    progress,color:skyColor(progress,stops),topColor:skyColor(progress,topStops),bottomColor:skyColor(progress,bottomStops),
    horizonOpacity:1-clamp((rise-horizonExit*.85)/(horizonExit*.15)),
    midgroundOpacity:1-clamp((rise-midgroundExit*.7)/(midgroundExit*.3)),
    horizonY:Math.min(rise,horizonExit*1.3)*Math.max(.1,viewport*1.08/horizonExit),
    midgroundY:Math.min(rise,midgroundExit*1.3)*Math.max(.22,viewport*1.08/midgroundExit),
    stars:clamp(progress*1.5),starTravel:clamp(rise/Math.max(1,totalRise))*viewport*.12,
  };
}
