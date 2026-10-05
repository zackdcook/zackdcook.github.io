"use client";

import { useActionState } from "react";
import { submitShoutout } from "@/app/actions/submissions";
import { initialSubmissionState } from "@/lib/guestbook";
import { HumanCheck } from "@/components/human-check";

export function ShoutoutForm({ enabled, siteKey }: { enabled: boolean; siteKey: string }) {
  const [state, action, pending] = useActionState(submitShoutout, initialSubmissionState);
  return <section className="submission-panel shoutout-form section-space">
    <p className="eyebrow">Pass it on</p><h2>Know a cool peep?</h2><p>Introduce me to someone whose work deserves a little love.</p>
    {state.status === "pending" ? <p role="status">{state.message}</p> : <form action={action}>
      <label>Their name<input name="name" maxLength={80} required /></label>
      <label>Their website or public profile<input name="url" type="url" maxLength={2048} placeholder="https://" required /></label>
      <label>What makes them cool?<textarea name="summary" maxLength={240} rows={3} required /></label>
      <label className="honey-field" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {enabled ? <HumanCheck siteKey={siteKey} action="shoutout" resetKey={state.message} /> : <p className="form-hint">Suggestions open soon. In the meantime, send me an email.</p>}
      <p className="form-hint">Zack reviews suggestions before sharing them. Use a public link and leave private details out.</p>
      <button className="button" disabled={!enabled || pending}>{pending ? "Sending…" : "Send a shoutout"}</button>
      {state.message && <p role="alert" className="form-status">{state.message}</p>}
    </form>}
  </section>;
}
