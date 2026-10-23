"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePreferences } from "./site-preferences";
import styles from "@/app/aboutme/aboutme.module.css";

export function AboutStory({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const { reduced } = usePreferences();

  useEffect(() => {
    const node = root.current;
    if (!node || reduced || CSS.supports("animation-timeline: view()")) return;
    // Observe each whole chapter so its text and photo arrive together.
    const chapters = [...node.querySelectorAll<HTMLElement>("[data-about-chapter]")];
    node.dataset.arrivalMode = "fallback";
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      (entry.target as HTMLElement).dataset.arrived = String(entry.isIntersecting || entry.boundingClientRect.top < 0);
    }), { threshold: 0 });
    chapters.forEach(chapter => {
      chapter.dataset.arrived = String(chapter.getBoundingClientRect().top < innerHeight);
      observer.observe(chapter);
    });
    return () => {
      observer.disconnect();
      delete node.dataset.arrivalMode;
      chapters.forEach(chapter => delete chapter.dataset.arrived);
    };
  }, [reduced]);

  return <div ref={root} className={styles.readingGrid}>
    <div className={styles.readingProgress} aria-hidden="true"><span><i /></span></div>
    {children}
  </div>;
}
