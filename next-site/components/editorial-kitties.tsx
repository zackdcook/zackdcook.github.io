"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePreferences } from "./site-preferences";
import { Artwork, ArtworkImage } from "./artwork";
import { artworkEnabled } from "@/lib/art-assets";
import { kittyWindows, shadowFlight } from "@/lib/kitty-shadows";
import styles from "./editorial-kitties.module.css";

const discoveryKey = "zack.brave-discovered.v1";

function BirdShadow() {
  return <Artwork slot="kitty-shadow" className={styles.shadowArt}>
    <svg viewBox="0 0 64 40" aria-hidden="true" focusable="false">
      <path className={styles.leftWing} d="M32 22C24 11 14 6 2 10c8 3 12 9 17 13l11 3Z"/>
      <path className={styles.rightWing} d="M32 22C40 11 50 6 62 10c-8 3-12 9-17 13l-11 3Z"/>
      <path d="m29 22 3-7 4 7-2 6 5 8-7-3-7 3 5-8Z"/>
    </svg>
  </Artwork>;
}

export function EditorialKitties({ emptyPhoto, label = "Editorial kitty committee aka firing squad" }: { emptyPhoto?: string | null; label?: string }) {
  const { reduced } = usePreferences();
  const [escaped, setEscaped] = useState(false), [secretReady, setSecretReady] = useState(!emptyPhoto);
  const photograph = useRef<HTMLDivElement>(null), bird = useRef<HTMLButtonElement>(null), destination = useRef<HTMLAnchorElement>(null);
  const flight = useRef<Animation | null>(null), focusDestination = useRef(false);
  const press = useRef<{id:number;x:number;y:number}|null>(null);
  const changedPhoto = escaped && secretReady, windowArea = kittyWindows.original;

  // A discovery stays available through refreshes and return visits. Storage
  // restrictions only affect persistence, never the current interaction.
  useEffect(() => {
    try { if (localStorage.getItem(discoveryKey) === "true") setEscaped(true); } catch {}
    const sync = (event: StorageEvent) => { if (event.key === discoveryKey && event.newValue === "true") setEscaped(true); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (escaped && focusDestination.current) {
      destination.current?.focus({ preventScroll: true });
      focusDestination.current = false;
    }
  }, [escaped]);

  useEffect(() => {
    const photo = photograph.current, target = bird.current;
    if (!photo || !target || escaped) return;
    let active = false, disposed = false, timer: ReturnType<typeof setTimeout> | undefined;
    const coordinates = (point: number[]) => `translate3d(${point[0] * photo.clientWidth - target.clientWidth / 2}px,${point[1] * photo.clientHeight - target.clientHeight / 2}px,0)`;
    function rest() {
      flight.current?.cancel(); flight.current = null;
      target!.style.transform = coordinates(windowArea.rest);
      target!.dataset.state = "rest";
    }
    function stop() { clearTimeout(timer); rest(); }
    function schedule(delay: number) { clearTimeout(timer); if (active && !disposed && !document.hidden && !reduced) timer = setTimeout(fly, delay); }
    function fly() {
      if (!active || document.hidden || disposed || reduced) return;
      const path = shadowFlight();
      target!.style.setProperty("--shadow-size", `${path.size}px`);
      target!.style.setProperty("--shadow-direction", path.reverse ? "-1" : "1");
      target!.dataset.state = "flying";
      const from = coordinates(path.from), to = coordinates(path.to);
      const animation = target!.animate([{ transform: from, opacity: 0 }, { opacity: .64, offset: .15 }, { opacity: .64, offset: .85 }, { transform: to, opacity: 0 }], { duration: path.duration, fill: "forwards", easing: "linear" });
      flight.current = animation;
      animation.onfinish = () => { if (disposed) return; rest(); schedule(path.delay); };
    }
    const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; if (active) schedule(500 + Math.random() * 800); else stop(); }, { threshold: .05 });
    const resize = new ResizeObserver(() => { rest(); schedule(800); });
    const visibility = () => { if (document.hidden) stop(); else schedule(800); };
    rest(); observer.observe(photo); resize.observe(photo); document.addEventListener("visibilitychange", visibility);
    return () => { disposed = true; stop(); observer.disconnect(); resize.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [escaped, reduced, windowArea]);

  function discover() {
    flight.current?.cancel(); focusDestination.current = true; setEscaped(true);
    try { localStorage.setItem(discoveryKey, "true"); } catch {}
  }

  return <div className={`kitty-discovery ${styles.discovery}`}>
    <figure className={styles.figure}>
      <div className="life-photo">
        <div className={`tactile-photo kitty-photo ${styles.photo}`} data-material-surface="glass" data-escaped={changedPhoto ? "true" : undefined}>
          <div ref={photograph} className={`photo-clip ${styles.photoClip}`}>
            <div className="kitty-photo-layer kitty-photo-original" aria-hidden={changedPhoto || undefined}><ArtworkImage slot="cats" alt="Chemi, Tashi, and Brave relaxing on a rug beside a sunny window" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" /></div>
            <div className="kitty-photo-layer kitty-photo-secret" aria-hidden={!changedPhoto}>
              {emptyPhoto ? <Image src={emptyPhoto} alt="A sunny window and cat tree, with two cats relaxing" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" onLoad={() => setSecretReady(true)} /> : <div className="empty-window-placeholder" role="img" aria-label="The cats have left. Zack’s empty-window photograph will go here."><span>Empty-window photo coming soon.</span></div>}
            </div>
            {!escaped && artworkEnabled("kitty-shadow") && <div className={styles.window} style={{ clipPath: `polygon(${windowArea.clip.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(",")})` }}>
              <button ref={bird} type="button" className={styles.shadow} data-state="rest" aria-label="Brave chased a shadow and got outside. Follow him?" style={{ "--shadow-size": "28px" } as CSSProperties}
                onPointerDown={event => {
                  if (event.button !== 0 || !event.isPrimary) return;
                  press.current = {id:event.pointerId,x:event.clientX,y:event.clientY};
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerUp={event => {
                  const start = press.current; press.current = null;
                  if (start?.id === event.pointerId && Math.hypot(event.clientX-start.x,event.clientY-start.y)<14) discover();
                }}
                onPointerCancel={() => { press.current = null; }}
                onClick={event => { if (event.detail === 0) discover(); }}><BirdShadow /></button>
            </div>}
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>{label}</figcaption>
      {escaped && <div className={styles.reveal}><Link ref={destination} href="/bebrave" className={`button ${styles.destination}`}>Go look for Brave?</Link></div>}
    </figure>
  </div>;
}
