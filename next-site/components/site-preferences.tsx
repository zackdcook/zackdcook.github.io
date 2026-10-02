"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { defaultPreferences, normalizePreferences, preferenceKey, type Preferences } from "@/lib/preferences";

const PreferenceContext = createContext({ preferences: defaultPreferences, reduced: false, update: (_patch: Partial<Preferences>) => {} });
export const usePreferences = () => useContext(PreferenceContext);

export function SitePreferences({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [systemReduced, setSystemReduced] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const latest = useRef(defaultPreferences);

  useEffect(() => {
    let initial = defaultPreferences;
    try { initial = normalizePreferences(JSON.parse(localStorage.getItem(preferenceKey) || "{}")); } catch { /* Defaults remain usable. */ }
    setPreferences(initial);
    latest.current = initial;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const theme = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const root = document.documentElement;
      initial = latest.current;
      root.dataset.theme = initial.theme === "system" ? (theme.matches ? "dark" : "light") : initial.theme;
      root.dataset.effects = initial.reduceEffects || motion.matches ? "reduced" : "full";
      root.dataset.compact = String(initial.compact);
      root.dataset.projects = initial.expandedProjects ? "expanded" : "collapsed";
      setSystemReduced(motion.matches);
    };
    apply();
    motion.addEventListener("change", apply);
    theme.addEventListener("change", apply);
    const sync = (event: StorageEvent) => {
      if (event.key !== preferenceKey) return;
      try { initial = normalizePreferences(JSON.parse(event.newValue || "{}")); } catch { initial = defaultPreferences; }
      latest.current = initial; setPreferences(initial); apply();
    };
    window.addEventListener("storage", sync);
    return () => { motion.removeEventListener("change", apply); theme.removeEventListener("change", apply); window.removeEventListener("storage", sync); };
  }, []);

  function update(patch: Partial<Preferences>) {
    const next = normalizePreferences({ ...preferences, ...patch });
    setPreferences(next);
    latest.current = next;
    try { localStorage.setItem(preferenceKey, JSON.stringify(next)); } catch { /* Settings still work for this visit. */ }
    const root = document.documentElement;
    root.dataset.theme = next.theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : next.theme;
    root.dataset.effects = next.reduceEffects || systemReduced ? "reduced" : "full";
    root.dataset.compact = String(next.compact);
    root.dataset.projects = next.expandedProjects ? "expanded" : "collapsed";
  }

  return <PreferenceContext value={{ preferences, reduced: preferences.reduceEffects || systemReduced, update }}>
    {children}
    <div className="preferences-launcher shell">
      <button className="button button-small" ref={opener} onClick={() => dialog.current?.showModal()} aria-haspopup="dialog">Make yourself at home</button>
    </div>
    <dialog className="calendar-dialog preferences-dialog" ref={dialog} onClose={() => opener.current?.focus()} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} aria-labelledby="preferences-title">
      <div className="calendar-dialog-content">
        <div className="calendar-dialog-heading"><h2 id="preferences-title">Your corner.</h2><button className="button calendar-close" aria-label="Close preferences" onClick={() => dialog.current?.close()}>×</button></div>
        <p className="calendar-help">Just for this browser. No account needed.</p>
        <label className="preference-row"><span>Light or twilight?</span><select value={preferences.theme} onChange={e => update({ theme: e.target.value as Preferences["theme"] })}><option value="system">Follow my device</option><option value="light">Light · paper</option><option value="dark">Dark · twilight</option></select></label>
        <label className="preference-row"><span>Reduce effects</span><input type="checkbox" checked={preferences.reduceEffects} onChange={e => update({ reduceEffects: e.target.checked })} /></label>
        {systemReduced && <p className="calendar-help">Your device requests reduced motion, so the motion and lighting are already resting.</p>}
        <label className="preference-row"><span>Cozy, compact spacing</span><input type="checkbox" checked={preferences.compact} onChange={e => update({ compact: e.target.checked })} /></label>
        <label className="preference-row"><span>Expand project descriptions</span><input type="checkbox" checked={preferences.expandedProjects} onChange={e => update({ expandedProjects: e.target.checked })} /></label>
        <button className="button button-small" onClick={() => update(defaultPreferences)}>Reset preferences</button>
      </div>
    </dialog>
  </PreferenceContext>;
}
