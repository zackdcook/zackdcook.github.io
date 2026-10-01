import progress from "@/content/progress.json";
import { progressRatio } from "@/lib/validation";

export function ProgressRings({ compact = false }: { compact?: boolean }) {
  const active =
    progress.stages.find((stage) => stage.status === "active") ??
    progress.stages[0];
  const percentage = Math.round(
    progressRatio(active.value, active.target) * 100,
  );
  const spacing = Math.min(27, 108 / progress.stages.length);
  return (
    <div className={`progress-display ${compact ? "compact" : ""}`}>
      <div className="rings" aria-hidden="true">
        <svg viewBox="0 0 320 320">
          {progress.stages.map((stage, index) => {
            const radius = 137 - index * spacing;
            const circumference = 2 * Math.PI * radius;
            const fraction = progressRatio(stage.value, stage.target);
            return (
              <g key={stage.id} transform="rotate(-90 160 160)">
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity=".12"
                  strokeWidth={Math.min(17, spacing * 0.65)}
                  strokeDasharray={
                    stage.status === "planned" ? "3 9" : undefined
                  }
                />
                {fraction > 0 && (
                  <circle
                    cx="160"
                    cy="160"
                    r={radius}
                    fill="none"
                    stroke={stage.color}
                    strokeWidth={Math.min(17, spacing * 0.65)}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference * fraction} ${circumference}`}
                  />
                )}
              </g>
            );
          })}
        </svg>
        <div className="ring-center">
          <strong>
            {percentage}
            <span>%</span>
          </strong>
          <span>{active.label}</span>
        </div>
      </div>
      <ol className="stage-list">
        {progress.stages.map((stage) => (
          <li key={stage.id}>
            <span
              className="stage-dot"
              style={{ background: stage.color }}
              aria-hidden="true"
            />
            <div
              {...(stage.target
                ? {
                    role: "progressbar",
                    "aria-label": stage.label,
                    "aria-valuemin": 0,
                    "aria-valuemax": stage.target,
                    "aria-valuenow": stage.value,
                    "aria-valuetext": `${stage.value.toLocaleString("en-US")} of ${stage.target.toLocaleString("en-US")} ${stage.unit}`,
                  }
                : {})}
            >
              <span className="stage-label">
                {stage.label}{" "}
                {stage.status === "complete" && (
                  <span aria-label="complete">✓</span>
                )}
              </span>
              <span className="stage-count">
                {stage.status === "planned"
                  ? "Next up"
                  : `${stage.value.toLocaleString("en-US")}${stage.status === "active" && stage.target ? ` / ${stage.target.toLocaleString("en-US")}` : ""} ${stage.unit}`}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
