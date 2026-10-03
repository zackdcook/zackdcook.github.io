// This is a browser-local story, never a database mutation or an authorization.
export const timelineKey = "zack.timeline.v1";
export const carvingBookmarkKey = "zack.guestbook.carving.v2";
export type LocalTimeline = {
  kind: "living" | "felled";
  hacked: boolean;
  roll: number | null;
  remaining: number;
  felledAtGuestNumber: number | null;
  felledAt: string | null;
  carvingId: string | null;
};
export const livingTimeline: LocalTimeline = { kind: "living", hacked: false, roll: null, remaining: 0, felledAtGuestNumber: null, felledAt: null, carvingId: null };
export function normalizeTimeline(value: unknown): LocalTimeline {
  const v = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const cutoff = typeof v.felledAtGuestNumber === "number" && Number.isSafeInteger(v.felledAtGuestNumber) && v.felledAtGuestNumber >= 0 && v.felledAtGuestNumber <= 1_000_000_000 ? v.felledAtGuestNumber : null;
  const roll = typeof v.roll === "number" && Number.isInteger(v.roll) && v.roll >= 1 && v.roll <= 4 ? v.roll : null;
  const remaining = roll !== null && typeof v.remaining === "number" && Number.isInteger(v.remaining) && v.remaining >= 0 && v.remaining <= roll ? v.remaining : 0;
  return {
    kind: v.kind === "felled" && cutoff !== null ? "felled" : "living",
    hacked: v.hacked === true,
    roll, remaining,
    felledAtGuestNumber: v.kind === "felled" ? cutoff : null,
    felledAt: typeof v.felledAt === "string" && Number.isFinite(Date.parse(v.felledAt)) ? v.felledAt : null,
    carvingId: typeof v.carvingId === "string" && /^[a-f0-9-]{36}$/i.test(v.carvingId) ? v.carvingId : null,
  };
}
export function beginAdditionalStrikes(timeline: LocalTimeline, roll: number): LocalTimeline {
  if (timeline.kind === "felled" || (timeline.roll !== null && timeline.remaining > 0)) return timeline;
  if (!Number.isInteger(roll) || roll < 1 || roll > 4) throw Error("Invalid strike count.");
  return { ...timeline, hacked: true, roll, remaining: roll };
}
export function additionalStrike(timeline: LocalTimeline, guestNumber: number, now: string): LocalTimeline {
  if (timeline.kind === "felled" || timeline.roll === null || timeline.remaining < 1) return timeline;
  const remaining = timeline.remaining - 1;
  if (remaining > 0) return { ...timeline, remaining };
  if (!Number.isSafeInteger(guestNumber) || guestNumber < 0 || guestNumber > 1_000_000_000 || !Number.isFinite(Date.parse(now))) throw Error("The tree snapshot could not be captured.");
  return { ...timeline, kind: "felled", remaining: 0, felledAtGuestNumber: guestNumber, felledAt: now };
}
