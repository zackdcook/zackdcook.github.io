"use client";

import { useEffect } from "react";

/**
 * Adds a slow, scarf-like ambient billow to the Kitty Committee ribbon.
 * The ribbon's own drag/drop physics still owns its actual shape.
 *
 * Scroll input is treated as a breeze, not as an animation trigger:
 * velocity is smoothed, allowed to decay, and converted into one continuous
 * low-frequency transform. This avoids the rapid restart/jitter that iOS
 * produced with the previous Web Animations implementation.
 */
export function KittyRibbonBillow() {
  useEffect(() => {
    let frame = 0;
    let lastTime = performance.now();
    let lastScrollY = window.scrollY;
    let breeze = 0;
    let phase = 0;

    const reduced = () =>
      document.documentElement.dataset.effects === "reduced" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = (now: number) => {
      const svg = document.querySelector<SVGSVGElement>(".kitty-ribbon svg");
      const dt = Math.min(40, Math.max(1, now - lastTime));
      lastTime = now;

      if (!svg || reduced()) {
        if (svg) svg.style.removeProperty("transform");
        breeze *= Math.pow(0.88, dt / 16.67);
      } else {
        // A very slow cloth wave. Scroll only adds energy/direction.
        phase += dt * 0.00115;
        breeze *= Math.pow(0.965, dt / 16.67);

        const idle = Math.sin(phase) * 0.16;
        const wave = Math.sin(phase * 1.07) * (0.35 + Math.abs(breeze) * 0.42);
        const counter = Math.sin(phase * 0.63 + 1.4) * (0.22 + Math.abs(breeze) * 0.24);
        const direction = Math.max(-1, Math.min(1, breeze));

        const rotate = idle + wave + direction * 0.34;
        const skew = counter + direction * 0.46;
        const lift = Math.sin(phase * 0.82) * 0.7 - Math.abs(direction) * 0.8;

        svg.style.transform =
          `perspective(1000px) rotateX(${rotate.toFixed(3)}deg) ` +
          `rotateY(${(-rotate * 0.58).toFixed(3)}deg) ` +
          `skewY(${skew.toFixed(3)}deg) translateY(${lift.toFixed(3)}px)`;
        svg.style.transformOrigin = "50% 72%";
        svg.style.willChange = "transform";
      }

      frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      const nextY = window.scrollY;
      const delta = Math.max(-28, Math.min(28, nextY - lastScrollY));
      lastScrollY = nextY;

      // Low-pass the impulse instead of restarting an animation.
      const impulse = delta / 28;
      breeze = breeze * 0.82 + impulse * 0.18;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      const svg = document.querySelector<SVGSVGElement>(".kitty-ribbon svg");
      if (svg) {
        svg.style.removeProperty("transform");
        svg.style.removeProperty("transform-origin");
        svg.style.removeProperty("will-change");
      }
    };
  }, []);

  return null;
}
