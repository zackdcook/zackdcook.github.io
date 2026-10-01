import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = "Zack Cook — Fiction writer & engineer in Lakeland, Florida";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ShareImage() {
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "64px 76px", background: "#F4F1DE", color: "#3D405B" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24 }}><svg width="64" height="64" viewBox="0 0 48 48" fill="none"><path d="M18 25V12l6 4 6-4v13c0 4-12 4-12 0Z" fill="#E07A5F"/><path d="M6 28c7-2 13-1 18 3 5-4 11-5 18-3v12c-7-2-13-1-18 3-5-4-11-5-18-3V28Z" stroke="#3D405B" strokeWidth="3"/><path d="M24 32v10" stroke="#3D405B" strokeWidth="3"/></svg>zackdcook.com</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}><div style={{ display: "flex", fontSize: 112, fontWeight: 700, letterSpacing: -6 }}>Zack <span style={{ color: "#B34D37", marginLeft: 24 }}>Cook.</span></div><div style={{ fontSize: 34 }}>Engineer by day. Author in play.</div></div>
    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #D5CDB8", paddingTop: 24, fontSize: 22 }}><span>Lakeland, Florida</span><span>{site.name} · Creative works & Words of Folly</span></div>
  </div>, size);
}
