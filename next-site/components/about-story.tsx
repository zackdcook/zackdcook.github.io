"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { aboutMemories } from "@/content/about-photos";
import { photoRailPositions } from "@/lib/about-photo-rail";
import { AboutMemoryPhoto } from "./about-memory-photo";
import { ReversiblePortrait } from "./reversible-portrait";
import { usePreferences } from "./site-preferences";
import styles from "@/app/aboutme/aboutme.module.css";

const photos = aboutMemories.filter(memory => memory.src);
const gap = 24;

export function AboutStory({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const { reduced } = usePreferences();

  useEffect(() => {
    const node = root.current;
    if (!node || reduced || CSS.supports("animation-timeline: view()")) return;
    const arrivals = [...node.querySelectorAll<HTMLElement>(".about-story p>span, [data-inline-memory]")];
    node.dataset.arrivalMode = "fallback";
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      (entry.target as HTMLElement).dataset.arrived = String(entry.isIntersecting || entry.boundingClientRect.top < 0);
    }), { threshold: .08 });
    arrivals.forEach(item => { item.dataset.arrived = String(item.getBoundingClientRect().top < innerHeight); observer.observe(item); });
    return () => { observer.disconnect(); delete node.dataset.arrivalMode; arrivals.forEach(item => delete item.dataset.arrived); };
  }, [reduced]);

  useEffect(() => {
    const node = root.current;
    const rail = node?.querySelector<HTMLElement>("[data-photo-rail]");
    if (!node || !rail) return;
    const desktop = matchMedia("(min-width: 960px) and (min-height: 600px)");
    const cards = [...rail.querySelectorAll<HTMLElement>("[data-memory-card]")];
    const markers = [node.querySelector<HTMLElement>("[data-about-opening]"), ...photos.map(photo => node.querySelector<HTMLElement>(`[data-about-photo="${photo.id}"]`))];
    const chapters = ["opening", ...photos.map(photo => photo.id)].map(id => node.querySelector<HTMLElement>(`[data-about-chapter="${id}"]`));
    const header = document.querySelector<HTMLElement>(".site-header");
    let anchors: number[] = [], heights: number[] = [], frame = 0, cancelled = false;
    const paint = () => {
      frame = 0;
      if (!desktop.matches) return;
      const railTop = rail.getBoundingClientRect().top;
      const top = Math.max(header?.getBoundingClientRect().bottom ?? 0, 0) + 16;
      const positions = photoRailPositions(anchors.map(anchor => anchor - scrollY), heights, top, gap, innerHeight);
      cards.forEach((card, index) => {
        const y = positions[index];
        const hidden = y + heights[index] <= 0 || y >= innerHeight;
        card.style.transform = `translate3d(0,${y - railTop}px,0)`;
        card.inert = hidden;
        card.setAttribute("aria-hidden", String(hidden));
      });
      node.dataset.railReady = "true";
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const measure = () => {
      heights = cards.map(card => card.getBoundingClientRect().height);
      chapters.forEach((chapter, index) => {
        const height = `${heights[index] + gap}px`;
        if (chapter && chapter.style.getPropertyValue("--photo-height") !== height) chapter.style.setProperty("--photo-height", height);
      });
      anchors = markers.map(marker => marker ? marker.getBoundingClientRect().top + scrollY : Infinity);
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    cards.forEach(card => observer.observe(card));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    desktop.addEventListener("change", measure);
    void document.fonts.ready.then(() => { if (!cancelled) measure(); });
    measure();
    return () => {
      cancelled = true; cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", measure);
      desktop.removeEventListener("change", measure); delete node.dataset.railReady;
    };
  }, []);

  return <div ref={root} className={styles.readingGrid}>
    <div className={styles.readingProgress} aria-hidden="true"><span><i /></span></div>
    {children}
    <aside className={styles.photoRail} data-photo-rail aria-label="Photos from the story">
      <div className={styles.memoryCard} data-memory-card aria-hidden={false}><ReversiblePortrait /></div>
      {photos.map(photo => <div key={photo.id} className={styles.memoryCard} data-memory-card inert aria-hidden="true"><AboutMemoryPhoto id={photo.id} /></div>)}
    </aside>
  </div>;
}
