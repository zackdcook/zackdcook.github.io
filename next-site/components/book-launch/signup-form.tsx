"use client";
import { useEffect, useId, useRef, useState } from "react";
import { HumanCheck } from "@/components/human-check";
import { usePreferences } from "@/components/site-preferences";
import { bookCopy, bookVisibility, type Placement } from "@/lib/book-launch/shared";
import { bookEvent, attribution, privacySignal } from "@/lib/book-launch/analytics";
import { restoreBookFocus, useBookLaunch } from "./context";
import { createSignupAttemptGate, type SignupAttempt } from "@/lib/book-launch/signup-attempt";

export function BookSignupForm({ placement, titleId, onSuccess }: { placement: Placement; titleId: string; onSuccess: () => void }) {
  const { subscribeBook, analyticsOptOut } = usePreferences();
  const { testMode } = useBookLaunch();
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (placement === "menu") heading.current?.focus({ preventScroll: true });
  }, [placement]);
  const started = useRef(false), busy = useRef(false);
  const [pending, setPending] = useState(false), [error, setError] = useState(false);
  const [gate] = useState(createSignupAttemptGate);
  const [verification, setVerification] = useState<SignupAttempt | null>(null);
  useEffect(() => () => gate.cancel(), [gate]);

  // Consume only the current explicit intent. Old/expired/duplicate callbacks
  // cannot submit an edited address or start a second request.
  async function verified(id: number, token: string) {
    if (busy.current) return;
    const attempt = gate.take(id, token);
    if (!attempt) return;
    busy.current = true; setPending(true); setError(false);
    try {
      const response = await fetch("/api/book-launch", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: attempt.email, website: attempt.website,
          token: attempt.token, placement,
          ...attribution(), analytics_opt_out: analyticsOptOut || privacySignal(),
        }), signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) {
        bookEvent("book_signup_failed", { placement, error_category: result.category || "unavailable" });
        setError(true); return;
      }
      // No local email, no optimistic success, and no browser completion event.
      // The server records acceptance separately from newly inserted records.
      form.current?.reset(); onSuccess(); subscribeBook();
    } catch {
      setError(true);
      bookEvent("book_signup_failed", { placement, error_category: "network" });
    } finally { busy.current = false; setPending(false); setVerification(null); }
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    setError(false);
    try {
      const data = new FormData(event.currentTarget);
      const attempt = gate.begin(data.get("email"), data.get("website"));
      bookEvent("book_signup_attempted", { placement });
      if (testMode) void verified(attempt.id, "test-mode");
      else setVerification(attempt);
    } catch { setVerification(null); setError(true); }
  }
  return <>
    <h2 ref={heading} className={placement === "menu" ? "dialog-title" : undefined} tabIndex={placement === "menu" ? -1 : undefined} id={titleId}>{bookCopy.headline}</h2><p>{bookCopy.supporting}</p>
    <form ref={form} onSubmit={submit} className="book-signup-form" aria-busy={pending}>
      <div className="book-signup-fields">
        <label className="sr-only" htmlFor={`${id}-email`}>Email address</label>
        <input id={`${id}-email`} type="email" name="email" placeholder={bookCopy.placeholder} autoComplete="email" inputMode="email" maxLength={254} required disabled={pending}
          onChange={event => { gate.cancel(); setVerification(null); setError(false); if (!started.current && event.target.value.length) { started.current = true; bookEvent("book_signup_started", { placement }); } }} aria-describedby={error ? `${id}-error` : undefined} />
        <button className="button" type="submit" disabled={pending}>{bookCopy.submit}</button>
      </div>
      <div className="book-honeypot" aria-hidden="true"><label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" /></div>
      {verification && <HumanCheck key={verification.id} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} action="book_launch" resetKey={String(verification.id)} onToken={token => { void verified(verification.id, token); }} />}
      {error && <p id={`${id}-error`} role="alert">{bookCopy.error}</p>}
    </form>
  </>;
}
export function HomepageBookCTA() {
  const { bookDismissed, bookSubscribed, dismissBook } = usePreferences();
  const { enabled } = useBookLaunch();
  const [success, setSuccess] = useState(false);
  const host = useRef<HTMLElement>(null);
  const receipt = useRef<HTMLDivElement>(null);
  useEffect(() => { if (success) receipt.current?.focus({ preventScroll: true }); }, [success]);
  const visible = enabled && bookVisibility(bookDismissed, bookSubscribed).homepage;
  useEffect(() => {
    if (!visible || !host.current) return;
    let timer: ReturnType<typeof setTimeout> | undefined, qualified = false, emitted = false;
    function cancel() { if (timer) clearTimeout(timer); timer = undefined; }
    function schedule() {
      cancel();
      if (qualified && !document.hidden && !emitted) timer = setTimeout(() => {
        emitted = bookEvent("book_cta_viewed", { placement: "homepage" });
      }, 1000);
    }
    const observer = new IntersectionObserver(entries => {
      qualified = entries[0].intersectionRatio >= .5; schedule();
    }, { threshold: [.5] });
    observer.observe(host.current);
    document.addEventListener("visibilitychange", schedule);
    window.addEventListener("book-analytics-ready", schedule);
    return () => { cancel(); observer.disconnect(); document.removeEventListener("visibilitychange", schedule); window.removeEventListener("book-analytics-ready", schedule); };
  }, [visible]);
  // The success receipt is a status message, never a signup promotion. On a
  // subsequent homepage navigation this component resets; all entry points hide.
  if (success) return <div className="book-success" role="status" tabIndex={-1} ref={receipt}>{bookCopy.success}</div>;
  if (!visible) return null;
  return <section ref={host} className="book-callout" aria-labelledby="book-home-title">
    <div className="book-panel">
      <button type="button" className="icon-button book-dismiss" aria-label="Dismiss book invitation" onClick={() => {
        bookEvent("book_cta_dismissed", { placement: "homepage" }); dismissBook();
        restoreBookFocus();
      }}>×</button>
      <BookSignupForm placement="homepage" titleId="book-home-title" onSuccess={() => setSuccess(true)} />
    </div>
  </section>;
}
