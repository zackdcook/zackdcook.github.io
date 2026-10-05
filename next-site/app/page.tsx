import Link from "next/link";
import Image from "next/image";
import { ActiveProject } from "@/components/active-project";
import { ShoutoutList } from "@/components/shoutout-list";
import { WritingGroupCard } from "@/components/writing-group-card";
import { CollectionHeading } from "@/components/collection-heading";
import { follyQuotes, latestFolly } from "@/content/folly";
import { QuoteLeaf } from "@/components/quote-leaf";
import { getShoutouts } from "@/lib/community";
import editorial from "@/content/editorial.json";
import { getUpcomingEvents } from "@/lib/site-events";
import { EditorialKitties } from "@/components/editorial-kitties";

export const metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [events, shoutouts] = await Promise.all([getUpcomingEvents(), getShoutouts()]);
  const event = events[0];
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">Engineer <span className="reaction-symbol">⇌</span> Author</p>
          <h1>Zack<br /> <em>Cook.</em></h1>
          <p className="hero-intro">{editorial.home.intro}</p>
          {editorial.home.paragraphs.map(paragraph => <p className="hero-detail" key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="hero-photo">
          <div className="portrait-frame tactile-photo">
            <Image
              src="/images/portrait.webp"
              alt="Zack Cook smiling in a black sweater"
              width={1200}
              height={1200}
              priority
              sizes="(max-width: 740px) 85vw, 40vw"
            />
          </div>
        </div>
      </section>

      <section id="creative-works" className="desk-section">
        <div className="shell"><ActiveProject detailsLink /></div>
      </section>

      <section id="find-me-at" className="events-section"><div className="shell">
        <WritingGroupCard><div className="rail-more"><Link className="button" href="/events">Other events</Link></div></WritingGroupCard>
      </div></section>
      {event && <section className="event-callout shell upcoming-callout">
        <p className="eyebrow">Also coming up</p><h2>{event.title}</h2><p>{event.location}</p>
        <Link className="button" href="/events">Event details</Link>
      </section>}

      <section id="about-me" className="bio-section section-space"><div className="life-section shell">
        <div className="life-copy">
          <h2 className="eyebrow section-label">BIO1990</h2>
          <h2>
            Who am I?
            <sub className="identity-aside">no really // plz help // idk who I am</sub>
          </h2>
          {editorial.home.aboutParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <Link className="button" href="/aboutme">
            A lil history
          </Link>
        </div>
        <EditorialKitties emptyPhoto={editorial.home.emptyCatPhoto} label={editorial.home.editorialLabel} />
      </div></section>

      <section id="words-of-folly" className="journal-feature section-space"><div className="shell folly-panel">
        <div className="section-heading"><div className="life-copy">
          <CollectionHeading>Words of Folly</CollectionHeading>
          <h2>Note to self:</h2>
        </div></div>
        <div className="folly-latest" role="img" aria-label={latestFolly.text}>
          <QuoteLeaf quote={latestFolly} index={follyQuotes.length - 1} />
        </div>
        <div className="rail-more"><Link className="button button-outline" href="/journal">The whole pile</Link></div>
      </div></section>

      <section id="shoutouts" className="shoutouts-section section-space"><div className="shell">
        <CollectionHeading>Cool peeps</CollectionHeading>
        <ShoutoutList people={shoutouts.slice(0, 3)} />
        <div className="rail-more"><Link className="button" href="/shoutouts">Other shoutouts</Link></div>
      </div></section>
      {process.env.NEXT_PUBLIC_SUBSCRIBE_URL && (
        <section className="subscribe-callout shell">
          <h2>Keep in touch.</h2>
          <p>Occasional blurbs from my noggin to your feed.</p>
          <a className="button" href={process.env.NEXT_PUBLIC_SUBSCRIBE_URL}>
            Get writing updates
          </a>
        </section>
      )}
    </>
  );
}
