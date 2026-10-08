"use client";

import { useEffect, useState } from "react";
import { orientationAPI, requestTiltPermission } from "@/lib/phone-tilt";

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

  useEffect(() => {
    const coarse = matchMedia("(pointer: coarse)");
    const detect = () => setSupported(coarse.matches && Boolean(orientationAPI()));
    detect();
    coarse.addEventListener("change", detect);
    return () => coarse.removeEventListener("change", detect);
  }, []);

  if (!supported) return null;

  async function toggle(next: boolean) {
    if (!next) {
      onChange(false);
      return;
    }
    if (reduced) return;

    try {
      onChange(await requestTiltPermission());
    } catch {
      onChange(false);
    }
  }

  return <label className="preference-row">
    <span>Phone tilt lighting</span>
    <span className="checkbox-control">
      <input
        type="checkbox"
        checked={enabled}
        disabled={reduced}
        onChange={event => void toggle(event.target.checked)}
      />
      <span className="preference-control checkbox-face" aria-hidden="true">✓</span>
    </span>
  </label>;
}
