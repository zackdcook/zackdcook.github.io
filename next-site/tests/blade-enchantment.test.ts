import test from "node:test";
import assert from "node:assert/strict";
import { packDrawing,unpackDrawing } from "../lib/bebrave/completed-strokes";
import { carvingParticleSymbol } from "../lib/bebrave/enchantment-painter";
import { PERSONAL_SYMBOL,FEATHER_SYMBOL,SYMBOL_PATHS } from "../lib/bebrave/symbol-paths";
import { carvingPigment,carvingEdge,contrastRatio } from "../lib/bebrave/carving-contrast";
import { BEBRAVE_UNCOMMON_COLORS,BEBRAVE_EPIC_COLORS,BEBRAVE_SUPERIOR_COLORS } from "../lib/bebrave-config";
import { legendaryToolSparkles } from "../lib/bebrave/tool-sparkles";
import { lockCarvingSelection } from "../lib/bebrave/carving-selection";
import type { BeBravePublicDrawing } from "../lib/bebrave-types";

test("selected symbols persist through archives; the personal effect retains both feather and dagger",()=>{
  const drawing:BeBravePublicDrawing={id:"enchantment",publicSequence:1,rarity:"legendary",color:"#41DCE8",effectSeed:12,particleSymbol:0x2620,effectId:"will-o-wisp-v1",strokes:[]};
  assert.equal(carvingParticleSymbol(unpackDrawing(packDrawing(drawing))),0x2620);
  assert.equal(carvingParticleSymbol({...drawing,effectId:"blood-v1"}),PERSONAL_SYMBOL);
  assert.equal(PERSONAL_SYMBOL,0x1f5e1);
  const personal={...drawing,effectId:"blood-v1"};
  assert.equal(carvingParticleSymbol(personal,1),FEATHER_SYMBOL);
  assert.equal(FEATHER_SYMBOL,0x1fab6);assert.ok(SYMBOL_PATHS[FEATHER_SYMBOL]);
  for(let i=0;i<12;i++)assert.equal(carvingParticleSymbol(personal,i),carvingParticleSymbol(unpackDrawing(packDrawing(personal)),i));
  const ordinary={...drawing,particleSymbol:undefined};
  assert.equal(carvingParticleSymbol(ordinary),carvingParticleSymbol(unpackDrawing(packDrawing(ordinary))));
});

test("Common uses ivory without changing stored pigment; uncommon pigments and their edges remain readable",()=>{
  assert.equal(carvingPigment("common","#5A321F"),"#F3E7CB");
  assert.equal(carvingPigment("superior","#00F5FF"),"#00F5FF");
  assert.equal(BEBRAVE_EPIC_COLORS.some(choice=>/violet|purple/i.test(choice.name)),false);
  assert.deepEqual(BEBRAVE_UNCOMMON_COLORS,BEBRAVE_SUPERIOR_COLORS);
  assert.deepEqual(BEBRAVE_EPIC_COLORS.map(choice=>choice.value),["#00F5FF","#FF2BD6","#FFF44F","#39FF14","#FF7A00","#3D7BFF"]);
  for(const {name,value} of BEBRAVE_UNCOMMON_COLORS){
    assert.ok(contrastRatio(value,carvingEdge(value))>=3,`${name}: continuous engraved edge`);
  }
});

test("drawing cancels selection and long-press menus and restores normal browsing on cleanup",()=>{
  const surface=new EventTarget();let cleared=0,blurred=0;
  const document=Object.assign(new EventTarget(),{documentElement:{dataset:{} as Record<string,string>},activeElement:{matches:()=>true,blur:()=>blurred++},defaultView:{getSelection:()=>({rangeCount:1,removeAllRanges:()=>cleared++})}});
  const root={ownerDocument:document,querySelector:()=>surface} as unknown as HTMLElement;
  const cleanup=lockCarvingSelection(root);
  assert.equal(cleared,1);assert.equal(blurred,1);assert.equal(document.documentElement.dataset.bebraveDrawing,"true");
  for(const name of ["selectstart","contextmenu","dragstart"])assert.equal(document.dispatchEvent(new Event(name,{cancelable:true})),false);
  for(const name of ["touchstart","touchmove"])assert.equal(surface.dispatchEvent(new Event(name,{cancelable:true})),false);
  document.dispatchEvent(new Event("selectionchange"));assert.equal(cleared,2);
  cleanup();assert.equal(document.documentElement.dataset.bebraveDrawing,undefined);
  for(const name of ["selectstart","contextmenu","dragstart"])assert.equal(document.dispatchEvent(new Event(name,{cancelable:true})),true);
  for(const name of ["touchstart","touchmove"])assert.equal(surface.dispatchEvent(new Event(name,{cancelable:true})),true);
  document.dispatchEvent(new Event("selectionchange"));assert.equal(cleared,2);
});

test("knife sparkles scatter independently, stay away from the label and retain their seed",()=>{
  const a=legendaryToolSparkles(12),b=legendaryToolSparkles(819);
  assert.equal(a.length,23);assert.deepEqual(a,legendaryToolSparkles(12));assert.notDeepEqual(a,b);
  assert.equal(new Set(a.map(star=>star.y)).size,a.length);
  assert.ok(a.every(star=>star.y<84));
  assert.ok(new Set(a.map(star=>star.duration)).size>10);
});
