"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type Comment = {
  id: string;
  display_name: string;
  body: string;
  created_at: string;
};
type Conversation = {
  enabled: boolean;
  likes: number;
  comments: Comment[];
  signedIn: boolean;
  liked: boolean;
};

export function JournalConversation({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [conversation, setConversation] = useState<Conversation>({
    enabled: false,
    likes: 0,
    comments: [],
    signedIn: false,
    liked: false,
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const endpoint = `/api/journal/${slug}`;
  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.enabled !== undefined) setConversation(data);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [endpoint]);
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({ title, url: window.location.href });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setMessage("Link copied.");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setMessage("You can copy the page address to share this entry.");
    }
  }
  async function send(kind: "like" | "comment", body?: string) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (kind === "like")
        setConversation((previous) => ({
          ...previous,
          liked: data.liked,
          likes: data.likes,
        }));
      else setMessage("Thanks. Your comment is waiting for review.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function comment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = String(new FormData(form).get("body") || "");
    await send("comment", body);
  }
  return (
    <section className="conversation">
      <div className="actions">
        <button className="button secondary" onClick={share}>
          Share this entry ↗
        </button>
        {conversation.enabled &&
          (conversation.signedIn ? (
            <button
              className="button secondary"
              disabled={busy}
              aria-pressed={conversation.liked}
              onClick={() => send("like")}
            >
              {conversation.liked ? "Liked" : "Like"} · {conversation.likes}
            </button>
          ) : (
            <Link
              className="text-link"
              href={`/login?next=${encodeURIComponent(`/journal/${slug}`)}`}
            >
              Sign in to like or comment →
            </Link>
          ))}
      </div>
      {conversation.enabled && (
        <>
          <h2>Join the conversation.</h2>
          {conversation.comments.map((comment) => (
            <article className="comment" key={comment.id}>
              <strong>{comment.display_name}</strong>
              <p>{comment.body}</p>
            </article>
          ))}
          {conversation.signedIn && (
            <form className="form-stack" onSubmit={comment}>
              <label>
                Your comment
                <textarea name="body" required maxLength={2000} />
              </label>
              <button className="button" disabled={busy}>
                Leave a comment →
              </button>
              <p className="form-help">Comments appear after review.</p>
            </form>
          )}
        </>
      )}
      <p role="status" className="short-note">
        {message}
      </p>
    </section>
  );
}
