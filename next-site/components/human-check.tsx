"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global { interface Window { turnstile?: { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void; reset: (id: string) => void } } }

export function HumanCheck({ siteKey, action, resetKey, onToken }: { siteKey: string; action: "bebrave" | "book_launch"; resetKey: string; onToken?: (token: string) => void }) {
  const host = useRef<HTMLDivElement>(null), widget = useRef<string | null>(null);
  const [ready, setReady] = useState(false), [token, setToken] = useState(""), [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!ready || !host.current || !window.turnstile) return;
    widget.current = window.turnstile.render(host.current, { sitekey: siteKey, action, theme: "auto", ...(action === "book_launch" ? { appearance: "interaction-only" } : {}), size: "flexible", "response-field": false, callback: (value: string) => { setToken(value); setFailed(false); }, "expired-callback": () => setToken(""), "error-callback": () => { setToken(""); setFailed(true); } });
    return () => { if (widget.current) window.turnstile?.remove(widget.current); widget.current = null; };
  }, [ready, action, siteKey]);
  useEffect(() => { setToken(""); if (widget.current) window.turnstile?.reset(widget.current); }, [resetKey]);
  useEffect(() => { onToken?.(token); }, [token, onToken]);
  return <div className="human-check">
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setFailed(true)} />
    <div ref={host} />
    <input type="hidden" name="cf-turnstile-response" value={token} />
    {failed && <p className="form-hint" role="alert">The human check couldn’t load. Reload this page to try again.</p>}
  </div>;
}
