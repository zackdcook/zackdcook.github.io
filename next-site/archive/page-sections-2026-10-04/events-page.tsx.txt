import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { getUpcomingEvents } from "@/lib/site-events";
import { WritingGroupCard } from "@/components/writing-group-card";

export const metadata: Metadata = pageMetadata("events", "Events");

export default async function Events() {
  const events = await getUpcomingEvents();
  return (
    <div className="shell page-wrap">
      <div className="page-intro">
        <p className="eyebrow">Out in the world</p>
        <h1>
          Find
          <br />
          <em>me at…</em>
        </h1>
        <p>Readings, gatherings, and a chance to say hello.</p>
      </div>
      <WritingGroupCard eyebrow="A standing Thursday date" />
      <section id="other-events" aria-labelledby="other-events-heading" className="other-events-section">
      <h2 id="other-events-heading">Other events</h2>
      {events.length ? (
        events.map((event) => (
          <article className="event-callout" key={event.starts + event.title}>
            <p className="eyebrow">
              <time dateTime={event.starts}>
                {new Date(event.starts).toLocaleDateString("en-US", {
                  timeZone: "America/New_York",
                  dateStyle: "long",
                })}
              </time>
            </p>
            <h2>{event.title}</h2>
            <p>{event.location}</p>
            {event.url && (
              <a className="button" href={event.url}>
                Event details
              </a>
            )}
          </article>
        ))
      ) : (
        <div className="empty-note">
          <p>
            Readings and other events will go here when dates are set. In the
            meantime, you can find me with the writing group on Thursdays.
          </p>
        </div>
      )}
      </section>
    </div>
  );
}
