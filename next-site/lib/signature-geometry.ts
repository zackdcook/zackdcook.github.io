import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { validateGuestbook, type SignatureFont } from "@/lib/guestbook";
import { typedGeometry, collisionMask, type FontGeometry, type Geometry } from "@/lib/tree-space";

const fonts = new Map<SignatureFont, Promise<FontGeometry>>();
export function readSignatureFont(font: SignatureFont) {
  if (!fonts.has(font)) fonts.set(font, readFile(join(process.cwd(), "public/fonts/geometry", font+".json"),"utf8").then(JSON.parse));
  return fonts.get(font)!;
}
export async function prepareCarving(input: Record<string,unknown>) {
  const entry = validateGuestbook(input);
  const geometry: Geometry = entry.mode === "drawn" ? { contours: [], lines: entry.strokes! } : typedGeometry(entry.display_name,entry.note,await readSignatureFont(entry.font));
  return { entry: { ...entry, geometry }, mask: collisionMask(geometry) };
}
