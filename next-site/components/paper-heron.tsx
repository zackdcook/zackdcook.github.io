/** An original paper-fold heron: engineering geometry meets a Florida field sketch. */
export function PaperHeron() {
  return <svg viewBox="0 0 500 560" aria-hidden="true" focusable="false">
    <g fill="none" stroke="var(--color-brass)" strokeWidth="1" opacity=".55">
      <circle cx="250" cy="266" r="206"/><circle cx="250" cy="266" r="219" strokeDasharray="1 14"/>
      <path d="M250 30v37m0 400v38M10 266h44m392 0h44M86 104l17 18m294 289 19 17"/>
      <path d="M66 453q171-28 367 0M96 468q127-14 271 0M143 483h203"/>
    </g>
    <g fill="var(--color-foliage)" opacity=".75">
      <path d="M101 454c-2-47-19-82-43-100 9 31 22 52 30 73-27-28-42-34-66-38 21 25 50 45 68 53-3-57 13-85 31-101 1 42-12 72-20 113z"/>
      <path d="M414 454c-1-72 16-115 41-143-8 47-23 75-33 106 23-29 42-50 68-54-20 29-49 47-66 61 1-57-16-89-33-100 3 49 18 85 23 130z"/>
    </g>
    <g stroke="var(--color-ink)" strokeWidth="1.3" strokeLinejoin="round">
      <path d="m171 223 154 73-91 65-113-74z" fill="var(--color-surface)"/>
      <path d="m171 223 77 92-127-28z" fill="var(--color-surface-alt)"/>
      <path d="m248 315 77-19-91 65z" fill="var(--color-accent-soft)"/>
      <path d="m171 223 139 48-43-115 37-55-24-24-49 83 36 145z" fill="var(--color-surface)"/>
      <path d="m310 271-43-115 14-54 23-1-20 56z" fill="var(--color-surface-alt)"/>
      <path d="m280 77 24 24 70 25-56-4z" fill="var(--color-brass)"/>
      <path d="m234 361 9 75m4-83 30 57-12 26m-26 0h27m-27 1-18 12m44-13 20 12" fill="none" strokeWidth="2"/>
    </g>
    <circle cx="295" cy="103" r="2.5" fill="var(--color-ink)"/>
    <g fill="none" stroke="var(--color-accent)" strokeWidth="1.2" opacity=".6"><path d="m150 212 94 15m-105 21 39 14m84-149 17-28"/><path d="M211 323q10 15 24 14"/></g>
    <g fill="var(--color-brass)"><circle cx="396" cy="194" r="2"/><circle cx="384" cy="178" r="1.5"/><path d="m108 142 3-7 3 7 7 3-7 3-3 7-3-7-7-3z"/></g>
  </svg>;
}
