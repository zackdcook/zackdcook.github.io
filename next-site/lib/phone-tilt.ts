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
  const clamp = (value: number) => Math.max(-1, Math.min(1, value / 35));
  return { x: width * (.5 - .8 * clamp(horizontal)), y: height * (.5 - .8 * clamp(vertical)) };
}

type OrientationAPI = typeof DeviceOrientationEvent & { requestPermission?: (absolute?: boolean) => Promise<"granted" | "denied"> };
export function orientationAPI(): OrientationAPI | null {
  return typeof window !== "undefined" && window.isSecureContext && "DeviceOrientationEvent" in window ? window.DeviceOrientationEvent as OrientationAPI : null;
}

/** Call directly from a click, before awaiting anything else, for iOS activation. */
export function requestTiltPermission(): Promise<boolean> {
  const api = orientationAPI();
  if (!api) return Promise.resolve(false);
  return api.requestPermission ? api.requestPermission(false).then(value => value === "granted") : Promise.resolve(true);
}
