"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import progress from "@/content/progress.json";
import { displayDate } from "@/content/site";
import { progressRatio } from "@/lib/validation";
import styles from "./progress-rings.module.css";

const activeIndex = Math.max(0, progress.stages.findIndex(stage => stage.status === "active"));
const number = (value: number) => value.toLocaleString("en-US");

function StageLabel({ label }: { label: string }) {
  const ordinal = label.match(/^(\d+)(st|nd|rd|th)(.*)$/);
  return ordinal ? <>{ordinal[1]}<sup>{ordinal[2]}</sup>{ordinal[3]}</> : <>{label}</>;
}

function OrdinalText({ text }: { text: string }) {
  return <>{text.split(/(\b\d+(?:st|nd|rd|th)\b)/g).map((part, index) => {
    const ordinal = part.match(/^(\d+)(st|nd|rd|th)$/);
    return ordinal ? <span key={index}>{ordinal[1]}<sup>{ordinal[2]}</sup></span> : part;
  })}</>;
}

function toneFor(index: number) {
  if (index === 0) return "var(--progress-core)";
  const position = (index - 1) / Math.max(1, progress.stages.length - 2);
  return `color-mix(in srgb, var(--progress-hue) ${72 - position * 36}%, var(--progress-dark))`;
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
  const percentage = Math.round(progressRatio(stage.value, stage.target) * 100);
  const coreRadius = 61;
  const spacing = 85 / Math.max(1, progress.stages.length - 1);
  const width = Math.min(8, spacing * .28);
  const noteFor = (item: typeof stage) => item.note
    .replace("{target}", number(item.target ?? 0))
    .replace("{currentStep}", progress.stages[activeIndex].label);

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
    className={`progress-display ${styles.display} ${compact ? "compact" : ""} ${visible ? "rings-visible" : ""}`}
  >
    <div className="progress-details">
      <ol className="stage-list">{progress.stages.map((item, index) => <li key={item.id}>
        <button
          type="button"
          className="stage-button"
          aria-pressed={selected === index}
          aria-describedby={`${id}-note-${item.id}`}
          onClick={() => { setSelected(index); setHovered(null); }}
          onFocus={() => setFocused(index)}
          onBlur={() => setFocused(null)}
          onKeyDown={event => {
            if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const total = progress.stages.length;
            const next = event.key === "Home" ? 0 : event.key === "End" ? total - 1 :
              (index + (event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1) + total) % total;
            setSelected(next); setHovered(null);
            container.current?.querySelectorAll<HTMLButtonElement>(".stage-button")[next]?.focus();
          }}
          onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(index); }}
          onPointerLeave={() => setHovered(null)}
        >
          <span className="stage-dot" style={{ background: toneFor(index) }} aria-hidden="true" />
          <span><span className="stage-label"><StageLabel label={item.label} />{item.status === "complete" && <span aria-label="complete"> ✓</span>}</span>
            <span className="stage-count">{item.status === "planned" ? "Up next" : `${number(item.value)}${item.status === "active" && item.target ? ` / ${number(item.target)}` : ""} ${item.unit}`}</span>
          </span>
        </button>
        {item.target && <span className="sr-only" role="progressbar" aria-label={item.label} aria-valuemin={0} aria-valuemax={item.target} aria-valuenow={Math.min(item.value, item.target)} aria-valuetext={`${number(item.value)} of ${number(item.target)} ${item.unit}`} />}
      </li>)}</ol>
    </div>
    <div className="progress-chart"><div className="rings" data-material-surface="glass" onPointerLeave={() => setHovered(null)}>
      <svg viewBox="0 0 320 320" aria-hidden="true">
        <defs>{progress.stages.map((item, index) => {
          const tone = toneFor(index);
          return <linearGradient key={item.id} id={`${id}-tone-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={tone} />
            <stop offset="1" stopColor={index === 0 ? tone : `color-mix(in srgb, ${tone} 88%, var(--progress-dark))`} />
          </linearGradient>;
        })}</defs>
        {progress.stages.map((item, index) => {
          const radius = coreRadius + index * spacing;
          const ratio = progressRatio(item.value, item.target);
          return <g
            key={item.id}
            className={`ring-layer ${current === index ? "is-selected is-highlighted" : ""}`}
            style={{ "--ring-color": toneFor(index), "--ring-offset": 100 * (1 - ratio), "--ring-delay": `${index * 140}ms` } as CSSProperties}
            onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(index); }}
            onPointerLeave={() => setHovered(null)}
            onClick={() => { setSelected(index); setHovered(null); setFocused(null); }}
          >
            {index === 0 ? <circle className="core-fill" cx="160" cy="160" r={coreRadius} fill={`url(#${id}-tone-${index})`} /> : <>
              <circle cx="160" cy="160" r={radius} fill="none" stroke="var(--progress-track)" strokeWidth={width} />
              {item.status === "planned" ? <g className="ring-dots" fill={`url(#${id}-tone-${index})`}>{Array.from({ length: 40 }, (_, dot) => {
                const angle = dot * Math.PI * 2 / 40 - Math.PI / 2;
                // Fixed world geometry avoids Safari's dashed-stroke resampling
                // when a nearby :active control repaints. Positions never animate.
                return <circle key={dot} cx={Number((160 + radius * Math.cos(angle)).toFixed(3))} cy={Number((160 + radius * Math.sin(angle)).toFixed(3))} r="3.5" />;
              })}</g> :
                <circle className="ring-fill" cx="160" cy="160" r={radius} pathLength="100" fill="none" stroke={`url(#${id}-tone-${index})`} strokeWidth={width} strokeLinecap="round" strokeDasharray="100 100" transform="rotate(-90 160 160)" />}
            </>}
            {(index === 0 ? [coreRadius + 3] : [radius - width / 2 - 3, radius + width / 2 + 3]).map(edge => <circle
              key={edge}
              className="ring-highlight"
              cx="160"
              cy="160"
              r={edge}
              fill="none"
              stroke="var(--progress-dark)"
              strokeWidth="2.5"
            />)}
            <circle cx="160" cy="160" r={radius} fill={index === 0 ? "transparent" : "none"} stroke="transparent" strokeWidth={index === 0 ? 0 : Math.max(width + 10, spacing - 5)} className="ring-hit" />
          </g>;
        })}
        <g className="ring-center" textAnchor="middle" pointerEvents="none">
          <text className="ring-percentage" x="160" y="155">{percentage}<tspan className="ring-percent-sign">%</tspan></text>
          <text className="ring-stage-name" x="160" y="179">{(() => {
            const ordinal = stage.label.match(/^(\d+)(st|nd|rd|th)(.*)$/);
            return ordinal ? <>{ordinal[1]}<tspan baselineShift="super" fontSize="8">{ordinal[2]}</tspan>{ordinal[3]}</> : stage.label;
          })()}</text>
        </g>
      </svg>
    </div><p className="project-updated">Progress updated <time dateTime={progress.updated}>{displayDate(progress.updated)}</time></p></div>
    <div className="progress-note" aria-live="polite" aria-atomic="true">
      {progress.stages.map((item, index) => <div key={item.id} hidden={current !== index} aria-hidden={current !== index}>
        <h3><StageLabel label={item.label} /></h3>
        <p id={`${id}-note-${item.id}`}><OrdinalText text={noteFor(item)} /></p>
      </div>)}
    </div>
  </div>;
}
