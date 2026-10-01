import { NextResponse } from "next/server";
import { serverSupabase, checkOrigin } from "@/lib/supabase";
import { safeReturnPath } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { email, token, next } = await request.json();
    if (
      typeof email !== "string" ||
      typeof token !== "string" ||
      !/^\d{6,8}$/.test(token)
    )
      throw new Error("Enter the code from your email.");
    const client = await serverSupabase();
    const { error } = await client.auth.verifyOtp({
      email: email.trim(),
      token,
      type: "email",
    });
    if (error)
      throw new Error(
        "That code did not work. Request a new one and try again.",
      );
    return NextResponse.json({ url: safeReturnPath(next) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sign-in failed." },
      { status: 400 },
    );
  }
}
