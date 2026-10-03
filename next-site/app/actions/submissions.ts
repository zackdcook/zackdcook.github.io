"use server";

import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { createHmac, randomBytes } from "node:crypto";
import { submissionsConfigured } from "@/lib/submission-config";
import { serviceSupabase } from "@/lib/supabase";
import { validateShoutout, type SubmissionState } from "@/lib/guestbook";
import { prepareCarving } from "@/lib/signature-geometry";
import { footprintAt, snap } from "@/lib/tree-space";
import { verifyTurnstile } from "@/lib/turnstile";
import { notifyOwner } from "@/lib/submission-notify";

async function submissionContext(form: FormData, kind: "guestbook" | "shoutout", challenge = true) {
  if (!submissionsConfigured()) throw new Error("Signing isn’t open yet. You can still try out your mark below.");
  const h = await headers();
  const origin = h.get("origin");
  const allowed = [process.env.SITE_URL, process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`, process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`].filter(Boolean).map(url => new URL(url!).origin);
  if (process.env.NODE_ENV !== "production") allowed.push("http://localhost:3000", "http://127.0.0.1:3000");
  if (!origin || !allowed.includes(origin)) throw new Error("Please submit from this website.");
  if (String(form.get("website") || "")) throw new Error("That submission could not be accepted.");
  if (challenge) await verifyTurnstile(String(form.get("cf-turnstile-response") || ""), new URL(origin).hostname, kind);
  const jar = await cookies();
  let visitor = jar.get("zack-visitor")?.value;
  if (!visitor || !/^[a-f0-9]{32}$/.test(visitor)) {
    visitor = randomBytes(16).toString("hex");
    jar.set("zack-visitor", visitor, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  // Vercel supplies/overwrites the forwarded client address. Never store it raw.
  const address = process.env.VERCEL ? (h.get("x-vercel-forwarded-for") || h.get("x-forwarded-for"))?.split(",")[0]?.trim() : "local-development";
  if (!address) throw new Error("Signing is temporarily unavailable. Please try again later.");
  const hash = (value: string) => createHmac("sha256", process.env.SUBMISSION_HMAC_KEY!).update(value).digest("hex");
  return { network: hash(`network:${new Date().toISOString().slice(0, 10)}:${address}`), visitor: hash(`visitor:${visitor}`), hash };
}

function errorState(error: unknown): SubmissionState {
  return { status: "error", message: error instanceof Error ? error.message : "That didn’t go through. Please try again." };
}

export async function reserveGuestbook(form: FormData): Promise<{status:"held"|"error";message:string;id?:string;expires_at?:string}> {
  try {
    const raw = String(form.get("strokes") || "null");
    if (raw.length > 24000) throw new Error("That drawing is too large. Try a smaller mark.");
    let strokes: unknown;
    try { strokes = JSON.parse(raw); } catch { throw new Error("That drawing could not be read."); }
    const {entry,mask} = await prepareCarving({ mode: form.get("mode"), display_name: form.get("display_name"), note: form.get("note"), font: form.get("font"), strokes });
    const x=Number(form.get("x")),y=Number(form.get("y"));
    if(!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||x!==snap(x)||y!==snap(y)||x<0||y<0) throw new Error("Choose a spot on the available bark.");
    const context = await submissionContext(form, "guestbook");
    const { data, error } = await serviceSupabase().rpc("cypress_reserve", {p_entry:entry,p_x:x,p_y:y,p_cells:footprintAt(mask,x,y),p_network_hash:context.network,p_visitor_hash:context.visitor,p_fingerprint:context.hash(JSON.stringify(entry))});
    if(error) {
      if(error.message.includes("occupied")||error.message.includes("active bark")) throw new Error("That patch changed while you were choosing. Your mark is safe—try another spot on the newest bark.");
      throw new Error("This browser may already have a carving, or today’s signing limit was reached. Your drawing is still here.");
    }
    return {status:"held",message:"This spot is held for you for 20 minutes. Confirm to send your carving for review.",...data};
  } catch(error) {return {status:"error",message:error instanceof Error?error.message:"That spot couldn’t be reserved. Your mark is still here."};}
}

export async function submitGuestbook(_previous: SubmissionState, form: FormData): Promise<SubmissionState> {
  try {
    const id=String(form.get("reservation")||"");
    if(!/^[a-f0-9-]{36}$/i.test(id)) throw new Error("Choose and reserve a spot first.");
    const context=await submissionContext(form,"guestbook",false);
    const {data,error}=await serviceSupabase().rpc("cypress_submit",{p_id:id,p_visitor_hash:context.visitor});
    if(error||typeof data!=="string") throw new Error("Your hold has expired. Go back to placement to reserve your spot again; your mark is still here.");
    after(()=>notifyOwner("guestbook",data));
    return {status:"pending",receipt:data,message:"Your spot on the tree is reserved while your carving waits for approval."};
  } catch(error) {return errorState(error);}
}
export async function releaseGuestbookHold(id:string){
  if(!/^[a-f0-9-]{36}$/i.test(id))return;
  const context=await submissionContext(new FormData(),"guestbook",false);
  await serviceSupabase().rpc("cypress_release_hold",{p_id:id,p_visitor_hash:context.visitor});
}
export async function myCarvingStatus() {
  const jar=await cookies(), visitor=jar.get("zack-visitor")?.value;
  if(!submissionsConfigured()||!visitor||!/^[a-f0-9]{32}$/.test(visitor)) return null;
  const hash=createHmac("sha256",process.env.SUBMISSION_HMAC_KEY!).update("visitor:"+visitor).digest("hex");
  const {data,error}=await serviceSupabase().rpc("cypress_my_carving",{p_visitor_hash:hash});
  if(error) return null;
  return data as {id:string;status:string;y:number;expires_at:string}|null;
}

export async function submitShoutout(_previous: SubmissionState, form: FormData): Promise<SubmissionState> {
  try {
    const entry = validateShoutout({ name: form.get("name"), summary: form.get("summary"), url: form.get("url") });
    const context = await submissionContext(form, "shoutout");
    const { data: id, error } = await serviceSupabase().rpc("submit_shoutout_suggestion", { p_entry: entry, p_network_hash: context.network, p_visitor_hash: context.visitor, p_fingerprint: context.hash(JSON.stringify(entry)) });
    if (error || typeof id !== "string") throw new Error("That recommendation may already be waiting, or today’s limit was reached. Please try another day.");
    after(() => notifyOwner("shoutout", id));
    return { status: "pending", receipt: id, message: "Thanks for the introduction! Zack will take a look before it’s shared." };
  } catch (error) { return errorState(error); }
}
