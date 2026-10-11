"use client";

import { createContext, useContext } from "react";
import { useClientReady } from "@/lib/use-client-ready";

export const BookContext = createContext({ enabled: false, testMode: false, open: (_source: HTMLElement) => {} });
export function useBookLaunch() {
  const context = useContext(BookContext);
  const ready = useClientReady();
  return { ...context, enabled: context.enabled && ready };
}

export function restoreBookFocus(opener?: HTMLElement | null) {
  const candidates = [opener, ...document.querySelectorAll<HTMLElement>('[data-menu-opener],a[aria-label="Zack Cook, home"]')];
  candidates.find(target => target?.isConnected && target.getClientRects().length)?.focus({ preventScroll: true });
}
