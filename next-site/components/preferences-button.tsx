"use client";
import { usePreferences } from "@/components/site-preferences";
export function PreferencesButton() {
  const { openPreferences } = usePreferences();
  return <div className="footer-preferences"><button className="button button-small" aria-haspopup="dialog" onClick={e => openPreferences(e.currentTarget)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="6.5" r="1"/><path d="M7 10h10m-5 0v5m0-1-3 5m3-5 3 5"/></svg>Accessibility &amp; preferences</button></div>;
}
