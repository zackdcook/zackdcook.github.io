import { NextResponse } from "next/server";
import { spotifyAccessToken } from "@/lib/spotify";

export async function GET() {
  const headers = {
    "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
  };
  try {
    const token = await spotifyAccessToken();
    if (!token)
      return NextResponse.json({ status: "not-connected" }, { headers });
    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      },
    );
    if (response.status === 204)
      return NextResponse.json({ status: "quiet" }, { headers });
    if (!response.ok)
      return NextResponse.json({ status: "unavailable" }, { headers });
    const playing = await response.json();
    if (!playing.is_playing || !playing.item || playing.item.type !== "track")
      return NextResponse.json({ status: "quiet" }, { headers });
    return NextResponse.json(
      {
        status: "playing",
        title: playing.item.name,
        artist: playing.item.artists
          .map((artist: { name: string }) => artist.name)
          .join(", "),
        url: playing.item.external_urls.spotify,
        image: playing.item.album.images.at(-1)?.url || null,
      },
      { headers },
    );
  } catch {
    return NextResponse.json({ status: "unavailable" }, { headers });
  }
}
