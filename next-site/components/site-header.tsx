"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ViewTransition, useEffect, useId, useRef, useState } from "react";
import { navigation as authoredNavigation } from "@/content/navigation";
import { canonicalPath } from "@/lib/canonical-routes";
import { usePreferences } from "@/components/site-preferences";
import { PreferencesButton } from "./preferences-button";
import { Artwork } from "./artwork";
import { BRAND_MARK_PATH } from "@/lib/brand-mark";
import { BookMenuItem } from "./book-launch/provider";
import styles from "./site-header.module.css";

const navigation=authoredNavigation.map(item=>({...item,href:canonicalPath(item.href)}));

export function SiteHeader() {
  const pathname = usePathname();
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const visiblePath = canonicalPath(normalized);
  const dropdown = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const opener = useRef<HTMLButtonElement>(null);
  const explicitHome = useRef(false);
  const pendingSettings = useRef(false);
  const [open, setOpen] = useState(false);
  const { update, openPreferences } = usePreferences();
  const current = (href: string) => (href === "/" ? visiblePath === "/" : visiblePath === href || visiblePath.startsWith(href + "/")) ? "page" as const : undefined;
  const close = () => dropdown.current?.hidePopover();

  useEffect(() => {
    const historyTravel = () => { explicitHome.current = false; };
    window.addEventListener("popstate", historyTravel);
    return () => window.removeEventListener("popstate", historyTravel);
  }, []);
  useEffect(() => {
    dropdown.current?.hidePopover();
    setOpen(false);
    if (pathname === "/" && explicitHome.current) {
      explicitHome.current = false;
      const frame = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
      return () => cancelAnimationFrame(frame);
    }
  }, [pathname]);
  const goHome = () => {
    explicitHome.current = true;
    if (pathname === "/") {
      explicitHome.current = false;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };
  const toggleTheme = () => update({ theme: document.documentElement.dataset.theme === "dark" ? "light" : "dark" });
  const themeControl = <button type="button" className={`button ${styles.theme}`} data-material-surface="glass" onClick={toggleTheme} aria-label="Toggle light and dark mode">
    <span className={styles.sun} aria-hidden="true"><Artwork slot="icon-light"><svg viewBox="0 0 24 24"><title>☀</title><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.2 2.2m9.8 9.8 2.2 2.2M4.9 19.1l2.2-2.2m9.8-9.8 2.2-2.2"/></svg></Artwork></span>
    <span className={styles.moon} aria-hidden="true"><Artwork slot="icon-dark"><svg viewBox="0 0 24 24"><title>🌙</title><path d="M19.8 15.6A8.5 8.5 0 0 1 8.4 4.2 8.5 8.5 0 1 0 19.8 15.6Z"/></svg></Artwork></span>
  </button>;

  return <ViewTransition default="none"><header className={`site-header ${styles.header}`} data-page-route={visiblePath}>
    <div className={styles.inner}>
      <Link href="/" scroll={false} onNavigate={goHome} className={styles.wordmark} aria-label="Zack Cook, home" aria-current={current("/")}>
        <Artwork slot="brand-mark"><svg viewBox="0 0 1280 1280" aria-hidden="true" focusable="false">
          <path d={BRAND_MARK_PATH} fill="currentColor" />
        </svg></Artwork>
        <span><span>Zack</span> <span>Cook</span></span>
      </Link>
      <nav className={styles.desktop} aria-label="Main navigation">
        {navigation.map(({title,href}) => <Link key={href} href={href} prefetch scroll={href === "/" ? false : undefined} onNavigate={href === "/" ? goHome : undefined} aria-current={current(href)}>{title}</Link>)}
        <BookMenuItem />
      </nav>
      <div className={styles.controls}>
        {themeControl}
        <PreferencesButton className={styles.settings} />
        <button ref={opener} data-menu-opener type="button" className={`button ${styles.menu}`} aria-expanded={open} aria-controls={menuId} popoverTarget={menuId} popoverTargetAction="toggle">
          Menu <span aria-hidden="true">＋</span>
        </button>
      </div>
    </div>
    <div ref={dropdown} id={menuId} popover="auto" className={styles.sheet} onToggle={event => {
      const opened = event.newState === "open";
      setOpen(opened);
      if (opened) dropdown.current?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
      else if (pendingSettings.current && opener.current) {
        pendingSettings.current = false;
        openPreferences(opener.current);
      }
    }}>
      <nav className={styles.destinations} aria-label="Mobile navigation">
        {navigation.map(({title,href}) => <Link key={href} href={href} scroll={href === "/" ? false : undefined} onNavigate={href === "/" ? goHome : undefined} aria-current={current(href)} onClick={close}>
          <span>{title}</span>
        </Link>)}
        <BookMenuItem closeMenu={close} />
      </nav>
      <div className={styles.sheetFooter}><PreferencesButton onRequest={()=>{pendingSettings.current=true;close();}} /></div>
    </div>
  </header></ViewTransition>;
}
