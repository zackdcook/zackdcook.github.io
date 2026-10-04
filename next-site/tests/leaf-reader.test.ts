import test from "node:test";
import assert from "node:assert/strict";
import {createLeafReader,requestReaderLeaf,finishReaderFall,selectedReaderLeaf,leafFallMs,leafFadeStartMs,leafRetireMs,type LeafReaderStack} from "../lib/leaf-reader";

function boundedLayers(stack: LeafReaderStack) {
  const layers=[stack.current,stack.underneath,stack.retiring].filter(layer=>layer!==null);
  assert.ok(layers.length<=3);
  assert.equal(new Set(layers.map(layer=>layer.key)).size,layers.length);
}
test("the next leaf falls immediately while the oldest stays beneath the previous leaf",()=>{
  const first=createLeafReader(0),second=requestReaderLeaf(first,1),third=requestReaderLeaf(second,2);
  assert.equal(third.current.index,2);assert.equal(third.current.falling,true);
  assert.equal(third.underneath?.key,second.current.key);
  assert.equal(third.retiring?.key,first.current.key);
  assert.ok(leafFadeStartMs>leafFallMs*.75,"retirement waits until near landing");
  assert.ok(leafRetireMs-leafFadeStartMs>700,"the older blade fades gently");
  const landed=finishReaderFall(third);
  assert.equal(landed.current.index,2);assert.equal(landed.current.falling,false);
  assert.equal(landed.retiring,null);assert.equal(landed.underneath,third.underneath);
  [first,second,third,landed].forEach(boundedLayers);
});
test("rapid navigation remains bounded and immediately shows the latest request",()=>{
  let stack=createLeafReader(0);
  for(let i=0;i<120;i++) {
    const next=(i*5+3)%8;
    stack=requestReaderLeaf(stack,next);boundedLayers(stack);
    assert.equal(selectedReaderLeaf(stack),next);
    if(i%4===0) {stack=finishReaderFall(stack);boundedLayers(stack);}
  }
});
test("reduced effects navigate without falling or a retiring layer",()=>{
  const stack=requestReaderLeaf(requestReaderLeaf(createLeafReader(0),1),2,true);
  assert.equal(stack.current.index,2);assert.equal(stack.current.falling,false);
  assert.equal(stack.retiring,null);boundedLayers(stack);
  assert.equal(requestReaderLeaf(stack,2),stack);
});
