"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useRef } from "react";
import { site } from "@/content/site";

const links = [
  ["Home", "/"],
  ["Creative Works", "/writing"],
  ["Events", "/events"],
  ["About Me", "/about"],
  ["Words of Folly", "/journal"],
  ["Inspo Board", "/commonplace"],
  ["Shoutouts", "/shoutouts"],
];

export function SiteHeader() {
  const pathname = usePathname();
  const segment = useSelectedLayoutSegment();
  const visiblePath = segment ? `/${segment}` : "/";
  const menu = useRef<HTMLDetailsElement>(null);
  const menuScrollStart = useRef(0);
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);
  useEffect(() => {
    const closeOnScroll = () => {
      if (menu.current?.open && Math.abs(window.scrollY - menuScrollStart.current) > 6) {
        menu.current.open = false;
      }
    };
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, []);
  const current = (href: string) =>
    visiblePath === href || visiblePath.startsWith(`${href}/`)
      ? ("page" as const)
      : undefined;
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="wordmark home-tab" aria-label="Zack Cook, home" aria-current={visiblePath === "/" ? "page" : undefined}>
          <Image className="site-mark" src={site.icon} alt="" width={34} height={34} unoptimized />
          Zack Cook
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link key={href} href={href} aria-current={current(href)}>
              {label}
            </Link>
          ))}
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
                aria-current={current(href)}
                onClick={() => {
                  if (menu.current) menu.current.open = false;
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
