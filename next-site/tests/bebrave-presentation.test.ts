import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {drawingInputOpen} from '../lib/bebrave/input-window';
import {afterReveal,resumedScene} from '../lib/bebrave/presentation';
import type {BeBraveSessionView} from '../lib/bebrave-types';
import {BeBraveCarving,BeBraveStroke,StrokeLayers,carvingToPath,pointsToPath} from '../components/bebrave-stroke';
import {sparklePoints} from '../lib/bebrave/effect-anchors';

test('input closes at the server deadline even before the next HUD tick, and while finalizing',()=>{
 const deadline='2026-10-12T03:00:00Z',end=Date.parse(deadline);
 assert.equal(drawingInputOpen(deadline,end-1,0,false),true);
 assert.equal(drawingInputOpen(deadline,end,0,false),false);
 assert.equal(drawingInputOpen(deadline,end-100,200,false),false);
 assert.equal(drawingInputOpen(deadline,end-100,0,true),false);
 assert.equal(drawingInputOpen(null,end-100,0,false),false);
});

test('crossing strokes share each ink layer without connecting or altering their original paths',()=>{
 const strokes=[
  {strokeId:'first',strokeOrder:0,points:[[20.1,1500.2],[120.3,1600.4]] as Array<[number,number]>},
  {strokeId:'second',strokeOrder:1,points:[[120.3,1500.2],[20.1,1600.4]] as Array<[number,number]>},
 ];
 const before=JSON.stringify(strokes),d=carvingToPath(strokes);
 assert.equal(d,'M20.1 1500.2 L120.3 1600.4 M120.3 1500.2 L20.1 1600.4');
 for(const rarity of ['common','uncommon','superior','epic','legendary'] as const){
  const markup=renderToStaticMarkup(createElement(BeBraveCarving,{strokes,color:'#00F5FF',rarity,seed:3812,effectId:'will-o-wisp-v1'}));
  for(const layer of ['contrast','cut','rim','line','inlay']){
   assert.equal((markup.match(new RegExp(`class="bebrave-stroke-${layer}"`,'g'))||[]).length,1);
   assert.ok(markup.includes(`class="bebrave-stroke-${layer}" d="${d}"`));
  }
 }
 assert.equal(JSON.stringify(strokes),before);
});

test('session-wide ink keeps each original stroke seed and sparkle anchor',()=>{
 const strokes=[
  {strokeId:'a',strokeOrder:1,points:[[10,1510],[50,1550],[120,1590]] as Array<[number,number]>},
  {strokeId:'b',strokeOrder:4,points:[[140,1510],[120,1530],[10,1590]] as Array<[number,number]>},
 ];
 const markup=renderToStaticMarkup(createElement(BeBraveCarving,{strokes,color:'#C337AA',rarity:'legendary',seed:9001,effectId:'will-o-wisp-v1'}));
 for(const stroke of strokes){
  assert.ok(markup.includes(`data-stroke-id="${stroke.strokeId}"`));
  for(const anchor of sparklePoints(stroke.points,9001,stroke.strokeOrder))assert.ok(markup.includes(`transform="translate(${anchor.x} ${anchor.y})"`));
 }
 assert.ok(markup.includes('--stroke-color:#C337AA'));assert.ok(markup.includes('data-effect="will-o-wisp-v1"'));
});
test('resumed server choices replay presentation without returning to tool selection or starting time',()=>{
 const session={status:'ready',chosenTool:'nail'} as BeBraveSessionView;
 assert.equal(resumedScene(session),'reveal');assert.equal(afterReveal(session),'warning');
 assert.equal(resumedScene({...session,status:'epic_color'}),'epic-color');
 assert.equal(afterReveal({...session,status:'epic_color'}),'epic-color');
 assert.equal(resumedScene({...session,status:'drawing'}),'draw');
});
test('every live ink stack is embedded unchanged in its released and published renderer',()=>{
 const points:Array<[number,number]>=[[19.2,1600.1],[190.3,1760.7],[205.4,1700.2]];
 const d=pointsToPath(points);
 for(const rarity of ['common','uncommon','superior','epic','legendary'] as const){
  const layers=renderToStaticMarkup(createElement(StrokeLayers,{d,color:'#00F5FF',rarity}));
  const released=renderToStaticMarkup(createElement(BeBraveStroke,{stroke:{strokeId:'same',strokeOrder:2,points},color:'#00F5FF',rarity,seed:73121,effectId:'will-o-wisp-v1'}));
  assert.ok(released.includes(layers));assert.ok(released.includes('--stroke-color:#00F5FF'));
  assert.ok(layers.includes('M19.2 1600.1 L190.3 1760.7 L205.4 1700.2'));
  assert.equal(released,renderToStaticMarkup(createElement(BeBraveStroke,{stroke:{strokeId:'same',strokeOrder:2,points},color:'#00F5FF',rarity,seed:73121,effectId:'will-o-wisp-v1'})));
 }
});
