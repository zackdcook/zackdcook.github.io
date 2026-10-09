import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {artworkCSS,validateArtwork} from "../scripts/art-assets.mjs";
import {artworkAssets,artworkSource} from "../lib/art-assets";
import {materialPose} from "../lib/material-light";

test("artwork variants resolve all four themes without downloading unselected assets",()=>{
  const config={sample:{kind:"image",src:"/images/base.webp",variants:{"living-dark":"/images/moon.webp","felled-light":"/images/ash.webp","felled-dark":"/images/night.webp"}}};
  const css=artworkCSS(config);
  assert.match(css,/:root \{\n  --asset-sample: url\("\/images\/base.webp"\)/);
  for(const path of ['moon','ash','night'])assert.match(css,new RegExp(`/images/${path}\\.webp`));
  assert.equal(artworkSource("tree-bark","felled-dark"),artworkAssets["tree-bark"].src);
});
test("artwork source paths reject external origins, traversal and CSS injection",()=>{
  for(const src of ['https://example.com/a.svg','//example.com/a.svg','/images/../secret.svg','/images/a.svg\");color:red;/*','/images/a.svg?token=secret']){
    assert.throws(()=>validateArtwork({sample:{kind:'image',src}}));
  }
  assert.throws(()=>validateArtwork({sample:{kind:'image',src:'/images/a.svg',variants:{'another-mode':'/images/b.svg'}}}));
});
test("every configured asset exists and generated theme CSS matches the registry",()=>{
  validateArtwork(artworkAssets,"public");
  assert.equal(readFileSync("app/art-assets.css","utf8"),artworkCSS(artworkAssets));
  assert.equal(artworkAssets.manuscript.kind,"none");
});
test("material pose stays bounded at extreme input and returns to rest",()=>{
  const bounds={left:50,top:20,width:100,height:200};
  for(const [x,y] of [[-10000,-10000],[10000,10000],[100,120]]){
    const pose=materialPose(bounds,x,y,3);
    assert.ok(Math.abs(pose.yaw)<=1.8&&Math.abs(pose.pitch)<=1.8);
    assert.ok(Math.abs(pose.castX)<=6&&pose.castY>=4&&pose.castY<=16);
  }
  assert.deepEqual(materialPose(bounds,10000,10000,0),{yaw:0,pitch:-0,castX:-0,castY:10});
});
