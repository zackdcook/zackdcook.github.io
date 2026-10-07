"use client";

import { useState, type FormEvent } from "react";

export function AuthPanel({
  next,
  google,
  facebook,
  emailEnabled = false,
}: {
  next: string;
  google: boolean;
  facebook: boolean;
  emailEnabled?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const values = new FormData(event.currentTarget);
    try {
      const response = await fetch(sent ? "/auth/verify" : "/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: values.get("token"), next }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (result.url) window.location.assign(result.url);
      else {
        setSent(true);
        setMessage("Check your email for the sign-in code.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function social(provider: "google" | "facebook") {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, next }),
      });
      const result = await response.json();
      if (!response.ok || !result.url)
        throw new Error(result.error || "Sign-in is unavailable.");
      window.location.assign(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
      setBusy(false);
    }
  }
  return (
    <div className="admin-panel">
      <h2>Sign in</h2>
      <p>
        Reading and sharing stay open. Sign in to use private site tools.
      </p>
      {(google || facebook) && (
        <div className="signin-options">
          {google && (
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => social("google")}
            >
              Continue with Google
            </button>
          )}
          {facebook && (
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => social("facebook")}
            >
              Continue with Facebook
            </button>
          )}
        </div>
      )}
      {emailEnabled && (
        <form className="form-stack login-email" onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSent(false);
              }}
              required
              disabled={busy}
            />
          </label>
          {sent && (
            <label>
              Sign-in code
              <input
                name="token"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6,8}"
                required
                minLength={6}
                maxLength={8}
              />
            </label>
          )}
          <button className="button" disabled={busy}>
            {busy ? "One moment…" : sent ? "Sign in" : "Email me a code"}
          </button>
        </form>
      )}
      {!google && !facebook && !emailEnabled && (
        <p className="status-message">
          Sign-in options are still being configured.
        </p>
      )}
      <p role="status" className="short-note">
        {message}
      </p>
    </div>
  );
}
