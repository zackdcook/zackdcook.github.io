import { publicImageRecords } from "@/lib/public-images";
import { site } from "@/content/site";
const xml = (value:string) => value.replace(/[<>&'\"]/g, c=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'"':"&quot;"}[c]!));
export function GET() {
  const live=process.env.SITE_LIVE==="true" && process.env.VERCEL_ENV!=="preview";
  const pages=[...new Set(publicImageRecords.map(image=>image.page))];
  const entries=live ? pages.map(page=>`<url><loc>${xml(site.url+page)}</loc>${publicImageRecords.filter(image=>image.page===page).map(image=>`<image:image><image:loc>${xml(new URL(image.src,site.url).href)}</image:loc></image:image>`).join("")}</url>`).join("") : "";
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries}</urlset>`,{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=3600, s-maxage=86400"}});
}
