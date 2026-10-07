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
    <button className="button" type="button" aria-haspopup="dialog" onClick={open}><CalendarIcon />Add to calendar</button>
    <dialog
      className="calendar-dialog"
      ref={dialog}
      aria-labelledby={heading}
      onClick={event => { if (event.target === event.currentTarget) close(); }}
    >
      <div className="calendar-dialog-content">
        <div className="calendar-dialog-heading">
          <h2 id={heading}>Write it in.</h2>
          <button className="button button-small calendar-close dialog-close" type="button" aria-label="Close calendar choices" onClick={close}>×</button>
        </div>
        <p className="calendar-event-title">{writingGroup.title}</p>
        <p>{writingGroup.schedule}</p>
        <p className="calendar-help">Choose your calendar, then save or import the weekly series.</p>
        <div className="calendar-options">
          <a className="button" href={googleUrl} target="_blank" rel="noopener noreferrer">Google Calendar</a>
          <a className="button" href={writingGroupCalendarPath}>Apple Calendar</a>
          <a className="button" href={writingGroupCalendarPath} download="write-on-lakeland.ics">Outlook & other calendars</a>
        </div>
        <p className="calendar-help">For a downloaded file, open it in your calendar app. Google on mobile may need the calendar file too.</p>
      </div>
    </dialog>
    <noscript><a className="button" href={writingGroupCalendarPath}>Download calendar event</a></noscript>
  </>;
}
