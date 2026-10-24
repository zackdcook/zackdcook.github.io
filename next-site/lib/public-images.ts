import { aboutMemories } from "@/content/about-photos";
import { site } from "@/content/site";
import { artworkSource } from "@/lib/art-assets";
export const publicImageRecords = [
  { src:artworkSource("portrait")!, page:"/aboutme", caption:"Zack Cook, aspiring author and industrial engineer in Lakeland, Florida", width:1200,height:1200 },
  { src:artworkSource("name-doodles")!, page:"/aboutme",caption:"Zacky C name doodles by Zack Cook",width:1200,height:1600 },
  ...aboutMemories.filter(photo=>photo.src).map(photo=>({src:photo.src!,page:"/aboutme",caption:photo.alt,width:photo.width,height:photo.height})),
  {src:artworkSource("cats")!,page:"/",caption:"Chemi, Tashi, and Brave, Zack Cook’s three cats",width:1400,height:1034},
  {src:"/images/brand/zack-cook-signature.svg",page:"/aboutme",caption:"Zack Cook’s handwritten signature",width:2978,height:1312},
  {src:"/images/brand/zack-cook-stone-512.png",page:"/",caption:"Zack Cook’s glowing Z author icon",width:512,height:512},
].filter(record=>record.src);
export function imageStructuredData(record:typeof publicImageRecords[number]) {
  return {"@type":"ImageObject",contentUrl:new URL(record.src,site.url).href,name:record.caption,caption:record.caption,width:record.width,height:record.height,isPartOf:{"@id":`${site.url}${record.page}`}};
}
