import { NextResponse } from "next/server";
import {
  serverSupabase,
  siteOrigin,
  checkOrigin,
  authConfigured,
} from "@/lib/supabase";
import { safeReturnPath } from "@/lib/validation";

export async function POST(request: Request) {
  if (!authConfigured())
    return NextResponse.json(
      { error: "Sign-in will be available after account setup." },
      { status: 503 },
    );
  try {
    checkOrigin(request);
    const data = await request.json();
    const next = safeReturnPath(data.next);
    const client = await serverSupabase();
    if (data.provider) {
      if (
        !["google", "facebook"].includes(data.provider) ||
        process.env[`${String(data.provider).toUpperCase()}_AUTH_ENABLED`] !==
          "true"
      )
        return NextResponse.json(
          { error: "That sign-in option is not enabled yet." },
          { status: 400 },
        );
      const { data: oauth, error } = await client.auth.signInWithOAuth({
        provider: data.provider,
        options: {
          redirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw new Error("Could not start sign-in. Please try again.");
      return NextResponse.json({ url: oauth.url });
    }
    if (process.env.EMAIL_OTP_ENABLED !== "true")
      return NextResponse.json(
        { error: "Email sign-in is not enabled yet." },
        { status: 503 },
      );
    const email = String(data.email ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
      throw new Error("Enter a valid email address.");
    const { error } = await client.auth.signInWithOtp({ email });
    if (error)
      throw new Error(
        "Could not send the code. Check the email setup or try again shortly.",
      );
    return NextResponse.json({ sent: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sign-in failed." },
      { status: 400 },
    );
  }
}
