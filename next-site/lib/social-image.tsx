import "server-only";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ShareRecord } from "@/lib/page-metadata";

export async function socialImage(record: ShareRecord) {
  const [logo, display, body] = await Promise.all([
    readFile(join(process.cwd(), "app/icon.png")),
    readFile(join(process.cwd(), "public/fonts/Fraunces-Soft-Semibold.ttf")),
    readFile(join(process.cwd(), "public/fonts/DM-Sans-Regular.ttf")),
  ]);
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: "#FFF8ED", color: "#31031F", padding: 44, fontFamily: "DM Sans" }}>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", border: "2px solid #66693E", borderRadius: "30px 8px 30px 8px", width: "100%", padding: "35px 45px", background: "#FFF8ED" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22 }}><div style={{ display: "flex", gap: 14, alignItems: "center" }}><img alt="" src={`data:image/png;base64,${logo.toString("base64")}`} width={52} height={52} />Zack Cook</div><div style={{ display: "flex", padding: "10px 20px", background: "#E88F93", borderRadius: "14px 14px 0 0" }}>{record.category}</div></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}><div style={{ fontFamily: "Fraunces", fontWeight: 600, fontSize: record.title.length > 30 ? 64 : 84, lineHeight: 1.06, letterSpacing: -2 }}>{record.title}</div><div style={{ fontSize: 25, lineHeight: 1.4, color: "#393313" }}>{record.description.length > 210 ? record.description.slice(0, 207) + "…" : record.description}</div></div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 20, borderTop: "2px solid #E88F93", paddingTop: 22 }}><div>Aspiring Author + Engineer</div><div>{record.status || "zackdcook.com"}</div></div>
    </div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "Fraunces", data: display, weight: 600 }, { name: "DM Sans", data: body, weight: 400 }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
