import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BeBraveCarving, enchantmentParticleStyle } from "../components/bebrave-stroke";
import { packDrawing, unpackDrawing } from "../lib/bebrave/completed-strokes";
import { admireAtmosphere } from "../lib/bebrave/admire-atmosphere";
import { canonicalRedirects, canonicalPath } from "../lib/canonical-routes";
import { pageMetadata, shareRecords } from "../lib/page-metadata";
import { legendaryEffect,legendaryColor } from "../lib/bebrave/effects";

const drawing={id:"published-epic",publicSequence:12,rarity:"epic" as const,color:"#FF2BD6",effectSeed:8123,
  strokes:[{strokeId:"first",strokeOrder:0,points:[[100,1400],[500,1600],[100,1800]] as Array<[number,number]>},
    {strokeId:"crossing",strokeOrder:1,points:[[500,1400],[100,1600],[500,1800]] as Array<[number,number]>}]};

test("only enchanted tiers emit glow; only Epic and Legendary emit detached effects",()=>{
  for(const rarity of ["common","uncommon","superior","epic","legendary"] as const){
    const html=renderToStaticMarkup(createElement(BeBraveCarving,{strokes:drawing.strokes,color:drawing.color,seed:drawing.effectSeed,rarity}));
    assert.equal(html.includes('class="bebrave-stroke-halo"'),["superior","epic","legendary"].includes(rarity));
    assert.equal(html.includes('class="bebrave-sparkle"'),rarity==="epic"||rarity==="legendary");
    assert.equal(html.includes('class="bebrave-energy-particle"'),rarity==="epic");
    assert.ok(html.includes(`stroke="${drawing.color}"`));
  }
});

test("published Epic reconstructs identical colored emitters after storage round trip",()=>{
  const render=(d:typeof drawing)=>renderToStaticMarkup(createElement(BeBraveCarving,{strokes:d.strokes,color:d.color,seed:d.effectSeed,rarity:d.rarity}));
  const original=JSON.stringify(drawing);
  assert.equal(render(drawing),render(unpackDrawing(packDrawing(drawing)) as typeof drawing));
  assert.equal(JSON.stringify(drawing),original);
  for(const name of ["bebrave-energy-mote","bebrave-sparkle-star","bebrave-energy-trail","bebrave-energy-satellite"])assert.ok(render(drawing).includes(name));
  assert.deepEqual(enchantmentParticleStyle(3.2,2.8),enchantmentParticleStyle(3.2,2.8));
});

test("Admire starts its long night transition only after the scenery has left the camera",()=>{
  const total=24_000,viewport=844;
  assert.equal(admireAtmosphere(0,total,viewport).horizonOpacity,1);
  assert.equal(admireAtmosphere(viewport*4,total,viewport).progress,0);
  assert.equal(admireAtmosphere(viewport*4,total,viewport).color,"#152f58");
  for(const length of [3000,total,100000]){
    const exit=Math.min(viewport*10.8,length*.6);
    const after=admireAtmosphere(exit+1,length,viewport);
    assert.equal(after.horizonOpacity,0);assert.equal(after.midgroundOpacity,0);
    assert.ok(after.horizonY>=viewport*1.08);
    assert.equal(after.progress,0);
  }
  assert.equal(admireAtmosphere(total,total,viewport).color,"#020308");
  const middle=admireAtmosphere(total/2,total,viewport);
  assert.equal(middle.midgroundOpacity,0);assert.equal(middle.horizonOpacity,0);
  assert.ok(middle.horizonY>viewport,"parallax does not stop at seven vh");
  for(let rise=0;rise<total;rise+=500)assert.ok(admireAtmosphere(rise,total,viewport).progress<=admireAtmosphere(rise+1,total,viewport).progress);
  assert.equal(admireAtmosphere(total*2,total,viewport).color,"#020308");
  assert.ok(Number.isFinite(admireAtmosphere(0,0,0).progress));
  const slower=admireAtmosphere(viewport*9,100000,viewport);
  assert.equal(slower.horizonOpacity,1,"distant scenery remains until nine screen heights of ascent");
  assert.equal(slower.progress,0);
  const night=admireAtmosphere(100000,100000,viewport);
  assert.equal(night.topColor,"#010205");assert.equal(night.bottomColor,"#020308");
  assert.ok(night.starTravel>0,"sky depth continues after the scenery has left");
});

test("each Legendary identity survives archive storage and reconstructs its distinct particle design",()=>{
  for(const effectId of ["hearts-v1","rainbow-v1","blood-v1"]){
    const saved={...drawing,rarity:"legendary" as const,effectId};
    const render=(d:typeof saved)=>renderToStaticMarkup(createElement(BeBraveCarving,{strokes:d.strokes,color:d.color,rarity:d.rarity,seed:d.effectSeed,effectId:d.effectId}));
    assert.equal(render(saved),render(unpackDrawing(packDrawing(saved)) as typeof saved));
    assert.ok(render(saved).includes(`data-effect="${effectId}"`));
    assert.ok(render(saved).includes('class="bebrave-energy-particle"'));
    if(effectId==="hearts-v1")assert.ok(render(saved).includes('bebrave-heart'));
    if(effectId==="rainbow-v1")assert.ok(render(saved).includes('linearGradient'));
    if(effectId==="blood-v1"){
      assert.ok(render(saved).includes('bebrave-blood-drop'));
      assert.ok(render(saved).includes('stroke="#C51D36"'));
      assert.ok(Number.parseFloat(String(enchantmentParticleStyle(3.5,2,effectId)["--particle-y" as keyof ReturnType<typeof enchantmentParticleStyle>]))>0);
    }
  }
  assert.equal(legendaryEffect("future-unknown-id"),"will-o-wisp-v1");
  assert.equal(legendaryColor("blood-v1","#00F5FF"),"#C51D36");
  assert.equal(legendaryColor("hearts-v1","#00F5FF"),"#00F5FF");
});

test("legacy and hyphenated URLs redirect directly to the canonical content URLs",()=>{
  const aliases=new Set(canonicalRedirects.map(route=>route.source));
  for(const route of canonicalRedirects)assert.ok(!aliases.has(route.destination),`redirect chain: ${route.source}`);
  for(const record of shareRecords)assert.equal(pageMetadata(record.id).alternates?.canonical,`https://zackdcook.com${record.path}`);
  for(const path of ["/aboutme","/creativeworks"])assert.ok(shareRecords.some(record=>record.path===path));
  assert.equal(canonicalPath("/about-me"),"/aboutme");
  assert.equal(canonicalPath("/creative-works"),"/creativeworks");
  assert.equal(canonicalPath("/writing/first-novel"),"/writing/first-novel");
});
