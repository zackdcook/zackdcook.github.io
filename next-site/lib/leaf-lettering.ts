// Advance widths from the site's bundled Fraunces Soft font, in ems. Using
// the same SVG coordinates for shape and lettering keeps every viewport in
// proportion, rather than letting a large reader font escape the silhouette.
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?—–’'“”()/:;-";
const advances = [.728,.696,.680,.776,.645,.603,.743,.824,.391,.507,.776,.615,.923,.763,.770,.680,.767,.737,.593,.681,.738,.721,1.065,.722,.683,.625,.528,.576,.492,.584,.501,.380,.540,.603,.298,.293,.585,.297,.901,.604,.557,.587,.571,.453,.462,.372,.589,.534,.812,.541,.542,.478,.659,.449,.602,.555,.611,.571,.609,.525,.609,.611,.196,.265,.272,.304,.539,.815,.513,.235,.186,.462,.467,.348,.346,.460,.265,.276,.362];
const widths = new Map([...alphabet].map((character, index) => [character, advances[index]]));
export const leafTextWidth = (text: string, size: number) => [...text].reduce((sum, character) => sum + (widths.get(character) ?? 1), 0) * size;
export const leafTextArea = { width: 284, height: 68, centerX: 330, centersY: [154,246] as const };

function wrap(text: string, size: number) {
  const lines: string[] = [];
  for (const word of text.split(/\s+/)) {
    const last = lines.length - 1;
    if (last >= 0 && leafTextWidth(`${lines[last]} ${word}`,size) <= leafTextArea.width) lines[last] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}
export function leafLettering(text: string) {
  const words = text.trim().split(/\s+/);
  let split = 1, score = Infinity;
  for (let i=1; i<words.length; i++) {
    const difference = Math.abs(leafTextWidth(words.slice(0,i).join(" "),1) - leafTextWidth(words.slice(i).join(" "),1));
    if (difference < score) { score = difference; split = i; }
  }
  const bands = words.length > 1 ? [words.slice(0,split).join(" "),words.slice(split).join(" ")] : [text,""];
  let size = 34, lines = bands.map(band => wrap(band,size));
  while (size > 8 && lines.some(band => band.length * size * 1.16 > leafTextArea.height || band.some(line => leafTextWidth(line,size) > leafTextArea.width))) {
    size -= .5; lines = bands.map(band => wrap(band,size));
  }
  return { size, lines, lineHeight: size * 1.16 };
}
