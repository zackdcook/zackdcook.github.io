import test from "node:test";
import assert from "node:assert/strict";
import {createLeafReader,requestReaderLeaf,beginReaderFall,selectedReaderLeaf,type LeafReaderStack} from "../lib/leaf-reader";

function twoLayers(stack: LeafReaderStack) {
  const layers=[stack.current,stack.underneath].filter(layer=>layer!==null);
  assert.ok(layers.length<=2);
  assert.equal(new Set(layers.map(layer=>layer.key)).size,layers.length);
}
test("reader leaves land on the former current leaf while reusing the buried slot",()=>{
  const first=createLeafReader(0),second=requestReaderLeaf(first,1);
  assert.equal(second.current.index,1); assert.equal(second.underneath?.index,0);
  assert.equal(second.underneath?.key,first.current.key);
  const retiring=requestReaderLeaf(second,2);
  assert.equal(retiring.current,second.current,"the visible current leaf stays in place while the buried leaf fades");
  assert.equal(retiring.underneath,second.underneath);
  assert.equal(selectedReaderLeaf(retiring),2);
  const third=beginReaderFall(retiring);
  assert.equal(third.current.index,2); assert.equal(third.underneath?.index,1);
  assert.equal(third.underneath?.key,second.current.key);
  assert.equal(third.current.falling,true); assert.equal(third.underneath?.falling,false);
  [first,second,retiring,third].forEach(twoLayers);
});
test("rapid navigation keeps only the latest request and never adds a third leaf",()=>{
  let stack=requestReaderLeaf(createLeafReader(0),1);
  for(let i=0;i<120;i++) {
    const next=(i*5+3)%7;
    stack=requestReaderLeaf(stack,next);twoLayers(stack);
    assert.equal(selectedReaderLeaf(stack),next);
    if(i%4===0) {stack=beginReaderFall(stack);twoLayers(stack);assert.equal(stack.current.index,next);}
  }
  const selected=selectedReaderLeaf(stack);
  stack=beginReaderFall(stack);
  assert.equal(stack.current.index,selected); assert.equal(stack.pending,null); twoLayers(stack);
});
test("reduced effects navigate immediately and returning to the current leaf cancels retirement",()=>{
  const stack=requestReaderLeaf(createLeafReader(0),1);
  const pending=requestReaderLeaf(stack,2);
  const cancelled=requestReaderLeaf(pending,1);
  assert.equal(cancelled.pending,null);
  assert.equal(beginReaderFall(cancelled),cancelled);
  const reduced=requestReaderLeaf(pending,6,true);
  assert.equal(reduced.current.index,6); assert.equal(reduced.current.falling,false);
  assert.equal(reduced.pending,null); twoLayers(reduced);
});
