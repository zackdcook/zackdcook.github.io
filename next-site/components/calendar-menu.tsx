"use client";

import { useId, useRef, useState } from "react";
import { CalendarIcon } from "@/components/icons";
import { googleWritingGroupUrl, writingGroupCalendarPath } from "@/lib/calendar";
import { writingGroup } from "@/content/site";

export function CalendarMenu() {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const [googleUrl, setGoogleUrl] = useState<string>();
  const open = () => {
    setGoogleUrl(googleWritingGroupUrl());
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  return <>
    <button className="text-link" data-material-surface="glass" type="button" aria-haspopup="dialog" onClick={open}><CalendarIcon />Add to calendar</button>
    <dialog
      className="calendar-dialog"
      ref={dialog}
      aria-labelledby={heading}
      onClick={event => { if (event.target === event.currentTarget) close(); }}
    >
      <div className="calendar-dialog-content">
        <div className="calendar-dialog-heading">
          <h2 id={heading} className="dialog-title" tabIndex={-1} autoFocus>Write it in.</h2>
          <button className="icon-button calendar-close dialog-close" data-material-surface="glass" type="button" aria-label="Close calendar choices" onClick={close}>×</button>
        </div>
        <p className="calendar-event-title">{writingGroup.title}</p>
        <p>{writingGroup.schedule}</p>
        <div className="calendar-options">
          <a className="text-link" href={googleUrl} target="_blank" rel="noopener noreferrer">Google Calendar</a>
          <a className="text-link" href={writingGroupCalendarPath}>Apple Calendar</a>
          <a className="text-link" href={writingGroupCalendarPath} download="write-on-lakeland.ics">Outlook & other calendars</a>
        </div>
      </div>
    </dialog>
    <noscript><a className="text-link" href={writingGroupCalendarPath}>Download calendar event</a></noscript>
  </>;
}
