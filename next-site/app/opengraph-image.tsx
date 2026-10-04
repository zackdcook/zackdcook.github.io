import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ShareImage() {
  const [logo, font, bodyFont] = await Promise.all([
    readFile(join(process.cwd(), "app/icon.png")),
    readFile(join(process.cwd(), "public/fonts/Fraunces-Soft-Semibold.ttf")),
    readFile(join(process.cwd(), "public/fonts/DM-Sans-Regular.ttf")),
  ]);
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "64px 76px", background: "#FFF8ED", color: "#31031F", fontFamily: "DM Sans" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24 }}><img src={`data:image/png;base64,${logo.toString("base64")}`} width={64} height={64} alt="" style={{ borderRadius: 12 }} />zackdcook.com</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}><div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 108, fontWeight: 600, letterSpacing: -3 }}>Zack <span style={{ color: "#66693E", marginLeft: 24 }}>Cook.</span></div><div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32 }}><svg width="40" height="36" viewBox="0 0 40 36"><path d="M3 13H36L30 7M37 23H4L10 29" fill="none" stroke="#31031F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>Aspiring Author + Engineer</div></div>
    {/* The bundled fonts lack ⇌; reuse the harpoon paths for the same symbol. */}
    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #E88F93", paddingTop: 24, fontSize: 21 }}><span style={{ display: "flex", alignItems: "center", gap: 7 }}>Engineer<svg width="24" height="22" viewBox="0 0 40 36"><path d="M3 13H36L30 7M37 23H4L10 29" fill="none" stroke="#31031F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>Author</span><span>Creative works & Words of Folly</span></div>
  </div>, { ...size, fonts: [{ name: "Fraunces", data: font, weight: 600, style: "normal" }, { name: "DM Sans", data: bodyFont, weight: 400, style: "normal" }] });
}
