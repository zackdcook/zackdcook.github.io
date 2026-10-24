"use client";
import { useEffect, useState } from "react";
import { usePreferences } from "@/components/site-preferences";
export function NewsletterUnsubscribe() {
  const { unsubscribeNewsletter } = usePreferences();
  const [token,setToken]=useState(""),[pending,setPending]=useState(false),[done,setDone]=useState(false),[error,setError]=useState(false);
  useEffect(()=>{ const value=location.hash.slice(1); if (/^[a-f0-9]{64}$/.test(value)) setToken(value); },[]);
  async function unsubscribe() {
    if (pending || !token) return;
    setPending(true);setError(false);
    try {
      const response=await fetch("/api/book-launch",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"unsubscribe_newsletter",unsubscribe_token:token,website:""}),signal:AbortSignal.timeout(15000)});
      const result=await response.json();
      if (!response.ok || result.accepted!==true) throw new Error("unavailable");
      unsubscribeNewsletter();
      history.replaceState(null,"",location.pathname);setToken("");setDone(true);
    } catch {setError(true);} finally {setPending(false);}
  }
  return <div className="prose">
    {done ? <p role="status">You’re unsubscribed from future newsletters. Your one-time book announcement choice stays the same.</p> : <>
      <p>Unsubscribe from Zack Cook’s ongoing newsletter. This keeps your separate one-time book announcement choice as it is.</p>
      {token ? <button className="button" disabled={pending} onClick={()=>void unsubscribe()}>{pending ? "Updating…" : "Unsubscribe from newsletters"}</button> : <p>Open the unsubscribe link in your newsletter, or email <a href="mailto:hi@zackdcook.com?subject=Newsletter%20unsubscribe">hi@zackdcook.com</a> to request removal.</p>}
      {error && <p role="alert">Something went wrong. Please try again, or email hi@zackdcook.com.</p>}
    </>}
  </div>;
}
