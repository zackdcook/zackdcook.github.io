"use client";

import { createContext, useContext } from "react";

export const BookContext = createContext({ enabled: false, testMode: false, open: (_source: HTMLElement) => {} });
export const useBookLaunch = () => useContext(BookContext);

export function restoreBookFocus(opener?: HTMLElement | null) {
  const candidates = [opener, ...document.querySelectorAll<HTMLElement>('[data-menu-opener],a[aria-label="Zack Cook, home"]')];
  candidates.find(target => target?.isConnected && target.getClientRects().length)?.focus({ preventScroll: true });
}
