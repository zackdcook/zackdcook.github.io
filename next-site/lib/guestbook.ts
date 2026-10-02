import { normalizeSharedUrl } from "@/lib/validation";

export const signatureWidth = 600;
export const signatureHeight = 210;
export const allowedSignatureFonts = ["caveat", "handlee", "allura", "kalam", "patrickhand"] as const;
export const signatureFonts = { caveat: "Caveat", handlee: "Handlee", allura: "Allura", kalam: "Kalam", patrickhand: "Patrick Hand" };
export type SignatureFont = typeof allowedSignatureFonts[number];
export type Point = [number, number];
export type Stroke = Point[];
export type GuestEntry = {
  id: string; public_sequence: number; approved_at: string; created_at: string;
  mode: "typed" | "drawn"; display_name: string; note: string;
  font: SignatureFont; strokes: Stroke[] | null;
  x: number; y: number; width: number; height: number;
  geometry: { contours: Point[][]; lines: Stroke[] };
};
export type SubmissionState = { status: "idle" | "pending" | "error"; message: string; receipt?: string };
export const initialSubmissionState: SubmissionState = { status: "idle", message: "" };

function shortText(value: unknown, limit: number, label: string, required = false) {
  if (typeof value !== "string") throw new Error(`Add ${label}.`);
  const clean = value.normalize("NFC").trim();
  if (/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(clean)) throw new Error(`Keep ${label} on one line.`);
  if ((required && !clean) || [...clean].length > limit) throw new Error(`Use ${required ? "1–" : "up to "}${limit} characters for ${label}.`);
  return clean.replace(/ +/g," ");
}

export function validateStrokes(value: unknown): Stroke[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 64) throw new Error("Draw a small signature or choose Type instead.");
  let count = 0;
  const strokes = value.map(stroke => {
    if (!Array.isArray(stroke) || stroke.length < 2) throw new Error("That drawing is incomplete.");
    return stroke.map(point => {
      if (++count > 1200) throw new Error("That drawing is too detailed. Try a smaller mark.");
      if (!Array.isArray(point) || point.length !== 2 || point.some(n => typeof n !== "number" || !Number.isFinite(n))) throw new Error("Only drawing points can be saved.");
      const [x, y] = point;
      if (x < 0 || x > signatureWidth || y < 0 || y > signatureHeight) throw new Error("Keep your drawing inside the box.");
      return [Math.round(x * 10) / 10, Math.round(y * 10) / 10] as Point;
    });
  });
  if (JSON.stringify(strokes).length > 24000) throw new Error("That drawing is too large.");
  return strokes;
}

export function validateGuestbook(data: Record<string, unknown>) {
  if (data.mode !== "typed" && data.mode !== "drawn") throw new Error("Choose Type or Draw.");
  const mode = data.mode;
  const display_name = shortText(data.display_name, 40, "your name", true);
  const note = shortText(data.note, 60, "your note");
  const font = String(data.font);
  if (!(allowedSignatureFonts as readonly string[]).includes(font)) throw new Error("Choose one of the handwriting styles.");
  return { mode, display_name, note, font: font as SignatureFont, strokes: mode === "drawn" ? validateStrokes(data.strokes) : null };
}

export function validateShoutout(data: Record<string, unknown>) {
  const name = shortText(data.name, 80, "their name", true);
  const summary = shortText(data.summary, 240, "a short recommendation", true);
  const url = normalizeSharedUrl(String(data.url ?? ""));
  const host = new URL(url).hostname;
  if (host.includes(":") || host.endsWith(".localhost") || host.endsWith(".internal") || /^\d+$/.test(host)) throw new Error("Use their public website or profile.");
  return { name, summary, url };
}

export function signatureNameLines(name: string): string[] {
  const chars = [...name];
  if (chars.length <= 21) return [name];
  const first = chars.slice(0, 22).join("");
  const space = first.lastIndexOf(" ");
  const cut = space >= 10 ? space : 21;
  return [chars.slice(0, cut).join(""), chars.slice(cut).join("").trim()];
}

export function strokePath(stroke: Stroke) {
  return stroke.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}
