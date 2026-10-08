export const preferenceKey = "zack.preferences.v1";
export type Preferences = {
  theme: "system" | "light" | "dark";
  reduceEffects: boolean;
  compact: boolean;
  tiltLighting: boolean;
};
export const defaultPreferences: Preferences = {
  theme: "system", reduceEffects: false, compact: false, tiltLighting: false,
};
export function normalizePreferences(value: unknown): Preferences {
  const v = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    theme: v.theme === "dark" || v.theme === "light" ? v.theme : "system",
    reduceEffects: v.reduceEffects === true,
    compact: v.compact === true,
    tiltLighting: v.tiltLighting === true,
  };
}

// Runs before first paint. Reading storage is guarded for private/blocked modes.
export const preferenceBootstrap = `(function(){var p={},s={};try{p=JSON.parse(localStorage.getItem('${preferenceKey}')||'{}')||{};s=JSON.parse(localStorage.getItem('zack.timeline.v1')||'{}')||{}}catch(e){}var r=document.documentElement;var t=p.theme==='dark'||p.theme==='light'?p.theme:'system';r.dataset.theme=t==='system'?(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):t;r.dataset.effects=p.reduceEffects===true||matchMedia('(prefers-reduced-motion:reduce)').matches?'reduced':'full';r.dataset.compact=p.compact===true?'true':'false';r.dataset.tilt=p.tiltLighting===true?'true':'false';r.dataset.timeline=s.kind==='felled'&&Number.isSafeInteger(s.felledAtGuestNumber)&&s.felledAtGuestNumber>=0&&s.felledAtGuestNumber<=1000000000?'felled':'living';})();`;
