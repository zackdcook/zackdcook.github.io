import "server-only";

import { createHmac, randomBytes, randomInt } from "node:crypto";
import { cookies, headers } from "next/headers";
import { serviceSupabase } from "@/lib/supabase";
import { verifyTurnstile } from "@/lib/turnstile";
import { tierFromRoll, paletteForTier, BEBRAVE_EPIC_COLORS, epicChanceForPity } from "@/lib/bebrave-config";
import { BEBRAVE_RECARVE_GROWTH_HEIGHT, BEBRAVE_UNITS_PER_FOOT, type BeBraveNormalTool, type BeBraveRarity, type BeBraveSessionView, type BeBraveTreeState, type ToolReveal } from "@/lib/bebrave-types";

const visitorCookie = "zack-bebrave-visitor";
const uuid = /^[a-f0-9-]{36}$/i;


export function beBraveTestMode() {
  const ref = process.env.BEBRAVE_TEST_PROJECT_REF?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  return process.env.VERCEL_ENV === "preview"
    && process.env.BEBRAVE_TEST_MODE === "true"
    && Boolean(ref)
    && url.includes(ref!);
}

export function beBraveConfigured() {
  const database = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    process.env.BEBRAVE_HMAC_KEY
  );
  if (!database) return false;
  if (beBraveTestMode()) return true;
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);
}

