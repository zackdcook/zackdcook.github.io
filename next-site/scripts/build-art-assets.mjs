import {readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {artworkCSS,validateArtwork} from "./art-assets.mjs";

const assets=JSON.parse(readFileSync(new URL('../design/art-assets.json',import.meta.url),'utf8'));
validateArtwork(assets,fileURLToPath(new URL('../public',import.meta.url)));
const output=artworkCSS(assets),target=new URL('../app/art-assets.css',import.meta.url);
if(process.argv.includes('--check')){
  if(readFileSync(target,'utf8')!==output)throw Error('Artwork CSS is out of date; run npm run art:build.');
}else writeFileSync(target,output);
