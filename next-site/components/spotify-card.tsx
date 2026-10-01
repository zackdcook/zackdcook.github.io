"use client";

import { useEffect, useState } from "react";

type Playing =
  | {
      status: "playing";
      title: string;
      artist: string;
      url: string;
      image: string | null;
    }
  | { status: "quiet" | "unavailable" | "not-connected" | "loading" };

export function SpotifyCard() {
  const [playing, setPlaying] = useState<Playing>({ status: "loading" });
  const [playerOpen, setPlayerOpen] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = async () => {
      try {
        if (!document.hidden) {
          const response = await fetch("/api/spotify/now-playing", {
            signal: controller.signal,
          });
          if (response.ok) {
            const result: Playing = await response.json();
            if (controller.signal.aborted) return;
            setPlaying(result);
            // An unconfigured integration cannot change during this visit.
            // Avoid polling a server feature that has not been switched on.
            if (result.status === "not-connected") return;
          }
        }
      } catch {
        if (!controller.signal.aborted)
          setPlaying({ status: "unavailable" });
      }
      if (!controller.signal.aborted) timer = setTimeout(refresh, 60000);
    };
    void refresh();
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);
  const playlist = process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URL;
  const trackId =
    playing.status === "playing"
      ? playing.url.match(
          /^https:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]{22})(?:\?|$)/,
        )?.[1]
      : undefined;
  return (
    <aside
      className={`spotify-card ${trackId ? "has-player" : ""}`}
      aria-label="Currently vibing to…"
    >
      <div className="spotify-summary">
        <div className="spotify-symbol" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle cx="16" cy="16" r="15" fill="currentColor" />
            <path
              d="M8 12c6-2 12-1 17 1M9 17c5-2 10-1 14 1M10 21c4-1 8-1 11 1"
              fill="none"
              stroke="var(--paper)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <p className="eyebrow">
            Currently vibing to…{" "}
            <span
              className={`music-dot ${playing.status === "playing" ? "playing" : ""}`}
              aria-hidden="true"
            />
          </p>
          {playing.status === "playing" ? (
            <>
              <a
                className="track-title"
                href={playing.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {playing.title} <span aria-hidden="true">↗</span>
              </a>
              <p>{playing.artist} · Spotify</p>
            </>
          ) : (
            <>
              <strong>
                {playing.status === "quiet"
                  ? "Nothing playing right now."
                  : playing.status === "not-connected"
                    ? "Spotify isn’t connected yet."
                    : playing.status === "loading"
                      ? "Checking the soundtrack…"
                      : "Spotify is temporarily unavailable."}
              </strong>
              <p>
                {playlist ? (
                  <a href={playlist} target="_blank" rel="noopener noreferrer">
                    Listen to my writing playlist ↗
                  </a>
                ) : (
                  "Music keeps me company while I write."
                )}
              </p>
            </>
          )}
        </div>
        {playing.status === "playing" && playing.image && (
          <img
            className="album-cover"
            src={playing.image}
            width="64"
            height="64"
            alt={`Cover for ${playing.title}`}
            loading="lazy"
          />
        )}
      </div>
      {trackId && !playerOpen && (
        <button
          className="button secondary spotify-load-player"
          type="button"
          onClick={() => setPlayerOpen(true)}
        >
          Load Spotify player
        </button>
      )}
      {trackId && playerOpen && (
        <iframe
          className="spotify-player"
          title={`Listen to ${playing.status === "playing" ? playing.title : "this track"} on Spotify`}
          src={`https://open.spotify.com/embed/track/${trackId}`}
          width="100%"
          height="152"
          allow="encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </aside>
  );
}
