"use client";

import { useEffect } from "react";

/** One site-wide source of focus provenance, including native modal dialogs.
 * Typing into an input does not turn a preceding tap into keyboard navigation. */
export function InputMode() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.inputMode = "pointer";
    const pointer = () => { root.dataset.inputMode = "pointer"; };
    const keyboard = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const editing = target instanceof HTMLElement && (target.isContentEditable
        || target instanceof HTMLTextAreaElement
        || (target instanceof HTMLInputElement && !["radio", "checkbox", "button", "submit", "range"].includes(target.type)));
      if (event.key === "Tab" || (!editing && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "Enter", " "].includes(event.key))) {
        root.dataset.inputMode = "keyboard";
      }
    };
    document.addEventListener("pointerdown", pointer, true);
    document.addEventListener("touchstart", pointer, { capture: true, passive: true });
    document.addEventListener("keydown", keyboard, true);
    return () => {
      document.removeEventListener("pointerdown", pointer, true);
      document.removeEventListener("touchstart", pointer, true);
      document.removeEventListener("keydown", keyboard, true);
    };
  }, []);
  return null;
}
