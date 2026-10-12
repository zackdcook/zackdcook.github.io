import test from 'node:test';
import assert from 'node:assert/strict';
import { carvingBounds,pickCarving } from '../lib/bebrave/carving-inspection';
import type { BeBravePublicDrawing } from '../lib/bebrave-types';
const carving=(sequence:number,points:Array<[number,number]>):BeBravePublicDrawing=>({id:String(sequence),publicSequence:sequence,rarity:'common',color:'#000000',effectSeed:0,strokes:[{strokeId:'line',strokeOrder:0,points}]});
test('inspection hits between vertices and keeps the earlier painter above overlaps',()=>{
  const old=carving(1,[[0,100],[720,100]]),newer=carving(2,[[0,100],[720,100]]);
  assert.equal(pickCarving([newer,old],[360,109],12)?.id,old.id);
  assert.equal(pickCarving([newer,old],[360,140],12),null);
});
test('inspection radius converts screen tolerance without shifting stored art',()=>{
  const item=carving(7,[[100,100],[100,300]]),before=JSON.stringify(item);
  assert.equal(pickCarving([item],[118,220],9/.5)?.id,item.id);
  assert.equal(pickCarving([item],[119,220],9/.5),null);
  assert.equal(JSON.stringify(item),before);
});
test('canonical framing handles dots, horizontal art and high world coordinates',()=>{
  assert.deepEqual(carvingBounds(carving(1,[[200,28_800_000],[300,28_800_000]]),32),{left:168,top:28_799_968,width:164,height:64});
  assert.ok(carvingBounds(carving(1,[[200,200],[200.3,200]])).height>=48);
});
