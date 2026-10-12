"use client";

import { useId, useRef, type ReactNode } from "react";

/** Native modal choices share one focus, backdrop, scrolling and button system. */
export function ChoiceDialog({ trigger, title, closeLabel, children, onOpen }: {
  trigger: ReactNode; title: string; closeLabel: string; children: ReactNode; onOpen?: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  return <>
    <button className="button" data-material-surface="glass" type="button" aria-haspopup="dialog" onClick={() => { onOpen?.(); dialog.current?.showModal(); }}>{trigger}</button>
    <dialog className="calendar-dialog" ref={dialog} aria-labelledby={heading} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.current?.close();
    }}>
      <div className="calendar-dialog-content">
        <div className="calendar-dialog-heading">
          <h2 id={heading} className="dialog-title" tabIndex={-1} autoFocus>{title}</h2>
          <button className="icon-button calendar-close dialog-close" type="button" aria-label={closeLabel} onClick={() => dialog.current?.close()}>×</button>
        </div>
        {children}
      </div>
    </dialog>
  </>;
}
