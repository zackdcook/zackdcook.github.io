"use client";

import { useEffect, useRef, useState } from "react";
import { orientationAPI, recenterTiltEvent, requestTiltPermission, tiltStatusEvent } from "@/lib/phone-tilt";

export function TiltLightingControl({ enabled, reduced, resetVersion, onChange, prompt = false }: { enabled: boolean; reduced: boolean; resetVersion: number; onChange: (enabled: boolean) => void; prompt?: boolean }) {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<"ready" | "asking" | "active" | "denied" | "waiting">("ready");
  const [dismissed, setDismissed] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const coarse = matchMedia("(pointer: coarse)");
    const detect = () => setSupported(coarse.matches && Boolean(orientationAPI()));
    const active = () => { if (timeout.current) clearTimeout(timeout.current); setStatus("active"); };
    detect(); if (document.documentElement.dataset.tiltStatus === "active") active();
    coarse.addEventListener("change", detect); window.addEventListener(tiltStatusEvent, active);
    return () => { coarse.removeEventListener("change", detect); window.removeEventListener(tiltStatusEvent, active); if (timeout.current) clearTimeout(timeout.current); };
  }, []);
  useEffect(() => { window.dispatchEvent(new Event(recenterTiltEvent)); }, [resetVersion]);

  async function enable() {
    setStatus("asking");
    try {
      if (!await requestTiltPermission()) { onChange(false); setStatus("denied"); return; }
      onChange(true); setStatus("waiting");
      window.dispatchEvent(new Event(recenterTiltEvent));
      timeout.current = setTimeout(() => setStatus(current => current === "waiting" ? "ready" : current), 3000);
    } catch { onChange(false); setStatus("denied"); }
  }
  if (!supported) return null;
  if (prompt) {
    // Motion is the coarse-pointer default. Safari needs a deliberate gesture
    // once; unrelated navigation and ribbon gestures never request permission.
    if (!enabled || reduced || dismissed || status === "active" || status === "denied" || !orientationAPI()?.requestPermission) return null;
    return <aside className="tilt-lighting-prompt" aria-label="Enable phone lighting"><button className="button button-small" disabled={status === "asking" || status === "waiting"} onClick={enable}>{status === "asking" ? "Requesting access…" : status === "waiting" ? "Waiting for motion…" : "Enable tilt lighting"}</button><button className="button button-small" aria-label="Dismiss tilt lighting hint" onClick={() => setDismissed(true)}>×</button></aside>;
  }
  return <section className="tilt-preference" aria-label="Phone tilt lighting">
    <p><strong>Phone tilt lighting</strong></p>
    <p className="calendar-help" role="status">{reduced ? "Lighting rests while Reduce effects is on." : status === "denied" ? "Motion access wasn’t allowed. You can allow it in your browser’s settings." : status === "active" && enabled ? "Tilt your phone gently. No touching or holding needed." : status === "waiting" ? "Waiting for your phone’s motion sensor…" : "Let the light follow your phone’s tilt. Your browser may ask for motion access."}</p>
    <div className="actions">
      {status === "active" && enabled ? <><button className="button button-small" disabled={reduced} onClick={() => window.dispatchEvent(new Event(recenterTiltEvent))}>Re-center light</button><button className="button button-small" onClick={() => onChange(false)}>Turn off tilt lighting</button></> : <button className="button button-small" disabled={reduced || status === "asking" || status === "waiting"} onClick={enable}>{status === "asking" ? "Requesting access…" : "Enable phone tilt lighting"}</button>}
    </div>
  </section>;
}
