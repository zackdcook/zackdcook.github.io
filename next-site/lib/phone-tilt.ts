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
  const curve = (value: number) => Math.tanh(value / 28);
  return { x: width * (.5 - .68 * curve(horizontal)), y: height * (.5 - .68 * curve(vertical)) };
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
