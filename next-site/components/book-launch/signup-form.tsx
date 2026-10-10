"use client";
import { useEffect, useId, useRef, useState } from "react";
import { HumanCheck } from "@/components/human-check";
import { usePreferences } from "@/components/site-preferences";
import { bookCopy, bookVisibility, type Placement } from "@/lib/book-launch/shared";
import { bookEvent, attribution, privacySignal } from "@/lib/book-launch/analytics";
import { restoreBookFocus, useBookLaunch } from "./context";

export function BookSignupForm({ placement, titleId, onSuccess }: { placement: Placement; titleId: string; onSuccess: () => void }) {
  const { subscribeBook, analyticsOptOut } = usePreferences();
  const { testMode } = useBookLaunch();
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const started = useRef(false), busy = useRef(false);
  const [pending, setPending] = useState(false), [error, setError] = useState(false);
  const [reset, setReset] = useState(0);
  const [humanToken, setHumanToken] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true; setPending(true); setError(false);
    bookEvent("book_signup_attempted", { placement });
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/book-launch", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), website: data.get("website"),
          token: data.get("cf-turnstile-response"), placement,
          ...attribution(), analytics_opt_out: analyticsOptOut || privacySignal(),
        }), signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || result.accepted !== true) {
        bookEvent("book_signup_failed", { placement, error_category: result.category || "unavailable" });
        setError(true); setReset(v => v + 1); return;
      }
      // No local email, no optimistic success, and no browser completion event.
      // The server records acceptance separately from newly inserted records.
      form.current?.reset(); onSuccess(); subscribeBook();
    } catch {
      setError(true); setReset(v => v + 1);
      bookEvent("book_signup_failed", { placement, error_category: "network" });
    } finally { busy.current = false; setPending(false); }
  }
  return <>
    <h2 id={titleId}>{bookCopy.headline}</h2><p>{bookCopy.supporting}</p>
    <form ref={form} onSubmit={submit} className="book-signup-form" aria-busy={pending}>
      <div className="book-signup-fields">
        <label className="sr-only" htmlFor={`${id}-email`}>Email address</label>
        <input id={`${id}-email`} type="email" name="email" placeholder={bookCopy.placeholder} autoComplete="email" inputMode="email" maxLength={254} required disabled={pending} autoFocus={placement === "menu"}
          onChange={event => { if (!started.current && event.target.value.length) { started.current = true; bookEvent("book_signup_started", { placement }); } }} aria-describedby={error ? `${id}-error` : undefined} />
        <button className="button" type="submit" disabled={pending || (!testMode && !humanToken)}>{bookCopy.submit}</button>
      </div>
      <div className="book-honeypot" aria-hidden="true"><label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" /></div>
      {testMode ? <input type="hidden" name="cf-turnstile-response" value="test-mode" /> : <HumanCheck siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} action="book_launch" resetKey={String(reset)} onToken={setHumanToken} />}
      {error && <p id={`${id}-error`} role="alert">{bookCopy.error}</p>}
    </form>
  </>;
}
export function HomepageBookCTA() {
  const { hydrated, bookDismissed, bookSubscribed, dismissBook } = usePreferences();
  const [success, setSuccess] = useState(false);
  const host = useRef<HTMLElement>(null);
  const receipt = useRef<HTMLDivElement>(null);
  useEffect(() => { if (success) receipt.current?.focus({ preventScroll: true }); }, [success]);
  const visible = process.env.NEXT_PUBLIC_BOOK_LAUNCH_ENABLED === "true" && hydrated && bookVisibility(bookDismissed, bookSubscribed).homepage;
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
      <button type="button" className="button book-dismiss" aria-label="Dismiss book invitation" onClick={() => {
        bookEvent("book_cta_dismissed", { placement: "homepage" }); dismissBook();
        restoreBookFocus();
      }}>×</button>
      <BookSignupForm placement="homepage" titleId="book-home-title" onSuccess={() => setSuccess(true)} />
    </div>
  </section>;
}
