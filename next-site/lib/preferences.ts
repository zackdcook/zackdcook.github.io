export const preferenceKey = "zack.preferences.v1";
export type Preferences = {
  theme: "system" | "light" | "dark";
  reduceEffects: boolean;
  compact: boolean;
  expandedProjects: boolean;
};
export const defaultPreferences: Preferences = {
  theme: "system", reduceEffects: false, compact: false, expandedProjects: true,
};
export function normalizePreferences(value: unknown): Preferences {
  const v = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    theme: v.theme === "dark" || v.theme === "light" ? v.theme : "system",
    reduceEffects: v.reduceEffects === true,
    compact: v.compact === true,
    expandedProjects: v.expandedProjects !== false,
  };
}

// Runs before first paint. Reading storage is guarded for private/blocked modes.
export const preferenceBootstrap = `(function(){var p={};try{p=JSON.parse(localStorage.getItem('${preferenceKey}')||'{}')||{}}catch(e){}var r=document.documentElement;var t=p.theme==='dark'||p.theme==='light'?p.theme:'system';r.dataset.theme=t==='system'?(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):t;r.dataset.effects=p.reduceEffects===true||matchMedia('(prefers-reduced-motion:reduce)').matches?'reduced':'full';r.dataset.compact=p.compact===true?'true':'false';r.dataset.projects=p.expandedProjects===false?'collapsed':'expanded';})();`;
