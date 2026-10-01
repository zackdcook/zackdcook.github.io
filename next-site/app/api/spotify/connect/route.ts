import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { requireOwner, siteOrigin, registerOwner } from "@/lib/supabase";
import { spotifyConfigured } from "@/lib/spotify";
import { sealToken } from "@/lib/token-crypto";

export async function GET() {
  let user;
  try {
    user = await requireOwner();
  } catch {
    return NextResponse.redirect(new URL("/login?next=/admin", siteOrigin()));
  }
  if (!spotifyConfigured())
    return NextResponse.json(
      {
        error:
          "The Spotify app details and private storage need to be configured first.",
      },
      { status: 503 },
    );
  await registerOwner(user.id);
  const verifier = randomBytes(48).toString("base64url");
  const state = randomBytes(32).toString("base64url");
  const url = new URL("https://accounts.spotify.com/authorize");
  url.search = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: "user-read-currently-playing",
    state,
    code_challenge_method: "S256",
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
  }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set(
    "spotify-connect",
    sealToken(
      { verifier, state, userId: user.id },
      process.env.INTEGRATION_ENCRYPTION_KEY!,
    ),
    {
      httpOnly: true,
      secure: siteOrigin().startsWith("https:"),
      sameSite: "lax",
      maxAge: 600,
      path: "/api/spotify",
    },
  );
  return response;
}
