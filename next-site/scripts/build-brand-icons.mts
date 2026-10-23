import sharp from 'sharp';
import {writeFileSync,unlinkSync} from 'node:fs';
import {BRAND_MARK_PATH} from '../lib/brand-mark';
const wrap=(body:string)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 1280">${body}</svg>\n`;
const monochrome=wrap(`<path d="${BRAND_MARK_PATH}" fill="#000"/>`);
// One stable black-and-white mark for crawlers, tabs and saved-site icons.
const searchIcon=wrap(`<rect width="1280" height="1280" fill="#fff"/><path d="${BRAND_MARK_PATH}" fill="#000"/>`);
const base='public/images/brand/';
writeFileSync(base+'home-mark.svg',monochrome);
writeFileSync(base+'zack-cook-mark.svg',searchIcon);
writeFileSync('app/icon.svg',searchIcon);
try{unlinkSync('app/icon.png')}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
for(const size of [96,180])await sharp(Buffer.from(searchIcon)).resize(size,size).png().toFile(base+`zack-cook-mark-${size}.png`);
const sizes=[16,32,48,96];
const frames=await Promise.all(sizes.map(size=>sharp(Buffer.from(searchIcon)).resize(size,size).png().toBuffer()));
const header=Buffer.alloc(6+16*frames.length);header.writeUInt16LE(1,2);header.writeUInt16LE(frames.length,4);
let offset=header.length;
frames.forEach((bytes,i)=>{const entry=6+i*16;header[entry]=sizes[i];header[entry+1]=sizes[i];header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);header.writeUInt32LE(bytes.length,entry+8);header.writeUInt32LE(offset,entry+12);offset+=bytes.length;});
writeFileSync('app/favicon.ico',Buffer.concat([header,...frames]));
console.log('Generated black-and-white search, tab and saved-site icons from the existing Home vector.');
