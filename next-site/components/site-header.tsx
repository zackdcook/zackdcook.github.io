"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/content/navigation";
import { usePreferences } from "@/components/site-preferences";
import { StudioArtwork } from "./studio-artwork";
import { PreferencesButton } from "./preferences-button";
import { Artwork } from "./artwork";
import { BookMenuItem } from "./book-launch/provider";
import styles from "./site-header.module.css";

export function SiteHeader() {
  const pathname = usePathname();
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const visiblePath = ({ "/creativeworks": "/creative-works", "/aboutme": "/about-me" } as Record<string, string>)[normalized] ?? normalized;
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const explicitHome = useRef(false);
  const pendingSettings = useRef(false);
  const [open, setOpen] = useState(false);
  const { update, openPreferences } = usePreferences();
  const current = (href: string) => (href === "/" ? visiblePath === "/" : visiblePath === href || visiblePath.startsWith(href + "/")) ? "page" as const : undefined;
  const close = () => { dialog.current?.close(); setOpen(false); };

  useEffect(() => {
    const historyTravel = () => { explicitHome.current = false; };
    window.addEventListener("popstate", historyTravel);
    return () => window.removeEventListener("popstate", historyTravel);
  }, []);
  useEffect(() => {
    dialog.current?.close();
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
  const themeControl = <button type="button" className={styles.theme} data-material-surface="glass" onClick={toggleTheme} aria-label="Toggle light and dark mode">
    <span className={styles.sun} aria-hidden="true"><Artwork slot="icon-light"><svg viewBox="0 0 24 24"><title>☀</title><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.2 2.2m9.8 9.8 2.2 2.2M4.9 19.1l2.2-2.2m9.8-9.8 2.2-2.2"/></svg></Artwork></span>
    <span className={styles.moon} aria-hidden="true"><Artwork slot="icon-dark"><svg viewBox="0 0 24 24"><title>🌙</title><path d="M19.8 15.6A8.5 8.5 0 0 1 8.4 4.2 8.5 8.5 0 1 0 19.8 15.6Z"/></svg></Artwork></span>
  </button>;

  return <header className={`site-header ${styles.header}`}>
    <div className={styles.inner}>
      <Link href="/" scroll={false} onNavigate={goHome} className={styles.wordmark} aria-label="Zack Cook, home" aria-current={current("/")}>
        <Artwork slot="brand-mark"><svg viewBox="0 0 1280 1280" aria-hidden="true" focusable="false">
          <path d="M395 200 C560 230 800 198 980 150 L1015 190 L205 875 L176 800 L800 294 C620 330 460 305 395 263 Z M220 1035 L180 993 L1034 380 L1018 445 L503 951 C665 910 800 934 938 968 L969 1040 C744 971 480 1014 268 1098 Z" fill="currentColor" />
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
        <button ref={opener} data-menu-opener type="button" className={styles.menu} aria-haspopup="dialog" aria-expanded={open} onClick={() => { dialog.current?.showModal(); setOpen(true); }}>
          Menu <span aria-hidden="true">＋</span>
        </button>
      </div>
    </div>
    <dialog ref={dialog} className={styles.sheet} aria-label="Mobile navigation" onCancel={() => setOpen(false)} onClose={() => {
      setOpen(false);
      if(pendingSettings.current && opener.current){pendingSettings.current=false;openPreferences(opener.current);}
      else opener.current?.focus({preventScroll:true});
    }} onClick={event => { if(event.target === event.currentTarget) close(); }}>
      <div className={styles.sheetHeader}>
        <span className={styles.sheetName}>Zack Cook</span>
        <button type="button" className={styles.menu} onClick={close}>Menu <span aria-hidden="true" className={styles.close}>＋</span></button>
      </div>
      <nav className={styles.destinations} aria-label="Mobile navigation">
        {navigation.map(({title,href}) => <Link key={href} href={href} scroll={href === "/" ? false : undefined} onNavigate={href === "/" ? goHome : undefined} aria-current={current(href)} onClick={close}>
          <span>{title}</span><Artwork slot="icon-arrow"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 16h21M18 8l8 8-8 8" /></svg></Artwork>
        </Link>)}
        <BookMenuItem closeMenu={close} />
      </nav>
      <div className={styles.sheetFooter}><PreferencesButton onRequest={()=>{pendingSettings.current=true;close();}} /></div>
      <div className={styles.sceneryFrame}><StudioArtwork slot="navigation-scenery" variant="window" className={styles.scenery}/></div>
    </dialog>
  </header>;
}
