import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const themes = JSON.parse(readFileSync(new URL("../design/themes.json", import.meta.url), "utf8")) as Record<string, Record<string,string>>;
function luminance(hex:string) {
  const channels = [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);
  return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
}
function contrast(a:string,b:string) { const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05); }
for(const [name,colors] of Object.entries(themes)) {
  test(`${name}: content and control roles meet normal-text contrast`,()=>{
    for(const bg of ["background","surface","surface-alt"]) for(const ink of ["ink","muted"]) {
      const ratio=contrast(colors[bg],colors[ink]);assert.ok(ratio>=4.5,`${ink}/${bg}: ${ratio}`);
    }
    for(const [bg,ink] of [["background","accent"],["chrome","on-chrome"],["hover","on-hover"],["world-glass","world-ink"]]) {
      const ratio=contrast(colors[bg],colors[ink]);assert.ok(ratio>=4.5,`${ink}/${bg}: ${ratio}`);
    }
    for(const bg of ["background","surface"]) assert.ok(contrast(colors[bg],colors.border)>=3,`border/${bg}`);
    assert.ok(contrast(colors.foliage,colors.surface)>=4.5,"leaf lettering/foliage");
    for(const bg of ["background","surface","surface-alt"]) assert.ok(contrast(colors[bg],colors.accent)>=4.5,`accent/${bg}`);
    // Glass is 96% opaque; white behind it is the worst lightening case.
    const glassOnWhite="#"+[1,3,5].map(i=>Math.round(parseInt(colors["world-glass"].slice(i,i+2),16)*.96+255*.04).toString(16).padStart(2,"0")).join("");
    assert.ok(contrast(glassOnWhite,colors["world-ink"])>=4.5,"world glass over white");
  });
}
