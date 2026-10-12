"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Artwork } from "./artwork";
import { usePreferences } from "./site-preferences";
import { defaultPreferences } from "@/lib/preferences";
import { livingTimeline } from "@/lib/local-timeline";
import headerStyles from "./site-header.module.css";

/** Native buttons retain Tab/Enter/Space; arrows also navigate a menu's choices. */
export function choiceKeys(event: KeyboardEvent<HTMLElement>) {
  const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
  if (!direction && event.key !== "Home" && event.key !== "End") return;
  const choices = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
  const index = choices.indexOf(document.activeElement as HTMLButtonElement);
  if (index < 0 || !choices.length) return;
  event.preventDefault();
  choices[event.key === "Home" ? 0 : event.key === "End" ? choices.length - 1 : (index + direction + choices.length) % choices.length].focus({ preventScroll: true });
}

export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="bebrave-rpg-actions" aria-label="Choices" onKeyDown={choiceKeys}>{children}</div>;
}

export function Dialogue({ children, actions, className = "", label }: { children: ReactNode; actions?: ReactNode; className?: string; label?: string }) {
  return <div className={`bebrave-rpg-hud bebrave-menu-panel ${className}`} data-brave-dialogue>
    {label && <div className="bebrave-menu-label" aria-hidden="true">{label}</div>}
    <div className="bebrave-rpg-dialogue"><div className="bebrave-rpg-copy" tabIndex={-1} data-menu-focus>{children}</div></div>
    {actions && <ActionBar>{actions}</ActionBar>}
  </div>;
}

export function OverlayScene({ visual, children, actions }: { visual: ReactNode; children?: ReactNode; actions?: ReactNode }) {
  return <div className="bebrave-overlay"><div className="bebrave-overlay-main">{visual}</div>{children && <Dialogue actions={actions}>{children}</Dialogue>}</div>;
}

export function HomeControls({ testMode = false, busy = false, drawing = false, onReset, onResetTimeline }: { testMode?: boolean; busy?: boolean; drawing?: boolean; onReset?: () => void; onResetTimeline?: () => void }) {
  const [settings, setSettings] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  return <>
    <nav className="bebrave-game-nav" aria-label="Game navigation">
    <a className={`${headerStyles.wordmark} bebrave-home-button`} href="/" aria-label="Zack Cook, home">
      <Artwork slot="brand-mark"><svg viewBox="0 0 1280 1280" aria-hidden="true" focusable="false"><path d="M395 200 C560 230 800 198 980 150 L1015 190 L205 875 L176 800 L800 294 C620 330 460 305 395 263 Z M220 1035 L180 993 L1034 380 L1018 445 L503 951 C665 910 800 934 938 968 L969 1040 C744 971 480 1014 268 1098 Z" fill="currentColor" /></svg></Artwork><span><span>Zack</span> <span>Cook</span></span>
    </a>
    {testMode && !drawing && <button className="button bebrave-test-reset-button" aria-label="Reset my carve limit" title="Reset my carve limit" disabled={busy} onClick={onReset}><span className="bebrave-reset-full">Reset my carve limit</span><span className="bebrave-reset-short">Reset limit</span></button>}
    {!drawing && <button className="button bebrave-preferences" aria-label="Settings" aria-haspopup="dialog" disabled={busy} onClick={event => { opener.current = event.currentTarget; setSettings(true); }}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h5m4 0h7M4 17h9m4 0h3"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg>
    </button>}
    </nav>
    {settings && <GameSettings opener={opener.current} onClose={() => setSettings(false)} onResetTimeline={onResetTimeline}/>}
  </>;
}

function GameSettings({ opener, onClose, onResetTimeline }: { opener: HTMLButtonElement | null; onClose: () => void; onResetTimeline?: () => void }) {
  const { preferences, reduced, update, changeTimeline } = usePreferences();
  const dialog = useRef<HTMLDialogElement>(null), title = useId();
  useEffect(() => {
    dialog.current?.showModal();
    return () => { if (opener?.isConnected) opener.focus({ preventScroll: true }); };
  }, [opener]);
  return <dialog ref={dialog} className="bebrave-settings bebrave-menu-panel" aria-labelledby={title} onClose={onClose}>
    <header className="bebrave-inspector-heading"><h2 id={title}>Settings</h2><button className="button" aria-label="Back" onClick={() => dialog.current?.close()}>×</button></header>
    <fieldset><legend>Appearance</legend><div className="bebrave-setting-choices" onKeyDown={choiceKeys}>{(["system", "light", "dark"] as const).map(theme => <button key={theme} className="button" aria-pressed={preferences.theme === theme} onClick={() => update({ theme })}>{theme[0].toUpperCase() + theme.slice(1)}</button>)}</div></fieldset>
    <label className="bebrave-setting-toggle"><input type="checkbox" checked={preferences.reduceEffects} onChange={event => update({ reduceEffects: event.target.checked })}/><span>Reduce effects</span></label>
    {reduced && !preferences.reduceEffects && <p className="bebrave-setting-note">Your device’s reduced-motion setting is active.</p>}
    <button className="button bebrave-reset-timeline" onClick={() => { update(defaultPreferences); changeTimeline(livingTimeline); onResetTimeline?.(); dialog.current?.close(); }}>Reset timeline and preferences</button>
  </dialog>;
}
