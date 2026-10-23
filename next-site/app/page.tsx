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
import styles from "./home.module.css";
import { websiteStructuredData } from "@/lib/page-metadata";

export const metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [events, shoutouts] = await Promise.all([getUpcomingEvents(), getShoutouts()]);
  const event = events[0];
  return <div className={styles.world}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(websiteStructuredData).replace(/</g,"\\u003c")}} />
    <section id="home"><FieldJournalHero /></section>
    <section id="creative-works" className={`desk-section ${styles.manuscript}`}>
      <div className="shell"><ActiveProject detailsLink /></div>
    </section>
    <section id="find-me-at" className={`events-section ${styles.events}`}><div className="shell">
      <WritingGroupCard><div className="rail-more"><Link className="button" href="/events">Other events</Link></div></WritingGroupCard>
    </div></section>
    {event && <section className="event-callout upcoming-callout"><div className="shell">
      <p className="eyebrow">Also coming up</p><h2>{event.title}</h2><p>{event.location}</p>
      <Link className="text-link" href="/events">Event details</Link>
    </div></section>}
    <section id="about-me" className={`bio-section ${styles.biography}`}>
      <div className="life-section shell">
        <div className="life-copy">
          <div className="life-heading">
          <CollectionHeading>BIO1990</CollectionHeading>
          <h2>Who am I?<sub className="identity-aside">no really // plz help // idk who I am</sub></h2>
          </div>
          <div className="life-body">
          {editorial.home.aboutParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <Link className="button" href="/aboutme">A lil history</Link>
          </div>
        </div>
        <EditorialKitties label={editorial.home.editorialLabel} />
      </div>
    </section>
    <section id="guestbook" className={styles.guestbook}>
      <div className="shell">
        <p className="eyebrow">DOODLES</p>
        <h2>Sign my guestbook 📝</h2>
        <p>Write your signature, leave a message, or draw something fun!</p>
        <Link className="button" href="/guestbook" prefetch={false}>Make your mark</Link>
      </div>
    </section>
    <section id="words-of-folly" className={`folly-feature ${styles.clearing}`}>
      <div className={`shell ${styles.follySpread}`}>
        <div className={styles.follyHeading}>
          <CollectionHeading>Words of Folly</CollectionHeading>
          <h2 className={styles.follyTitle}>Note to self:</h2>
        </div>
        <div className={`folly-latest ${styles.leaf}`} role="img" aria-label={latestFolly.text}>
          <QuoteLeaf quote={latestFolly} index={follyQuotes.length - 1} />
        </div>
        <div className={styles.follyDestination}><Link className="button" href="/words-of-folly">Pile of leaves</Link></div>
      </div>
    </section>
    <section id="shoutouts" className={`shoutouts-section ${styles.shoutouts}`}><div className="shell">
      <CollectionHeading>Cool peeps</CollectionHeading>
      <ShoutoutList people={shoutouts.slice(0,3)} />
      <div className="rail-more"><Link className="button" href="/shoutouts">Other shoutouts</Link></div>
    </div></section>
    {process.env.NEXT_PUBLIC_SUBSCRIBE_URL && <section className="subscribe-callout"><div className="shell">
      <h2>Keep in touch.</h2><p>Occasional blurbs from my noggin to your feed.</p>
      <a className="text-link" href={process.env.NEXT_PUBLIC_SUBSCRIBE_URL}>Get writing updates</a>
    </div></section>}
  </div>;
}
