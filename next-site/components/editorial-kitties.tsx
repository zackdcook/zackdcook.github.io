"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { usePreferences } from "./site-preferences";
import { Artwork, ArtworkImage } from "./artwork";
import { artworkEnabled } from "@/lib/art-assets";
import { kittyWindows, shadowFlight } from "@/lib/kitty-shadows";
import styles from "./editorial-kitties.module.css";

const question = "Brave chased a shadow and got outside. Follow him?";

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
  const [escaped, setEscaped] = useState(false), [secretReady, setSecretReady] = useState(!emptyPhoto), [open, setOpen] = useState(false);
  const photograph = useRef<HTMLDivElement>(null), bird = useRef<HTMLButtonElement>(null), dialog = useRef<HTMLDialogElement>(null);
  const flight = useRef<Animation | null>(null), resumeFlight = useRef<() => void>(() => {});
  const id = useId(), changedPhoto = escaped && secretReady, windowArea = kittyWindows[changedPhoto ? "escaped" : "original"];

  useEffect(() => {
    const photo = photograph.current, target = bird.current;
    if (!photo || !target) return;
    let active = false, disposed = false, timer: ReturnType<typeof setTimeout> | undefined;
    const coordinates = (point: number[]) => `translate3d(${point[0] * photo.clientWidth - 22}px,${point[1] * photo.clientHeight - 22}px,0)`;
    function rest() {
      flight.current?.cancel(); flight.current = null;
      target!.style.transform = coordinates(windowArea.rest);
      target!.dataset.state = "rest";
    }
    function stop() { clearTimeout(timer); rest(); }
    function schedule(delay: number) { clearTimeout(timer); if (active && !disposed && !document.hidden && !reduced && !open) timer = setTimeout(fly, delay); }
    function fly() {
      if (!active || document.hidden || disposed || open || reduced) return;
      if (document.activeElement === target || target!.matches(":hover")) { schedule(1000); return; }
      const path = shadowFlight(changedPhoto);
      target!.style.setProperty("--shadow-size", `${path.size}px`);
      target!.style.setProperty("--shadow-direction", path.reverse ? "-1" : "1");
      target!.dataset.state = "flying";
      const from = coordinates(path.from), to = coordinates(path.to);
      const animation = target!.animate([{ transform: from, opacity: .08 }, { opacity: .64, offset: .15 }, { opacity: .64, offset: .85 }, { transform: to, opacity: .08 }], { duration: path.duration, fill: "forwards", easing: "linear" });
      flight.current = animation;
      animation.onfinish = () => { if (disposed) return; rest(); schedule(path.delay); };
    }
    resumeFlight.current = () => { if (document.activeElement === target || !active || open) return; if (flight.current?.playState === "paused") flight.current.play(); else schedule(1800); };
    const observer = new IntersectionObserver(([entry]) => { active = entry.isIntersecting; if (active) schedule(1200 + Math.random() * 1800); else stop(); }, { threshold: .25 });
    const resize = new ResizeObserver(() => { rest(); schedule(1600); });
    const visibility = () => { if (document.hidden) stop(); else schedule(1600); };
    rest(); observer.observe(photo); resize.observe(photo); document.addEventListener("visibilitychange", visibility);
    return () => { disposed = true; stop(); observer.disconnect(); resize.disconnect(); document.removeEventListener("visibilitychange", visibility); resumeFlight.current = () => {}; };
  }, [changedPhoto, reduced, open, windowArea]);

  function discover() {
    flight.current?.pause(); setEscaped(true); setOpen(true); dialog.current?.showModal();
  }
  function close() { dialog.current?.close(); }

  return <div className={`kitty-discovery ${styles.discovery}`}>
    <figure className={styles.figure}>
      <div className="life-photo">
        <div className={`tactile-photo kitty-photo ${styles.photo}`} data-material-surface="glass" data-escaped={changedPhoto ? "true" : undefined}>
          <div ref={photograph} className={`photo-clip ${styles.photoClip}`}>
            <div className="kitty-photo-layer kitty-photo-original" aria-hidden={changedPhoto || undefined}><ArtworkImage slot="cats" alt="Chemi, Tashi, and Brave relaxing on a rug beside a sunny window" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" /></div>
            <div className="kitty-photo-layer kitty-photo-secret" aria-hidden={!changedPhoto}>
              {emptyPhoto ? <Image src={emptyPhoto} alt="A sunny window and cat tree, with two cats relaxing" width={1400} height={1034} sizes="(max-width:740px) 90vw,48vw" onLoad={() => setSecretReady(true)} /> : <div className="empty-window-placeholder" role="img" aria-label="The cats have left. Zack’s empty-window photograph will go here."><span>Empty-window photo coming soon.</span></div>}
            </div>
            {artworkEnabled("kitty-shadow") && <div className={styles.window} style={{ clipPath: `polygon(${windowArea.clip.map(([x, y]) => `${x * 100}% ${y * 100}%`).join(",")})` }}>
              <button ref={bird} type="button" className={styles.shadow} data-state="rest" aria-label={question} aria-haspopup="dialog" aria-controls={`${id}-secret`} style={{ "--shadow-size": "28px" } as CSSProperties}
                onClick={discover} onPointerEnter={() => flight.current?.pause()} onPointerLeave={() => resumeFlight.current()} onPointerDown={() => flight.current?.pause()} onFocus={() => flight.current?.pause()} onBlur={() => resumeFlight.current()}><BirdShadow /></button>
            </div>}
          </div>
        </div>
      </div>
      <figcaption className={styles.caption}>{label}</figcaption>
    </figure>
    <dialog ref={dialog} id={`${id}-secret`} className={`calendar-dialog ${styles.secret}`} aria-labelledby={`${id}-question`} onClose={() => { setOpen(false); bird.current?.focus({ preventScroll: true }); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="calendar-dialog-content"><p id={`${id}-question`}>Brave chased a shadow and got outside. Follow him?</p><div className={`actions ${styles.choices}`}><Link href="/bebrave" className="button" onClick={close}>Yes</Link><button className="button" onClick={close}>No</button></div></div>
    </dialog>
  </div>;
}
