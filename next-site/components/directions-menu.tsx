"use client";

import { MapIcon } from "@/components/icons";
import { ChoiceDialog } from "@/components/choice-dialog";
import { writingGroup } from "@/content/site";

export function DirectionsMenu() {
  const apple = `https://maps.apple.com/?daddr=${encodeURIComponent(writingGroup.address)}`;
  return <>
    <ChoiceDialog trigger={<><MapIcon />Get directions</>} title="Get directions" closeLabel="Close map choices">
      <p className="calendar-event-title">{writingGroup.venue}</p>
      <p>{writingGroup.address}</p>
      <div className="calendar-options">
        <a className="button" href={apple} target="_blank" rel="noopener noreferrer">Apple Maps</a>
        <a className="button" href={writingGroup.directionsUrl} target="_blank" rel="noopener noreferrer">Google Maps</a>
      </div>
    </ChoiceDialog>
    <noscript><a className="button" href={writingGroup.directionsUrl}>Get directions</a></noscript>
  </>;
}
