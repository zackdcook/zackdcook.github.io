import type { Metadata } from "next";
import { upcomingEvents, writingGroup } from "@/content/site";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Meet Zack Cook at Write On, Lakeland! Every Thursday, 4–6 p.m., at Pressed Books & Coffee in downtown Lakeland, Florida.",
  alternates: { canonical: "/events" },
};

export default function Events() {
  const events = upcomingEvents();
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
      <section
        className="event-callout writing-group"
        aria-labelledby="writing-group-title"
      >
        <p className="eyebrow">A standing Thursday date</p>
        <h2 id="writing-group-title">{writingGroup.title}</h2>
        <p className="event-schedule">{writingGroup.schedule}</p>
        <p>
          {writingGroup.venue}
          <br />
          {writingGroup.location}
        </p>
        <p className="event-description">{writingGroup.description}</p>
        <div className="actions">
          <a
            className="button"
            href={writingGroup.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions
          </a>
          <a className="button" href={writingGroup.venueUrl} target="_blank" rel="noopener noreferrer">Pressed Books & Coffee</a>
        </div>
        <p className="event-address">{writingGroup.address}</p>
      </section>
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
