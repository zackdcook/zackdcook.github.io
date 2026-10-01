"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import progress from "@/content/progress.json";
import { progressRatio } from "@/lib/validation";

const activeIndex = Math.max(0, progress.stages.findIndex(stage => stage.status === "active"));
const number = (value: number) => value.toLocaleString("en-US");

export function ProgressRings({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState(activeIndex);
  const [visible, setVisible] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const detailId = useId();
  const stage = progress.stages[selected];
  const percentage = Math.round(progressRatio(stage.value, stage.target) * 1000) / 10;
  const spacing = Math.min(27, 108 / progress.stages.length);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { threshold: .2 });
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const detail = stage.status === "planned"
    ? "One thing at a time. This stage is up next."
    : stage.status === "complete"
      ? `${number(stage.value)} ${stage.unit}. This part is in the bag.`
      : `${number(Math.max(0, (stage.target ?? 0) - stage.value))} ${stage.unit} to the finish line.`;
  return <div ref={container} className={`progress-display ${compact ? "compact" : ""} ${visible ? "rings-visible" : ""}`}>
    <div className="rings">
      <svg viewBox="0 0 320 320" aria-hidden="true">
        {Array.from({ length: 60 }, (_, index) => {
          const angle = index * Math.PI / 30;
          const inner = index % 5 === 0 ? 149 : 153;
          return <line key={index} x1={160 + Math.sin(angle) * inner} y1={160 - Math.cos(angle) * inner} x2={160 + Math.sin(angle) * 157} y2={160 - Math.cos(angle) * 157} stroke="currentColor" strokeOpacity={index % 5 === 0 ? .38 : .18} strokeWidth="1.2" />;
        })}
        {progress.stages.map((item, index) => {
          const radius = 137 - index * spacing;
          const ratio = progressRatio(item.value, item.target);
          const width = Math.min(15, spacing * .6);
          return <g key={item.id} className={`ring-layer ${selected === index ? "is-selected" : ""}`} style={{ "--ring-color": item.color, "--ring-offset": 100 * (1 - ratio), "--ring-delay": `${index * 140}ms` } as CSSProperties} onMouseEnter={() => setSelected(index)}>
            {item.status === "planned" ? Array.from({ length: 48 }, (_, tick) => {
              const angle = tick * Math.PI / 24;
              return <line key={tick} x1={160 + Math.sin(angle) * (radius - 4)} y1={160 - Math.cos(angle) * (radius - 4)} x2={160 + Math.sin(angle) * (radius + 4)} y2={160 - Math.cos(angle) * (radius + 4)} stroke={item.color} strokeWidth="2" strokeOpacity=".45" strokeLinecap="round" />;
            }) : <>
              <circle cx="160" cy="160" r={radius} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth={width} />
              <circle className="ring-fill" cx="160" cy="160" r={radius} pathLength="100" fill="none" stroke={item.color} strokeWidth={width} strokeLinecap="round" strokeDasharray="100 100" transform="rotate(-90 160 160)" />
            </>}
            <circle cx="160" cy="160" r={radius} fill="none" stroke="transparent" strokeWidth={spacing - 2} className="ring-hit" />
          </g>;
        })}
      </svg>
      <div className="ring-center" aria-hidden="true">
        <strong>{stage.status === "planned" ? "Next" : <>{percentage}<span>%</span></>}</strong>
        <span>{stage.label}</span>
        <small>{stage.status === "planned" ? "Still cooking" : `${number(stage.value)} ${stage.unit}`}</small>
      </div>
    </div>
    <div className="progress-details">
      <ol className="stage-list">{progress.stages.map((item, index) => <li key={item.id}>
        <button type="button" className="stage-button" aria-pressed={selected === index} aria-describedby={selected === index ? detailId : undefined} onClick={() => setSelected(index)} onFocus={() => setSelected(index)} onMouseEnter={() => setSelected(index)}>
          <span className="stage-dot" style={{ background: item.color }} aria-hidden="true" />
          <span><span className="stage-label">{item.label}{item.status === "complete" && <span aria-label="complete"> ✓</span>}</span>
            <span className="stage-count">{item.status === "planned" ? "Next up" : `${number(item.value)}${item.status === "active" && item.target ? ` / ${number(item.target)}` : ""} ${item.unit}`}</span>
          </span>
        </button>
        {item.target && <span className="sr-only" role="progressbar" aria-label={item.label} aria-valuemin={0} aria-valuemax={item.target} aria-valuenow={item.value} aria-valuetext={`${number(item.value)} of ${number(item.target)} ${item.unit}`} />}
      </li>)}</ol>
      <p className="ring-detail" id={detailId} aria-live="polite">{detail}</p>
      <p className="ring-hint">Hover a ring. Tap a stage.</p>
    </div>
  </div>;
}
