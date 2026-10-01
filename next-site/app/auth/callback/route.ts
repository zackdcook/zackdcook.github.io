import { NextResponse } from "next/server";
import { serverSupabase, siteOrigin } from "@/lib/supabase";
import { safeReturnPath } from "@/lib/validation";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeReturnPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  if (code) {
    const client = await serverSupabase();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, siteOrigin()));
  }
  return NextResponse.redirect(new URL("/login?error=signin", siteOrigin()));
}