export async function resetBeBraveTestVisitor() {
  if (!beBraveTestMode()) throw new Error("Test reset is unavailable.");
  const jar = await cookies();
  jar.set(visitorCookie, randomBytes(32).toString("hex"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
}

function hmacKey() {
  const key = process.env.BEBRAVE_HMAC_KEY;
  if (!key || key.length < 32) throw new Error("Be Brave server security is not configured.");
  return key;
}

function digest(prefix: string, value: string) {
  return createHmac("sha256", hmacKey()).update(`${prefix}:${value}`).digest("hex");
}

export function cacheCodeDigest(code: string) {
  const normalized = code.normalize("NFKC").trim().replace(/\s+/g, "").toUpperCase();
  if (normalized.length < 4 || normalized.length > 64) throw new Error("Nothing happened.");
  const key = process.env.BEBRAVE_CACHE_HMAC_KEY || hmacKey();
  if (key.length < 32) throw new Error("Nothing happened.");
  return createHmac("sha256", key).update(`bebrave-cache:${normalized}`).digest("hex");
}

export async function requestContext(request: Request, createVisitor = true) {
  const h = await headers();
  const origin = h.get("origin");
  const allowed = [
    process.env.SITE_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
  ]
    .filter(Boolean)
    .map((url) => new URL(url!).origin);
  if (process.env.NODE_ENV !== "production") allowed.push("http://localhost:3000", "http://127.0.0.1:3000");
  if (request.method !== "GET" && (!origin || !allowed.includes(origin))) throw new Error("Please continue from this website.");

  const jar = await cookies();
  let visitor = jar.get(visitorCookie)?.value || null;
  if ((!visitor || !/^[a-f0-9]{64}$/.test(visitor)) && createVisitor) {
    visitor = randomBytes(32).toString("hex");
    jar.set(visitorCookie, visitor, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  }
  if (!visitor || !/^[a-f0-9]{64}$/.test(visitor)) return null;

  const address = process.env.VERCEL
    ? (h.get("x-vercel-forwarded-for") || h.get("x-forwarded-for"))?.split(",")[0]?.trim()
    : "local-development";
  const ua = (h.get("user-agent") || "unknown").slice(0, 240);
  const day = new Date().toISOString().slice(0, 10);
  return {
    visitorHash: digest("visitor", visitor),
    networkHash: digest(`network:${day}`, address || "unknown"),
    browserHint: digest("browser", ua),
  };
}

export async function verifyBeBraveTurnstile(request: Request, token: string) {
  const context = await requestContext(request, true);
  if (!context) throw new Error("This browser could not start a carving session.");
  if (beBraveTestMode()) return context;
  const limited = await serviceSupabase().rpc("bebrave_turnstile_limit", { p_visitor_hash: context.visitorHash, p_network_hash: context.networkHash });
  if (limited.error) throw new Error("Too many carving attempts. Please give the tree a little time.");
  const host = new URL(request.headers.get("origin") || request.url).hostname;
  await verifyTurnstile(token, host, "bebrave");
  return context;
}

export function secureRoll() {
  return randomInt(0, 10_000);
}

export function securePityRoll(pity: number) {
  const epicPercent = epicChanceForPity(pity);
  if (randomInt(0, 10_000) < epicPercent * 100) return randomInt(9_500, 10_000);
  return randomInt(0, 9_500);
}

export function secureSeed() {
  return randomInt(0, 2_147_483_647);
}

export function secureColor(rarity: BeBraveRarity) {
  const pool = paletteForTier(rarity);
  return pool[randomInt(0, pool.length)].value;
}

export function validEpicColor(value: string) {
  return BEBRAVE_EPIC_COLORS.some((color) => color.value === value);
}

export function revealTools(row: { roll_arrowhead: number; roll_nail: number; roll_key: number }): ToolReveal {
  return {
    arrowhead: tierFromRoll(row.roll_arrowhead),
    nail: tierFromRoll(row.roll_nail),
    key: tierFromRoll(row.roll_key),
  };
}

export function toolTier(row: { roll_arrowhead: number; roll_nail: number; roll_key: number }, tool: BeBraveNormalTool) {
  return tierFromRoll(tool === "arrowhead" ? row.roll_arrowhead : tool === "nail" ? row.roll_nail : row.roll_key);
}

export function assertSessionId(value: unknown) {
  const id = String(value || "");
  if (!uuid.test(id)) throw new Error("That carving session could not be found.");
  return id;
}

export async function visitorRow(visitorHash: string) {
  const { data, error } = await serviceSupabase()
    .from("bebrave_visitors")
    .select("id,visitor_hash,last_carved_at,epic_pity")
    .eq("visitor_hash", visitorHash)
    .maybeSingle();
  if (error) throw new Error("The tree could not check your carving status.");
  return data;
}

export async function growthFeetRemaining(visitorId: string | null | undefined, treeHeight: number) {
  if (!visitorId) return 0;
  const { data, error } = await serviceSupabase()
    .from("bebrave_sessions")
    .select("zone_bottom")
    .eq("visitor_id", visitorId)
    .eq("status", "completed")
    .not("zone_bottom", "is", null)
    .order("public_sequence", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error("The tree could not check your growth progress.");
  if (!data?.zone_bottom) return 0;

  const remaining = Math.max(
    0,
    Number(data.zone_bottom) + BEBRAVE_RECARVE_GROWTH_HEIGHT - treeHeight,
  );
  return Math.ceil(remaining / BEBRAVE_UNITS_PER_FOOT);
}

export function treeStateFromRow(row: Record<string, unknown>): BeBraveTreeState {
  return {
    height:Number(row.height),
    activeTop:Number(row.active_top),
    activeBottom:Number(row.active_bottom),
    revision:Number(row.revision),
    completedCount:Number(row.completed_count),
    latestSequence:Number(row.completed_count),
  };
}

export async function ownedSession(sessionId: string, visitorHash: string) {
  const visitor = await visitorRow(visitorHash);
  if (!visitor) return null;
  const { data, error } = await serviceSupabase()
    .from("bebrave_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("visitor_id", visitor.id)
    .maybeSingle();
  if (error) throw new Error("That carving session could not be loaded.");
  return data;
}

export function sessionView(row: Record<string, any> | null): BeBraveSessionView | null {
  if (!row) return null;
  const revealed = row.chosen_tool && row.chosen_tool !== "cache" ? revealTools(row as any) : null;
  return {
    id: String(row.id),
    status: row.status,
    chosenTool: row.chosen_tool,
    chosenRarity: row.chosen_rarity,
    chosenColor: row.chosen_color,
    effectSeed: row.effect_seed == null ? null : Number(row.effect_seed),
    toolResults: revealed,
    drawingStartedAt: row.drawing_started_at,
    drawingDeadline: row.drawing_deadline,
    drawingFinishedAt: row.drawing_finished_at,
    zoneTop: row.zone_top == null ? null : Number(row.zone_top),
    zoneBottom: row.zone_bottom == null ? null : Number(row.zone_bottom),
    treeRevision: row.tree_revision == null ? null : Number(row.tree_revision),
    publicSequence: row.public_sequence == null ? null : Number(row.public_sequence),
  };
}

export async function currentOpenSession(visitorHash: string) {
  const visitor = await visitorRow(visitorHash);
  if (!visitor) return null;
  const { data, error } = await serviceSupabase()
    .from("bebrave_sessions")
    .select("*")
    .eq("visitor_id", visitor.id)
    .in("status", ["tool_select", "epic_color", "ready", "drawing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("The tree could not reopen your carving session.");
  return data;
}

export async function sessionDraftStrokes(sessionId: string) {
  const { data, error } = await serviceSupabase().from("bebrave_stroke_chunks").select("stroke_id,stroke_order,chunk_index,points").eq("session_id", sessionId).order("stroke_order").order("chunk_index");
  if (error) throw new Error("Your saved carving strokes could not be reopened.");
  const grouped = new Map<string, { strokeId: string; strokeOrder: number; points: Array<[number, number]> }>();
  for (const row of data || []) {
    let stroke = grouped.get(row.stroke_id);
    if (!stroke) { stroke = { strokeId: row.stroke_id, strokeOrder: Number(row.stroke_order), points: [] }; grouped.set(row.stroke_id, stroke); }
    for (const point of row.points as Array<[number, number]>) {
      const last = stroke.points.at(-1);
      if (!last || last[0] !== point[0] || last[1] !== point[1]) stroke.points.push(point);
    }
  }
  return [...grouped.values()].sort((a,b)=>a.strokeOrder-b.strokeOrder);
}
