"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { defaultPreferences, normalizePreferences, preferenceKey, type Preferences } from "@/lib/preferences";
import { carvingBookmarkKey, livingTimeline, normalizeTimeline, timelineKey, type LocalTimeline } from "@/lib/local-timeline";
import { TiltLightingControl } from "@/components/tilt-lighting-control";

const PreferenceContext = createContext({ preferences: defaultPreferences, reduced: false, hydrated: false, timeline: livingTimeline, resetVersion: 0, update: (_patch: Partial<Preferences>) => {}, changeTimeline: (_next: LocalTimeline) => {}, openPreferences: (_source: HTMLElement) => {} });
export const usePreferences = () => useContext(PreferenceContext);

export function SitePreferences({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [systemReduced, setSystemReduced] = useState(false);
  const [timeline, setTimeline] = useState(livingTimeline);
  const [hydrated, setHydrated] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const latest = useRef(defaultPreferences);
  const resetting = useRef(false);

  useEffect(() => {
    let initial = defaultPreferences;
    try { initial = normalizePreferences(JSON.parse(localStorage.getItem(preferenceKey) || "{}")); } catch { /* Defaults remain usable. */ }
    setPreferences(initial);
    latest.current = initial;
    let story = livingTimeline;
    try { story = normalizeTimeline(JSON.parse(localStorage.getItem(timelineKey) || "{}")); } catch { /* A fresh living timeline. */ }
    setTimeline(story); document.documentElement.dataset.timeline = story.kind;
    setHydrated(true);
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const theme = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const root = document.documentElement;
      initial = latest.current;
      root.dataset.theme = initial.theme === "system" ? (theme.matches ? "dark" : "light") : initial.theme;
      root.dataset.effects = initial.reduceEffects || motion.matches ? "reduced" : "full";
      root.dataset.compact = String(initial.compact);
      root.dataset.tilt = String(initial.tiltLighting);
      setSystemReduced(motion.matches);
    };
    apply();
    motion.addEventListener("change", apply);
    theme.addEventListener("change", apply);
    const sync = (event: StorageEvent) => {
      if (event.key === timelineKey) {
        let next = livingTimeline;
        try { next = normalizeTimeline(JSON.parse(event.newValue || "{}")); } catch { /* Defaults. */ }
        setTimeline(next); document.documentElement.dataset.timeline = next.kind; return;
      }
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
    root.dataset.tilt = String(next.tiltLighting);
  }
  function changeTimeline(next: LocalTimeline) {
    const safe = normalizeTimeline(next);
    setTimeline(safe); document.documentElement.dataset.timeline = safe.kind;
    try { localStorage.setItem(timelineKey, JSON.stringify(safe)); } catch { /* Still works in this visit. */ }
  }
  function reset() {
    update(defaultPreferences); changeTimeline(livingTimeline); setResetVersion(v => v + 1);
    try { [preferenceKey, timelineKey, carvingBookmarkKey, carvingBookmarkKey + ".seen"].forEach(key => localStorage.removeItem(key)); } catch { /* Local state is already reset. */ }
    // The server identity cookie and real communal entries are deliberately untouched.
    resetting.current = true; dialog.current?.close();
  }

  return <PreferenceContext value={{ preferences, reduced: preferences.reduceEffects || systemReduced, hydrated, timeline, resetVersion, update, changeTimeline, openPreferences: source => { opener.current = source; dialog.current?.showModal(); } }}>
    {children}
    {hydrated && <TiltLightingControl prompt enabled={preferences.tiltLighting} reduced={preferences.reduceEffects || systemReduced} resetVersion={resetVersion} onChange={enabled => update({ tiltLighting: enabled })} />}
    <dialog className="calendar-dialog preferences-dialog" ref={dialog} onClose={() => { const target = resetting.current ? document.querySelector<HTMLElement>("#main") : opener.current; resetting.current = false; target?.focus({ preventScroll: true }); }} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} aria-labelledby="preferences-title">
      <div className="calendar-dialog-content">
        <div className="calendar-dialog-heading"><h2 id="preferences-title">Accessibility &amp; Preferences</h2><button className="button calendar-close dialog-close" aria-label="Close preferences" onClick={() => dialog.current?.close()}>×</button></div>
        <fieldset className="appearance-options">
          <legend>Appearance</legend>
          <div className="appearance-selector">{([
            ["light", "Light"], ["dark", "Dark"], ["system", "Mirror my device"],
          ] as const).map(([value, label]) => <label key={value}>
            <input type="radio" name="appearance" value={value} checked={preferences.theme === value} onChange={() => update({ theme: value })} />
            <span className="preference-control">{label}</span>
          </label>)}</div>
        </fieldset>
        <label className="preference-row"><span>Reduce effects</span><span className="checkbox-control"><input type="checkbox" checked={preferences.reduceEffects} onChange={e => update({ reduceEffects: e.target.checked })} /><span className="preference-control checkbox-face" aria-hidden="true">✓</span></span></label>
        {systemReduced && <p className="calendar-help">Your device requests reduced motion, so the motion and lighting are already resting.</p>}
        <label className="preference-row"><span>Cozy, compact spacing</span><span className="checkbox-control"><input type="checkbox" checked={preferences.compact} onChange={e => update({ compact: e.target.checked })} /><span className="preference-control checkbox-face" aria-hidden="true">✓</span></span></label>
        <TiltLightingControl enabled={preferences.tiltLighting} reduced={preferences.reduceEffects || systemReduced} resetVersion={resetVersion} onChange={enabled => update({ tiltLighting: enabled })} />
        <button className="button button-small" onClick={reset}>Reset timeline and website preferences</button>
      </div>
    </dialog>
  </PreferenceContext>;
}
