import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {drawingInputOpen} from '../lib/bebrave/input-window';
import {afterReveal,resumedScene} from '../lib/bebrave/presentation';
import type {BeBraveSessionView} from '../lib/bebrave-types';
import {BeBraveStroke,StrokeLayers,pointsToPath} from '../components/bebrave-stroke';

test('input closes at the server deadline even before the next HUD tick, and while finalizing',()=>{
 const deadline='2026-10-12T03:00:00Z',end=Date.parse(deadline);
 assert.equal(drawingInputOpen(deadline,end-1,0,false),true);
 assert.equal(drawingInputOpen(deadline,end,0,false),false);
 assert.equal(drawingInputOpen(deadline,end-100,200,false),false);
 assert.equal(drawingInputOpen(deadline,end-100,0,true),false);
 assert.equal(drawingInputOpen(null,end-100,0,false),false);
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
