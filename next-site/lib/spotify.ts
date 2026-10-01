import "server-only";
import { serviceSupabase } from "@/lib/supabase";
import { sealToken, openToken } from "@/lib/token-crypto";

type Token = { accessToken: string; refreshToken: string; expiresAt: number };

export function spotifyConfigured() {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID &&
    process.env.SPOTIFY_REDIRECT_URI &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.INTEGRATION_ENCRYPTION_KEY,
  );
}

export async function saveSpotifyToken(token: Token) {
  const sealed = sealToken(token, process.env.INTEGRATION_ENCRYPTION_KEY || "");
  const { error } = await serviceSupabase()
    .from("integration_tokens")
    .upsert({ id: "spotify", sealed, updated_at: new Date().toISOString() });
  if (error) throw new Error("Could not save the Spotify connection.");
}

export async function spotifyAccessToken() {
  if (!spotifyConfigured()) return null;
  const { data, error } = await serviceSupabase()
    .from("integration_tokens")
    .select("sealed")
    .eq("id", "spotify")
    .maybeSingle();
  if (error || !data) return null;
  const token = openToken<Token>(
    data.sealed,
    process.env.INTEGRATION_ENCRYPTION_KEY!,
  );
  if (token.expiresAt > Date.now() + 60000) return token.accessToken;
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID!,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Spotify needs to be reconnected.");
  const refreshed = await response.json();
  await saveSpotifyToken({
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token || token.refreshToken,
    expiresAt: Date.now() + refreshed.expires_in * 1000,
  });
  return refreshed.access_token as string;
}
