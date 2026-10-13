import test from "node:test";
import assert from "node:assert/strict";
import { packDrawing,unpackDrawing } from "../lib/bebrave/completed-strokes";
import { carvingParticleSymbol } from "../lib/bebrave/enchantment-painter";
import { PERSONAL_SYMBOL } from "../lib/bebrave/symbol-paths";
import { carvingPigment,carvingEdge,contrastRatio } from "../lib/bebrave/carving-contrast";
import { BEBRAVE_UNCOMMON_COLORS,BEBRAVE_EPIC_COLORS } from "../lib/bebrave-config";
import { lockCarvingSelection } from "../lib/bebrave/carving-selection";
import type { BeBravePublicDrawing } from "../lib/bebrave-types";

test("selected symbols persist through archive packing; the personal dagger stays fixed",()=>{
  const drawing:BeBravePublicDrawing={id:"enchantment",publicSequence:1,rarity:"legendary",color:"#41DCE8",effectSeed:12,particleSymbol:0x2620,effectId:"will-o-wisp-v1",strokes:[]};
  assert.equal(carvingParticleSymbol(unpackDrawing(packDrawing(drawing))),0x2620);
  assert.equal(carvingParticleSymbol({...drawing,effectId:"blood-v1"}),PERSONAL_SYMBOL);
  assert.equal(PERSONAL_SYMBOL,0x1f5e1);
  const ordinary={...drawing,particleSymbol:undefined};
  assert.equal(carvingParticleSymbol(ordinary),carvingParticleSymbol(unpackDrawing(packDrawing(ordinary))));
});

test("Common uses ivory without changing stored pigment; uncommon pigments and their edges remain readable",()=>{
  assert.equal(carvingPigment("common","#5A321F"),"#F3E7CB");
  assert.equal(carvingPigment("superior","#00F5FF"),"#00F5FF");
  assert.equal(BEBRAVE_EPIC_COLORS.some(choice=>/violet|purple/i.test(choice.name)),false);
  for(const {name,value} of BEBRAVE_UNCOMMON_COLORS){
    assert.ok(contrastRatio(value,"#765D3F")>=3,`${name}: representative middle-tone bark`);
    assert.ok(contrastRatio(value,carvingEdge(value))>=3,`${name}: continuous engraved edge`);
  }
});

test("drawing cancels selection and long-press menus and restores normal browsing on cleanup",()=>{
  const target=new EventTarget();let cleared=0;
  const document={documentElement:{dataset:{} as Record<string,string>},defaultView:{getSelection:()=>({removeAllRanges:()=>cleared++})}};
  const root=Object.assign(target,{ownerDocument:document}) as unknown as HTMLElement;
  const cleanup=lockCarvingSelection(root);
  assert.equal(cleared,1);assert.equal(document.documentElement.dataset.bebraveDrawing,"true");
  assert.equal(root.dispatchEvent(new Event("selectstart",{cancelable:true})),false);
  assert.equal(root.dispatchEvent(new Event("contextmenu",{cancelable:true})),false);
  cleanup();assert.equal(document.documentElement.dataset.bebraveDrawing,undefined);
  assert.equal(root.dispatchEvent(new Event("selectstart",{cancelable:true})),true);
  assert.equal(root.dispatchEvent(new Event("contextmenu",{cancelable:true})),true);
});
