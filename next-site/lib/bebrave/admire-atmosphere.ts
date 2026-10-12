const stops = [[21,47,88],[38,25,66],[2,3,8]] as const;
const clamp = (value:number) => Math.max(0,Math.min(1,value));

/** Absolute altitude prevents camera/resize changes from resetting the scenery.
 * The full history determines the sky, while nearby terrain exits naturally. */
export function admireAtmosphere(rise:number,totalRise:number,viewport:number) {
  const progress=clamp(rise/Math.max(1,totalRise));
  const second=progress>=.46;
  const blend=second?(progress-.46)/.54:progress/.46;
  const a=stops[second?1:0],b=stops[second?2:1];
  const color=`#${a.map((channel,i)=>Math.round(channel+(b[i]-channel)*blend).toString(16).padStart(2,"0")).join("")}`;
  return {
    progress,color,
    horizonOpacity:1-clamp(rise/Math.max(1,viewport*2.3)),
    midgroundOpacity:1-clamp(rise/Math.max(1,viewport*1.6)),
    horizonY:rise*.18,midgroundY:rise*.4,
    stars:clamp(progress*2),
  };
}
