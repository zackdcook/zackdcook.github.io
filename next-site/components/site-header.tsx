"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { navigation } from "@/content/navigation";
import { usePreferences } from "@/components/site-preferences";

const links = navigation.map(({ title, href }) => [title, href]);

export function SiteHeader() {
  const pathname = usePathname();
  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const visiblePath =
    ({
      "/creativeworks": "/creative-works",
      "/aboutme": "/about-me",
      "/journal": "/words-of-folly",
    } as Record<string, string>)[normalizedPath] ?? normalizedPath;
  const menu = useRef<HTMLDetailsElement>(null);
  const menuScrollStart = useRef(0);
  const explicitHome = useRef(false);
  const { update } = usePreferences();
  const toggleTheme = () => {
    const current =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    update({
      theme: current === "dark" ? "light" : "dark",
    });
  };
  // Only a deliberate Home navigation resets scroll. popstate clears this intent,
  // leaving Next/browser history restoration in charge of Back and Forward.
  useEffect(() => {
    const historyTravel = () => { explicitHome.current = false; };
    window.addEventListener("popstate", historyTravel);
    return () => window.removeEventListener("popstate", historyTravel);
  }, []);
  useEffect(() => {
    if (menu.current) menu.current.open = false;
    if (pathname === "/" && explicitHome.current) {
      explicitHome.current = false;
      const frame = requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }));
      return () => cancelAnimationFrame(frame);
    }
  }, [pathname]);
  const goHome = () => {
    explicitHome.current = true;
    if (pathname === "/") { explicitHome.current = false; window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }
  };
  useEffect(() => {
    const closeOnScroll = () => {
      if (menu.current?.open && Math.abs(window.scrollY - menuScrollStart.current) > 6) {
        menu.current.open = false;
      }
    };
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, []);
  useEffect(() => {
    const dismissOutside = (event: Event) => {
      if (menu.current?.open && event.target instanceof Node && !menu.current.contains(event.target)) menu.current.open = false;
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, []);
  const current = (href: string) => {
    const matches =
      href === "/"
        ? visiblePath === "/"
        : visiblePath === href || visiblePath.startsWith(`${href}/`);
    return matches ? ("page" as const) : undefined;
  };
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" scroll={false} onNavigate={goHome} className="wordmark home-tab" aria-label="Zack Cook, home" aria-current={current("/")}>
          <svg className="site-mark" viewBox="0 0 1280 1280" aria-hidden="true" focusable="false">
            <rect width="1280" height="1280" rx="200" fill="var(--midnight)" />
            <path d="M395 200 C560 230 800 198 980 150 L1015 190 L205 875 L176 800 L800 294 C620 330 460 305 395 263 Z M220 1035 L180 993 L1034 380 L1018 445 L503 951 C665 910 800 934 938 968 L969 1040 C744 971 480 1014 268 1098 Z" fill="var(--coral)" />
          </svg>
          <span className="wordmark-name"><span className="wordmark-zack">Zack</span> <span className="wordmark-cook">Cook</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href} prefetch scroll={href === "/" ? false : undefined} onNavigate={href === "/" ? goHome : undefined} aria-current={current(href)}>
              {label}
            </Link>
          ))}

          <div className="desktop-theme-control">
            <span className="theme-icon theme-sun" aria-hidden="true">☀</span>

            <button
              type="button"
              className="desktop-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle light and dark mode"
            >
              <span className="theme-toggle-knob" />
            </button>

            <span className="theme-icon theme-moon" aria-hidden="true">🌙</span>
          </div>
        </nav>
        <details
          className="mobile-menu"
          ref={menu}
          onToggle={() => { menuScrollStart.current = window.scrollY; }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && menu.current) {
              menu.current.open = false;
              menu.current.querySelector("summary")?.focus();
            }
          }}
        >
          <summary>
            Menu <span aria-hidden="true">＋</span>
          </summary>
          <nav aria-label="Mobile navigation">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                scroll={href === "/" ? false : undefined}
                onNavigate={href === "/" ? goHome : undefined}
                aria-current={current(href)}
                onClick={() => {
                  if (menu.current) menu.current.open = false;
                }}
              >
                {label}
              </Link>
            ))}

            <div className="mobile-theme-control">
              <span className="theme-icon theme-sun" aria-hidden="true">☀</span>

              <button
                type="button"
                className="mobile-theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle light and dark mode"
              >
                <span className="theme-toggle-knob" />
              </button>

<span className="theme-icon theme-moon" aria-hidden="true">🌙</span>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
