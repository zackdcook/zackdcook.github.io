import {test,mock} from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import type {BeBraveSessionView} from "../lib/bebrave-types";
import {toolsFarewell} from "../lib/bebrave/presentation";
mock.module("../components/bebrave-menu.tsx",{exports:{choiceKeys:()=>{}}});
const {ToolEncounter}=await import("../components/bebrave-tool-encounter.tsx");

const session:BeBraveSessionView={id:"encounter-check",status:"ready",chosenTool:"cache",chosenRarity:"legendary",chosenColor:null,chosenEffect:"will-o-wisp-v1",effectSeed:12,toolResults:{arrowhead:"epic",nail:"common",key:"superior"},drawingStartedAt:null,drawingDeadline:null,drawingFinishedAt:null,zoneTop:null,zoneBottom:null,treeRevision:null,publicSequence:null};

test("unlocking replaces the cache artwork and gives the knife a separate floating slot",()=>{
  const before=renderToStaticMarkup(createElement(ToolEncounter,{session,reveal:false}));
  const after=renderToStaticMarkup(createElement(ToolEncounter,{session,reveal:true}));
  assert.equal((before.match(/class="bebrave-tool-image tool-cache"/g)||[]).length,1);
  assert.equal((after.match(/class="bebrave-tool-image tool-cache-open"/g)||[]).length,1);
  assert.ok(!after.includes('class="bebrave-tool-image tool-cache"'));
  assert.ok(after.includes('class="bebrave-tool-display"><span class="bebrave-tool-image tool-cache-open"'));
  assert.ok(after.includes('class="bebrave-cache-knife"><span class="bebrave-tool-image tool-knife"'));
  assert.equal((after.match(/class="bebrave-object-label"/g)||[]).length,4);
});

test("the reveal retains all other item names and rarities with the revised narration",()=>{
  const markup=renderToStaticMarkup(createElement(ToolEncounter,{session,reveal:true}));
  for(const name of ["Stone-carved arrowhead: epic","Bent rusty nail: common","Brass house key: superior"])assert.ok(markup.includes(`aria-label="${name}"`));
  assert.equal(toolsFarewell,"The other items speak their names before fading away…");
});
