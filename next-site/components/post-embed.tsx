"use client";
import { useEffect, useRef, useState } from "react";
import type { PublicPostEmbed } from "@/lib/embeds";

export function PostEmbed({ embed, title }: { embed: PublicPostEmbed; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(embed.provider === "Instagram" ? 620 : 420);
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!loaded) return;
    const resize = (event: MessageEvent) => {
      if (event.origin !== new URL(embed.url).origin || event.source !== frame.current?.contentWindow) return;
      let value = event.data;
      if (typeof value === "string" && value.length < 10000) {
        try { value = JSON.parse(value); } catch { return; }
      }
      const measured = typeof value === "number" ? value : value?.type === "MEASURE" ? value.details?.height : null;
      if (typeof measured === "number" && Number.isFinite(measured)) setHeight(Math.min(1400, Math.max(250, measured)));
    };
    window.addEventListener("message", resize);
    return () => window.removeEventListener("message", resize);
  }, [loaded, embed.url]);
  return <div className="post-embed">
    {loaded ? <iframe ref={frame} src={embed.url} height={height} title={`${title} on ${embed.provider}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="fullscreen" /> : <>
      <p>Load the original post from {embed.provider}. This connects to {embed.provider}.</p>
      <button className="button button-outline" type="button" onClick={() => setLoaded(true)}>Show {embed.provider} post ↗</button>
    </>}
  </div>;
}
