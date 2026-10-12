"use client";

import { useEffect, useState } from "react";
import { orientationAPI, requestTiltPermission, tiltStatusEvent } from "@/lib/phone-tilt";

export function TiltLightingControl({
  enabled,
  reduced,
  onChange,
}: {
  enabled: boolean;
  reduced: boolean;
  onChange: (enabled: boolean) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [permissionRequired, setPermissionRequired] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const coarse = matchMedia("(pointer: coarse)");
    const detect = () => {
      const api = orientationAPI();
      setSupported(coarse.matches && Boolean(api));
      setPermissionRequired(Boolean(api?.requestPermission));
    };
    const status = () => setActive(document.documentElement.dataset.tiltStatus === "active");
    detect();
    status();
    coarse.addEventListener("change", detect);
    window.addEventListener(tiltStatusEvent, status);
    return () => { coarse.removeEventListener("change", detect); window.removeEventListener(tiltStatusEvent, status); };
  }, []);

  if (!supported) return null;

  async function toggle(next: boolean) {
    if (!next) {
      onChange(false);
      return;
    }
    if (reduced) return;

    try {
      onChange(true); await requestTiltPermission();
    } catch {
      // Browser permission failure must not overwrite the saved preference.
    }
  }

  return <div>
  <label className="preference-row">
    <span>Phone tilt lighting</span>
    <span className="checkbox-control">
      <input aria-label="Phone tilt lighting"
        type="checkbox"
        checked={enabled}
        disabled={reduced}
        onChange={event => void toggle(event.target.checked)}
      />
      <span className="preference-control checkbox-face" aria-hidden="true">✓</span>
    </span>
  </label>
    {enabled && permissionRequired && !active && !reduced && <button type="button" className="button button-small" onClick={() => { void requestTiltPermission().catch(() => {}); }}>Allow phone tilt lighting</button>}
  </div>;
}
