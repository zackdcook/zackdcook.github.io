// Advance widths from the site's bundled Fraunces Soft font, in ems. Using
// the same SVG coordinates for shape and lettering keeps every viewport in
// proportion, rather than letting a large reader font escape the silhouette.
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?—–’'“”()/:;-";
const advances = [.728,.696,.680,.776,.645,.603,.743,.824,.391,.507,.776,.615,.923,.763,.770,.680,.767,.737,.593,.681,.738,.721,1.065,.722,.683,.625,.528,.576,.492,.584,.501,.380,.540,.603,.298,.293,.585,.297,.901,.604,.557,.587,.571,.453,.462,.372,.589,.534,.812,.541,.542,.478,.659,.449,.602,.555,.611,.571,.609,.525,.609,.611,.196,.265,.272,.304,.539,.815,.513,.235,.186,.462,.467,.348,.346,.460,.265,.276,.362];
const widths = new Map([...alphabet].map((character, index) => [character, advances[index]]));
export const leafTextWidth = (text: string, size: number) => [...text].reduce((sum, character) => sum + (widths.get(character) ?? 1), 0) * size;
export const leafTextArea = { width: 300, height: 162, centerX: 320, centerY: 200 };

function partition(words: string[], size: number, capacities: number[]) {
  const memo = new Map<string,{lines:string[];score:number}|null>();
  function visit(start: number, row: number): {lines:string[];score:number}|null {
    if (row===capacities.length) return start===words.length ? {lines:[],score:0} : null;
    const key=`${start}:${row}`;
    if (memo.has(key)) return memo.get(key)!;
    let best: {lines:string[];score:number}|null=null;
    for(let end=start+1;end<=words.length-(capacities.length-row-1);end++) {
      const line=words.slice(start,end).join(" "), width=leafTextWidth(line,size);
      if(width>capacities[row]) break;
      const rest=visit(end,row+1);if(!rest) continue;
      const score=rest.score+(1-width/capacities[row])**2;
      if(!best || score<best.score) best={lines:[line,...rest.lines],score};
    }
    memo.set(key,best);return best;
  }
  return visit(0,0);
}
/** Narrow end rows and broad middle rows follow the blade, with no words lost. */
export type LeafReadingField = { textCenterX: number; textCenterY: number; textRows: number[][] };
export function leafLettering(text: string, field?: LeafReadingField) {
  const words=text.trim().split(/\s+/);
  const centerX=field?.textCenterX ?? leafTextArea.centerX,centerY=field?.textCenterY ?? leafTextArea.centerY;
  const profiles=[[300],[200,240],[190,300,210],[150,270,300,200],[130,240,300,250,160],[110,210,280,300,220,130]];
  const preferred=words.length<=3 ? 1 : words.length<=9 ? 3 : words.length<=17 ? 4 : 5;
  for(let size=38;size>=10;size-=.5) {
    for(let rows=preferred;rows<=Math.min(6,words.length);rows++) {
      const lineHeight=size*1.16;
      if(rows*lineHeight>leafTextArea.height) continue;
      const capacities=profiles[rows-1].map((width,row)=>{
        if(!field) return width;
        const baseline=centerY-(rows-1)*lineHeight/2+size*.33+row*lineHeight;
        const contour=field.textRows.filter(([y])=>y>=baseline-size*.73-4 && y<=baseline+size*.13+4);
        const safe=contour.length ? Math.min(...contour.map(([,left,right])=>2*Math.min(centerX-left,right-centerX)-12)) : 0;
        return Math.max(0,Math.min(width,safe));
      });
      const result=partition(words,size,capacities);
      if(result) return {size,lines:result.lines,lineHeight,capacities,centerX,centerY};
    }
  }
  // Extremely long future notes remain complete and wrap within the safe field.
  const size=10,lines:string[]=[];
  for(const word of words) {
    const last=lines.length-1;
    if(last>=0 && leafTextWidth(`${lines[last]} ${word}`,size)<=leafTextArea.width) lines[last]+=` ${word}`;
    else lines.push(word);
  }
  return {size,lines,lineHeight:size*1.16,capacities:lines.map(()=>leafTextArea.width),centerX,centerY};
}
