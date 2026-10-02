import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Zack Cook — Engineer & aspiring author";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function ShareImage() {
  const [logo, font] = await Promise.all([
    readFile(join(process.cwd(), "app/icon.png")),
    readFile(join(process.cwd(), "public/fonts/Indigo-Regular.otf")),
  ]);
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "64px 76px", background: "#F4F1DE", color: "#3D405B" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24 }}><img src={`data:image/png;base64,${logo.toString("base64")}`} width={64} height={64} alt="" style={{ borderRadius: 12 }} />zackdcook.com</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}><div style={{ display: "flex", fontFamily: "Indigo", fontSize: 112, fontWeight: 400, letterSpacing: -4 }}>Zack <span style={{ color: "#E07A5F", marginLeft: 24 }}>Cook.</span></div><div style={{ fontSize: 34 }}>Engineer & aspiring author</div></div>
    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #81B29A", paddingTop: 24, fontSize: 22 }}><span>Engineer by day. Author at play.</span><span>Creative works & Words of Folly</span></div>
  </div>, { ...size, fonts: [{ name: "Indigo", data: font, weight: 400, style: "normal" }] });
}
