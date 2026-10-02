import "server-only";
import { serviceSupabase } from "@/lib/supabase";
import { site } from "@/content/site";

export async function notifyOwner(kind: "guestbook" | "shoutout", id: string) {
  const client = serviceSupabase();
  const { data: reserved, error } = await client.rpc("reserve_submission_notice", {p_id:id});
  if (error || reserved !== true) return;
  const base = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : process.env.SITE_URL || site.url;
  let sent = false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `zack-${kind}-${id}` },
      body: JSON.stringify({ from: process.env.SUBMISSION_EMAIL_FROM, to: [process.env.ZACK_ADMIN_EMAIL], subject: `A new ${kind === "guestbook" ? "guestbook carving" : "shoutout"} is waiting`, text: `There’s a new ${kind} submission waiting at your writing desk.\n\n${new URL("/admin/submissions", base).href}\n\nSign in to approve or reject it. Nothing is public until you approve it.` }),
      signal: AbortSignal.timeout(7000), cache: "no-store",
    });
    sent = response.ok;
  } catch { /* The saved queue entry remains visible at the private desk. */ }
  await client.rpc("mark_submission_notice", { p_id: id, p_state: sent ? "sent" : "failed" });
}
