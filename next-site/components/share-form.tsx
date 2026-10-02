"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { sourceName } from "@/lib/validation";

export function ShareForm({ initialUrl }: { initialUrl: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/commonplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSaved(true);
      setMessage("Added to your Commonplace Book.");
      form.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form className="form-stack" onSubmit={submit}>
        <label>
          Original post or page
          <input
            name="url"
            type="url"
            defaultValue={initialUrl}
            placeholder="https://…"
            required
            maxLength={2048}
          />
        </label>
        <label>
          A title
          <input
            name="title"
            placeholder="What caught your attention?"
            required
            maxLength={160}
            defaultValue={
              initialUrl ? `A find from ${sourceName(initialUrl)}` : ""
            }
          />
        </label>
        <label>
          A note{" "}
          <span className="form-help">Optional. A sentence is plenty.</span>
          <textarea name="note" maxLength={2000} />
        </label>
        <label>
          Creator{" "}
          <span className="form-help">
            Optional credit, shown beside the original link.
          </span>
          <input name="creator" maxLength={120} />
        </label>
        <label>
          File under
          <select name="category" defaultValue="inspiration">
            <option value="inspiration">Inspiration</option>
            <option value="reading">Reading</option>
            <option value="music">Music</option>
            <option value="life">Life</option>
          </select>
        </label>
        <button className="button" disabled={busy}>
          {busy ? "Adding…" : "Add to Commonplace"}
        </button>
      </form>
      <p
        role="status"
        className={`status-message ${message && !saved ? "error" : ""}`}
        hidden={!message}
      >
        {message}
      </p>
      {saved && (
        <Link className="text-link" href="/commonplace">
          See it on the page
        </Link>
      )}
      <p className="share-tip">
        This saves a link back to the original. It works even when Instagram
        doesn’t allow a photo preview.
      </p>
    </>
  );
}
