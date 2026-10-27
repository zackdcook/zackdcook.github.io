import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name:"Zack Cook — Engineer & Author",short_name:"Zack Cook",start_url:"/",display:"standalone",background_color:"#FFF8ED",theme_color:"#1b3528",icons:[{src:"/images/brand/zack-cook-geode-192.png",sizes:"192x192",type:"image/png",purpose:"any"},{src:"/images/brand/zack-cook-geode-512.png",sizes:"512x512",type:"image/png",purpose:"any"}] };
}
