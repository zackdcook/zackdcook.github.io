"use client";

import { useState } from "react";
import { CalendarIcon } from "@/components/icons";
import { ChoiceDialog } from "@/components/choice-dialog";
import { googleWritingGroupUrl, writingGroupCalendarPath } from "@/lib/calendar";
import { writingGroup } from "@/content/site";

export function CalendarMenu() {
  const [googleUrl, setGoogleUrl] = useState<string>();
  return <>
    <ChoiceDialog trigger={<><CalendarIcon />Add to calendar</>} title="Write it in." closeLabel="Close calendar choices" onOpen={() => setGoogleUrl(googleWritingGroupUrl())}>
      <p className="calendar-event-title">{writingGroup.title}</p>
      <p>{writingGroup.schedule}</p>
      <div className="calendar-options">
        <a className="button" href={writingGroupCalendarPath}>Apple Calendar</a>
        <a className="button" href={googleUrl} target="_blank" rel="noopener noreferrer">Google Calendar</a>
        <a className="button" href={writingGroupCalendarPath} download="write-on-lakeland.ics">Outlook & other calendars</a>
      </div>
    </ChoiceDialog>
    <noscript><a className="text-link" href={writingGroupCalendarPath}>Download calendar event</a></noscript>
  </>;
}
