"use client";
import { usePreferences } from "@/components/site-preferences";
import { Artwork } from "./artwork";
export function PreferencesButton({iconOnly=false,className="",onRequest}:{iconOnly?:boolean;className?:string;onRequest?:(source:HTMLButtonElement)=>void}) {
  const { openPreferences } = usePreferences();
  const button=<button type="button" className={`button button-small settings-button ${iconOnly?"":className}`} data-material-surface="glass" aria-haspopup="dialog" onClick={e => (onRequest??openPreferences)(e.currentTarget)}><Artwork slot="icon-preferences" className="site-asset-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 7h5m4 0h7M4 17h9m4 0h3"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg></Artwork><span className={iconOnly?"sr-only":undefined}>Settings</span></button>;
  // Retain the secret world's existing fixed icon wrapper and dimensions.
  return iconOnly?<div className={`footer-preferences ${className}`}>{button}</div>:button;
}
