import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync,existsSync,readdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import baseline from "../docs/reimagining/baseline-manifest.json";
import copy from "../docs/reimagining/authored-copy.json";
import exceptions from "../docs/reimagining/copy-exceptions.json";
import {authoredCopy} from "../scripts/copy-inventory.mjs";

test("every baseline route and authored content file is preserved",()=>{
  for(const route of baseline.routes)assert.ok(existsSync(resolve("..",route)),`Missing route: ${route}`);
  for(const [path,digest] of Object.entries(baseline.content))assert.equal(createHash("sha256").update(readFileSync(resolve("..",path))).digest("hex"),digest,`Authored content changed: ${path}`);
});
test("baseline JSX wording, image alternatives, labels and hidden lockbox dialogue remain verbatim",()=>{
  const current=new Set<string>();
  const files=["app","components"].flatMap(directory=>readdirSync(directory,{recursive:true}).filter(name=>typeof name==="string"&&name.endsWith(".tsx")).map(name=>resolve(directory,String(name))));
  for(const path of files)for(const item of authoredCopy(readFileSync(path,"utf8"),path))current.add(item);
  const missing=Object.entries(copy.inventory).flatMap(([path,items])=>items.filter(item=>!current.has(item)&&!exceptions.some(exception=>exception.path===path&&exception.text===item)).map(item=>({path,item})));
  assert.deepEqual(missing,[]);
});
