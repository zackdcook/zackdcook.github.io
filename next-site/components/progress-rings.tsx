"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import progress from "@/content/progress.json";
import { progressRatio } from "@/lib/validation";

const activeIndex = Math.max(0, progress.stages.findIndex(stage => stage.status === "active"));
const number = (value: number) => value.toLocaleString("en-US");

function StageLabel({ label }: { label: string }) {
  const ordinal = label.match(/^(\d+)(st|nd|rd|th)(.*)$/);
  return ordinal ? <>{ordinal[1]}<sup>{ordinal[2]}</sup>{ordinal[3]}</> : <>{label}</>;
}

function toneFor(index: number) {
  if (index === 0) return "color-mix(in srgb, var(--progress-hue) 18%, var(--paper))";
  const position = (index - 1) / Math.max(1, progress.stages.length - 2);
  return `color-mix(in srgb, var(--progress-hue) ${72 - position * 36}%, var(--ink))`;
}

export function ProgressRings({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState(activeIndex);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const preview = hovered ?? focused;
  const current = preview ?? selected;
  const stage = progress.stages[current];
  const percentage = Math.round(progressRatio(stage.value, stage.target) * 1000) / 10;
  const coreRadius = 61;
  const spacing = 85 / Math.max(1, progress.stages.length - 1);
  const width = Math.min(20, spacing * .58);
  const noteFor = (item: typeof stage) => item.note.replace("{target}", number(item.target ?? 0));

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: .2 });
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  return <div
    ref={container}
    className={`progress-display ${compact ? "compact" : ""} ${visible ? "rings-visible" : ""}`}
    style={{ "--progress-hue": progress.ringColor } as CSSProperties}
  >
    <div className="rings" onPointerLeave={() => setHovered(null)}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        <defs>{progress.stages.map((item, index) => {
          const tone = toneFor(index);
          return <linearGradient key={item.id} id={`${id}-tone-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={tone} />
            <stop offset="1" stopColor={`color-mix(in srgb, ${tone} 88%, var(--ink))`} />
          </linearGradient>;
        })}</defs>
        {progress.stages.map((item, index) => {
          const radius = coreRadius + index * spacing;
          const ratio = progressRatio(item.value, item.target);
          return <g
            key={item.id}
            className={`ring-layer ${current === index ? "is-selected" : ""}`}
            style={{ "--ring-color": toneFor(index), "--ring-offset": 100 * (1 - ratio), "--ring-delay": `${index * 140}ms` } as CSSProperties}
            onPointerEnter={() => setHovered(index)}
          >
            {index === 0 ? <circle className="core-fill" cx="160" cy="160" r={coreRadius} fill={`url(#${id}-tone-${index})`} /> : <>
              <circle cx="160" cy="160" r={radius} fill="none" stroke="var(--ink)" strokeOpacity=".1" strokeWidth={width} />
              {item.status === "planned" ? <circle cx="160" cy="160" r={radius} pathLength="100" fill="none" stroke={`url(#${id}-tone-${index})`} strokeWidth={Math.min(7, width)} strokeDasharray="1 4" strokeLinecap="round" /> :
                <circle className="ring-fill" cx="160" cy="160" r={radius} pathLength="100" fill="none" stroke={`url(#${id}-tone-${index})`} strokeWidth={width} strokeLinecap="round" strokeDasharray="100 100" transform="rotate(-90 160 160)" />}
            </>}
            <circle cx="160" cy="160" r={radius} fill={index === 0 ? "transparent" : "none"} stroke="transparent" strokeWidth={index === 0 ? 0 : Math.max(width + 10, spacing - 5)} className="ring-hit" />
          </g>;
        })}
      </svg>
      <div className="ring-center" aria-hidden="true">
        <strong>{percentage}<span>%</span></strong>
        <span><StageLabel label={stage.label} /></span>
        <small>{stage.status === "planned" ? "Up next" : `${number(stage.value)} ${stage.unit}`}</small>
      </div>
    </div>
    <div className="progress-details">
      <ol className="stage-list">{progress.stages.map((item, index) => <li key={item.id} className={preview === index ? "is-previewing" : undefined}>
        <button
          type="button"
          className="stage-button"
          aria-pressed={current === index}
          aria-describedby={`${id}-note-${item.id}`}
          onClick={() => setSelected(index)}
          onFocus={() => setFocused(index)}
          onBlur={() => setFocused(null)}
          onPointerEnter={() => setHovered(index)}
          onPointerLeave={() => setHovered(null)}
        >
          <span className="stage-dot" style={{ background: toneFor(index) }} aria-hidden="true" />
          <span><span className="stage-label"><StageLabel label={item.label} />{item.status === "complete" && <span aria-label="complete"> ✓</span>}</span>
            <span className="stage-count">{item.status === "planned" ? `${Math.round(progressRatio(item.value, item.target) * 1000) / 10}%` : `${number(item.value)}${item.status === "active" && item.target ? ` / ${number(item.target)}` : ""} ${item.unit}`}</span>
          </span>
        </button>
        <p className="stage-note" id={`${id}-note-${item.id}`} role={preview === index ? "tooltip" : undefined}>{noteFor(item)}</p>
        {item.target && <span className="sr-only" role="progressbar" aria-label={item.label} aria-valuemin={0} aria-valuemax={item.target} aria-valuenow={Math.min(item.value, item.target)} aria-valuetext={`${number(item.value)} of ${number(item.target)} ${item.unit}`} />}
      </li>)}</ol>
    </div>
  </div>;
}
