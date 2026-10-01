"use client";
import { useRef, useState } from "react";

export function CopyFeed({ url }: { url: string }) {
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setMessage("Copied. Paste this into your feed reader."); }
    catch { input.current?.focus(); input.current?.select(); setMessage("The address is selected. Copy it, then paste it into your feed reader."); }
  };
  return <><div className="feed-copy"><input aria-label="RSS feed address" value={url} readOnly ref={input} onClick={event => event.currentTarget.select()} /><button className="button" type="button" onClick={copy}>Copy feed address</button></div><p className="feed-status" role="status">{message}</p></>;
}
