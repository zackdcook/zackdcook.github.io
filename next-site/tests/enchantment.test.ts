import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BeBraveCarving, enchantmentParticleStyle } from "../components/bebrave-stroke";
import { packDrawing, unpackDrawing } from "../lib/bebrave/completed-strokes";
import { admireAtmosphere } from "../lib/bebrave/admire-atmosphere";
import { canonicalRedirects, canonicalPath } from "../lib/canonical-routes";
import { pageMetadata, shareRecords } from "../lib/page-metadata";

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

test("Admire changes across the whole history, fades scenery, and reaches black at the oldest mark",()=>{
  const total=24_000,viewport=844;
  assert.equal(admireAtmosphere(0,total,viewport).horizonOpacity,1);
  assert.equal(admireAtmosphere(total*.46,total,viewport).color,"#261942");
  assert.equal(admireAtmosphere(total,total,viewport).color,"#020308");
  const middle=admireAtmosphere(total/2,total,viewport);
  assert.equal(middle.midgroundOpacity,0);assert.equal(middle.horizonOpacity,0);
  assert.ok(middle.horizonY>viewport,"parallax does not stop at seven vh");
  for(let rise=0;rise<total;rise+=500)assert.ok(admireAtmosphere(rise,total,viewport).progress<admireAtmosphere(rise+1,total,viewport).progress);
  assert.equal(admireAtmosphere(total*2,total,viewport).color,"#020308");
  assert.ok(Number.isFinite(admireAtmosphere(0,0,0).progress));
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
