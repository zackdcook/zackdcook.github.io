import Link from "next/link";
import { FieldJournalHero } from "@/components/field-journal-hero";
import { ActiveProject } from "@/components/active-project";
import { ShoutoutList } from "@/components/shoutout-list";
import { WritingGroupCard } from "@/components/writing-group-card";
import { CollectionHeading } from "@/components/collection-heading";
import { follyQuotes, latestFolly } from "@/content/folly";
import { QuoteLeaf } from "@/components/quote-leaf";
import { getShoutouts } from "@/lib/shoutouts";
import editorial from "@/content/editorial.json";
import { getUpcomingEvents } from "@/lib/site-events";
import { EditorialKitties } from "@/components/editorial-kitties";
import { StudioArtwork } from "@/components/studio-artwork";
import styles from "./home.module.css";

export const metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [events, shoutouts] = await Promise.all([getUpcomingEvents(), getShoutouts()]);
  const event = events[0];
  return <div className={styles.world}>
    <FieldJournalHero />
    <section id="creative-works" className={`desk-section ${styles.manuscript}`}>
      <div className="shell"><ActiveProject detailsLink /></div>
    </section>
    <section id="find-me-at" className={`events-section ${styles.events}`}><div className="shell">
      <WritingGroupCard><div className="rail-more"><Link className="button" href="/events">Other events</Link></div></WritingGroupCard>
    </div></section>
    {event && <section className="event-callout shell upcoming-callout">
      <p className="eyebrow">Also coming up</p><h2>{event.title}</h2><p>{event.location}</p>
      <Link className="button" href="/events">Event details</Link>
    </section>}
    <section id="about-me" className={`bio-section ${styles.biography}`}>
      <div className="life-section shell">
        <div className="life-copy">
          <CollectionHeading>BIO1990</CollectionHeading>
          <h2>Who am I?<sub className="identity-aside">no really // plz help // idk who I am</sub></h2>
          {editorial.home.aboutParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <Link className="button" href="/about-me">A lil history</Link>
        </div>
        <EditorialKitties emptyPhoto={editorial.home.emptyCatPhoto} label={editorial.home.editorialLabel} />
      </div>
    </section>
    <section id="words-of-folly" className={`folly-feature ${styles.clearing}`}>
      <StudioArtwork slot="folly-scenery" variant="botanical" className={styles.reeds}/>
      <div className={`shell ${styles.follySpread}`}>
        <div className={styles.follyHeading}>
          <CollectionHeading>Words of Folly</CollectionHeading>
          <h2 className={styles.follyTitle}>Note to self:</h2>
          <div className="rail-more"><Link className="button button-outline" href="/words-of-folly">The whole pile</Link></div>
        </div>
        <div className={`folly-latest ${styles.leaf}`} role="img" aria-label={latestFolly.text}>
          <QuoteLeaf quote={latestFolly} index={follyQuotes.length - 1} />
        </div>
      </div>
    </section>
    <section id="shoutouts" className={`shoutouts-section ${styles.shoutouts}`}><div className="shell">
      <CollectionHeading>Cool peeps</CollectionHeading>
      <ShoutoutList people={shoutouts.slice(0,3)} />
      <div className="rail-more"><Link className="button" href="/shoutouts">Other shoutouts</Link></div>
    </div></section>
    {process.env.NEXT_PUBLIC_SUBSCRIBE_URL && <section className="subscribe-callout shell">
      <h2>Keep in touch.</h2><p>Occasional blurbs from my noggin to your feed.</p>
      <a className="button" href={process.env.NEXT_PUBLIC_SUBSCRIBE_URL}>Get writing updates</a>
    </section>}
  </div>;
}
