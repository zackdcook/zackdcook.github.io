export type TiltReading = { beta: number; gamma: number };
export const tiltStatusEvent = "zack:tilt-status";
export const recenterTiltEvent = "zack:recenter-tilt";

const angleDifference = (value: number, reference: number) => ((value - reference + 540) % 360) - 180;

/** Relative to the comfortable pose; the raised side faces the light.
 * Compensate for screen rotation before mapping left/right. */
export function tiltLight(reading: TiltReading, reference: TiltReading, screenAngle: number, width: number, height: number) {
  if (![reading.beta, reading.gamma, reference.beta, reference.gamma, screenAngle, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
  const roll = angleDifference(reading.gamma, reference.gamma);
  const pitch = angleDifference(reading.beta, reference.beta);
  const angle = screenAngle * Math.PI / 180;
  const horizontal = roll * Math.cos(angle) + pitch * Math.sin(angle);
  const vertical = pitch * Math.cos(angle) - roll * Math.sin(angle);
  // Continuous falloff avoids the abrupt stop of a clamped spotlight. Small
  // natural gestures travel; extreme angles settle into a bounded grazing light.
  const curve = (value: number) => Math.tanh(value / 18);
  return { x: width * (.5 - .68 * curve(horizontal)), y: height * (.5 - .68 * curve(vertical)) };
}

type OrientationAPI = typeof DeviceOrientationEvent & { requestPermission?: (absolute?: boolean) => Promise<"granted" | "denied"> };
export function orientationAPI(): OrientationAPI | null {
  return typeof window !== "undefined" && window.isSecureContext && "DeviceOrientationEvent" in window ? window.DeviceOrientationEvent as OrientationAPI : null;
}

export const tiltPermissionKey = "zack.tilt-permission.v1";

/** Preference intent is separate from the browser's permission. One pending
 * request per browser constructor avoids competing prompts on the same tap. */
export function createTiltPermissionGate(request: () => Promise<boolean>, remember: (allowed: boolean) => void) {
  let pending: Promise<boolean> | null = null;
  return () => {
    if (pending) return pending;
    // Invoke synchronously, while the click still has transient activation.
    const asked = request();
    pending = asked.then(allowed => { remember(allowed); return allowed; }).finally(() => { pending = null; });
    return pending;
  };
}
const permissionGates = new WeakMap<OrientationAPI, () => Promise<boolean>>();
export function tiltPermissionDenied() {
  try { return localStorage.getItem(tiltPermissionKey) === "denied"; } catch { return false; }
}

/** Call directly from a trusted click, before awaiting anything else, for iOS. */
export function requestTiltPermission(): Promise<boolean> {
  const api = orientationAPI();
  if (!api) return Promise.resolve(false);
  if (!api.requestPermission) return Promise.resolve(true);
  let ask = permissionGates.get(api);
  if (!ask) {
    ask = createTiltPermissionGate(() => api.requestPermission!(false).then(value => value === "granted"), allowed => {
      try { localStorage.setItem(tiltPermissionKey, allowed ? "granted" : "denied"); } catch {}
    });
    permissionGates.set(api, ask);
  }
  return ask();
}

/** Mobile default enrollment needs a real tap on Safari. Saved opt-outs and
 * denial are respected; explicit Settings activation can retry permission. */
export function enrollTiltOnTap(target: EventTarget, enabled: () => boolean, ask = requestTiltPermission, denied = tiltPermissionDenied) {
  let attempted = false;
  const activate = (event: Event) => {
    if (!event.isTrusted || attempted || !enabled() || denied()) return;
    attempted = true;
    void ask().catch(() => {});
  };
  target.addEventListener("click", activate, { passive: true });
  return () => target.removeEventListener("click", activate);
}
