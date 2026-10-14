import {test,mock} from "node:test";
import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import type {BeBraveSessionView} from "../lib/bebrave-types";
mock.module("../components/bebrave-menu.tsx",{exports:{choiceKeys:()=>{}}});
const {BladeEnchanter}=await import("../components/bebrave-blade-enchanter.tsx");

test("the initial workshop exposes both enabled pickers before an aura is chosen",()=>{
  const session:BeBraveSessionView={id:"workshop-check",status:"epic_color",chosenTool:"cache",chosenRarity:"legendary",chosenColor:null,chosenEffect:"will-o-wisp-v1",effectSeed:12,toolResults:null,drawingStartedAt:null,drawingDeadline:null,drawingFinishedAt:null,zoneTop:null,zoneBottom:null,treeRevision:null,publicSequence:null};
  const markup=renderToStaticMarkup(createElement(BladeEnchanter,{session,onBack:()=>{},onEnchant:()=>{}}));
  const fieldsets=[...markup.matchAll(/<fieldset([^>]*)>/g)];
  assert.equal(fieldsets.length,2);
  assert.ok(fieldsets.every(([,attributes])=>!attributes.includes("disabled")&&!attributes.includes("aria-hidden")));
  assert.ok(markup.includes("<legend>Aura</legend>"));
  assert.ok(markup.includes("<legend>Infusion</legend>"));
  assert.equal([...markup.matchAll(/<button[^>]*aria-label=/g)].length,24);
  assert.ok(markup.includes('aria-label="Death"'));
  assert.ok(markup.includes('aria-label="Hydrogendianion"'));
  assert.ok(!markup.includes('aria-pressed="true"'));
  assert.ok(!markup.includes('<canvas'));
  assert.ok(!markup.includes('Animated example X carving'));
  assert.ok(markup.includes('<figcaption></figcaption>'));
});

test("personal and previously enchanted sessions also start with no selection or sample carving",()=>{
  for(const chosenEffect of ["blood-v1","will-o-wisp-v1"]){
    const session:BeBraveSessionView={id:"blank-check",status:"ready",chosenTool:"cache",chosenRarity:"legendary",chosenColor:"#C51D36",chosenSymbol:0x1f5e1,chosenEffect,effectSeed:12,toolResults:null,drawingStartedAt:null,drawingDeadline:null,drawingFinishedAt:null,zoneTop:null,zoneBottom:null,treeRevision:null,publicSequence:null};
    const markup=renderToStaticMarkup(createElement(BladeEnchanter,{session,onBack:()=>{},onEnchant:()=>{}}));
    assert.ok(!markup.includes('aria-pressed="true"'));
    assert.ok(!markup.includes('<canvas'));
    assert.ok(!markup.includes('Animated example X carving'));
    assert.ok(markup.includes('<figcaption></figcaption>'));
  }
});
