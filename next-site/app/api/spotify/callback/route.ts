import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireOwner, siteOrigin } from "@/lib/supabase";
import { openToken, matchingState } from "@/lib/token-crypto";
import { saveSpotifyToken } from "@/lib/spotify";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const cookie = jar.get("spotify-connect")?.value;
  jar.delete({ name: "spotify-connect", path: "/api/spotify" });
  try {
    const user = await requireOwner();
    if (
      !cookie ||
      !url.searchParams.get("code") ||
      url.searchParams.has("error")
    )
      throw new Error("Connection not completed.");
    const attempt = openToken<{
      verifier: string;
      state: string;
      userId: string;
    }>(cookie, process.env.INTEGRATION_ENCRYPTION_KEY || "");
    if (
      attempt.userId !== user.id ||
      !matchingState(attempt.state, url.searchParams.get("state") || "")
    )
      throw new Error("Invalid connection attempt.");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: url.searchParams.get("code")!,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        code_verifier: attempt.verifier,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok)
      throw new Error("Spotify did not complete authorization.");
    const token = await response.json();
    if (!token.refresh_token || !token.access_token)
      throw new Error("Incomplete Spotify authorization.");
    await saveSpotifyToken({
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + token.expires_in * 1000,
    });
    return NextResponse.redirect(
      new URL("/admin?spotify=connected", siteOrigin()),
    );
  } catch {
    return NextResponse.redirect(new URL("/admin?spotify=retry", siteOrigin()));
  }
}
