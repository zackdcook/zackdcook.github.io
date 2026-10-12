"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePreferences } from "./site-preferences";
import { Artwork, ArtworkImage } from "./artwork";
import { artworkEnabled } from "@/lib/art-assets";
import { kittyWindows, shadowFlight, braveDiscoveryKey } from "@/lib/kitty-shadows";
import { BraveDiscoveryDialogue } from "./brave-discovery-dialogue";
import styles from "./editorial-kitties.module.css";

function BirdShadow({ reduced }: { reduced: boolean }) {
  return <Artwork slot="kitty-shadow" className={styles.shadowArt}>
    <Image src={reduced ? "/artwork/kitty-shadow-still.png" : "/artwork/kitty-shadow-flight.gif"} alt="" width={200} height={153} unoptimized aria-hidden="true" />
  </Artwork>;
}

export function EditorialKitties({ emptyPhoto, label = "Editorial kitty committee aka firing squad" }: { emptyPhoto?: string | null; label?: string }) {
  const { reduced } = usePreferences();
  const [escaped, setEscaped] = useState(false), [secretReady, setSecretReady] = useState(!emptyPhoto);
  const photograph = useRef<HTMLDivElement>(null), birds = useRef<(HTMLButtonElement|null)[]>([]), destination = useRef<HTMLAnchorElement>(null);
  const flights = useRef<Animation[]>([]), focusDestination = useRef(false);
  const press = useRef<{id:number;x:number;y:number}|null>(null);
  const changedPhoto = escaped && secretReady, windowArea = kittyWindows.original;

  // A discovery stays available through refreshes and return visits. Storage
  // restrictions only affect persistence, never the current interaction.
  useEffect(() => {
    try { if (localStorage.getItem(braveDiscoveryKey) === "true") setEscaped(true); } catch {}
    const sync = (event: StorageEvent) => { if (event.key === braveDiscoveryKey && event.newValue === "true") setEscaped(true); };
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
    const photo = photograph.current, targets = birds.current.filter((bird):bird is HTMLButtonElement=>Boolean(bird));
    if (!photo || !targets.length || escaped) return;
    let active = false, disposed = false;
    const timers: (ReturnType<typeof setTimeout> | undefined)[] = [];
    const coordinates = (point: number[], target:HTMLButtonElement) => `translate3d(${point[0] * photo.clientWidth - target.clientWidth / 2}px,${point[1] * photo.clientHeight - target.clientHeight / 2}px,0)`;
    function rest() {
      for (const animation of flights.current) animation?.cancel();
      flights.current = [];
      for (const target of targets) {
        target.style.transform = coordinates(windowArea.rest,target);
        target.dataset.state = "rest";
      }
    }
    function stop() { timers.forEach(clearTimeout); rest(); }
    function schedule(index: number, delay: number) {
      clearTimeout(timers[index]);
      if (active && !disposed && !document.hidden && !reduced) timers[index] = setTimeout(() => fly(index), delay);
    }
    function resume() { targets.forEach((_, index) => schedule(index, 600 + Math.random() * 3000 + index * 1600)); }
    function fly(index: number) {
      if (!active || document.hidden || disposed || reduced) return;
      const target = targets[index], path = shadowFlight();
      flights.current[index]?.cancel();
        target.style.setProperty("--shadow-size", `${path.size}px`);
        target.dataset.state = "flying";
      const animation = target.animate([{ transform: coordinates(path.from,target), opacity: 0 }, { opacity: .62, offset: .12 }, { opacity: .62, offset: .88 }, { transform: coordinates(path.to,target), opacity: 0 }], { duration: path.duration, fill:"both", easing:"linear" });
      flights.current[index] = animation;
      // Three independent bounded tracks overlap naturally. Every completion
      // schedules another crossing; no finite batch or frame-by-frame state.
      animation.onfinish = () => {
        if (disposed) return;
        animation.cancel(); target.style.transform = coordinates(windowArea.rest, target); target.dataset.state = "rest";
        schedule(index, path.delay);
      };
    }
    const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; if (active) resume(); else stop(); }, { threshold: .05 });
    const resize = new ResizeObserver(() => { stop(); resume(); });
    const visibility = () => { if (document.hidden) stop(); else resume(); };
    rest(); observer.observe(photo); resize.observe(photo); document.addEventListener("visibilitychange", visibility);
    return () => { disposed = true; stop(); observer.disconnect(); resize.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [escaped, reduced, windowArea]);

  function discover() {
    for (const animation of flights.current) animation?.cancel();
    focusDestination.current = true; setEscaped(true);
    try { localStorage.setItem(braveDiscoveryKey, "true"); } catch {}
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
              {[0,1,2].map(index=><button key={index} ref={element=>{birds.current[index]=element;}} tabIndex={index ? -1 : 0} type="button" className={styles.shadow} data-state="rest" aria-label="Brave chased a shadow and got outside. Follow him?" style={{ "--shadow-size": "28px" } as CSSProperties}
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
                onClick={event => { if (event.detail === 0) discover(); }}><BirdShadow reduced={reduced} /></button>)}
            </div>}
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>{label}</figcaption>
      {escaped && <BraveDiscoveryDialogue destinationRef={destination}/>}
    </figure>
  </div>;
}
