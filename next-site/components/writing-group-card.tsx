import { MapIcon } from "@/components/icons";
import { CalendarMenu } from "@/components/calendar-menu";
import { writingGroup } from "@/content/site";

export function WritingGroupCard({ eyebrow = "Find me at…" }: { eyebrow?: string }) {
  return <section className="event-callout writing-group" aria-labelledby="writing-group-title">
    <h2 className="eyebrow section-label">{eyebrow}</h2>
    <h2 id="writing-group-title">{writingGroup.title}</h2>
    <p className="event-schedule">{writingGroup.schedule}</p>
    <p>{writingGroup.venue} · Downtown Lakeland</p>
    <p className="event-address">{writingGroup.address}</p>
    <div className="actions event-actions">
      <a className="button" href={writingGroup.directionsUrl} target="_blank" rel="noopener noreferrer"><MapIcon />Get directions</a>
      <CalendarMenu />
    </div>
    <p className="event-description">{writingGroup.description}</p>
  </section>;
}
