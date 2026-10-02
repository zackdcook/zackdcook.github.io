import Link from "next/link";
import Image from "next/image";
import { ProgressRings } from "@/components/progress-rings";
import { CommonplaceCard } from "@/components/commonplace-card";
import { ContentRail } from "@/components/content-rail";
import { ShoutoutList } from "@/components/shoutout-list";
import { WritingGroupCard } from "@/components/writing-group-card";
import { CollectionHeading, InspirationHeading } from "@/components/collection-heading";
import { displayDate, publishedJournalPosts } from "@/content/site";
import { getShoutouts } from "@/lib/community";
import { getCommonplace } from "@/lib/commonplace";
import editorial from "@/content/editorial.json";
import { getUpcomingEvents } from "@/lib/site-events";
import progress from "@/content/progress.json";

export const metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [entries, events, shoutouts] = await Promise.all([getCommonplace(), getUpcomingEvents(), getShoutouts()]);
  const event = events[0];
  const posts = publishedJournalPosts().slice(0, 5);
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">{editorial.home.eyebrow}</p>
          <h1>Zack<br /> <em>Cook.</em></h1>
          <p className="hero-intro">{editorial.home.intro}</p>
          {editorial.home.paragraphs.map(paragraph => <p className="hero-detail" key={paragraph}>{paragraph}</p>)}
          <div className="actions">
            <Link className="button" href="/writing">
              Creative works
            </Link>
          </div>
        </div>
        <div className="hero-photo">
          <div className="portrait-frame">
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
        <div className="shell desk-inner">
          <div className="desk-copy">
            <p className="eyebrow">Active project</p>
            <h2>
              Let him
              <br /> <em>Cook.</em>
            </h2>
            <Link className="button" href="/writing">
              More deets
            </Link>
            <p className="updated">
              Progress updated{" "}
              <time dateTime={progress.updated}>{displayDate(progress.updated)}</time>
            </p>
          </div>
          <ProgressRings />
        </div>
      </section>

      <section id="find-me-at" className="events-section shell">
        <WritingGroupCard />
        <div className="rail-more"><Link className="button" href="/events#other-events">Other events</Link></div>
      </section>
      {event && <section className="event-callout shell upcoming-callout">
        <p className="eyebrow">Also coming up</p><h2>{event.title}</h2><p>{event.location}</p>
        <Link className="button" href="/events">Event details</Link>
      </section>}

      <section id="about-me" className="life-section shell section-space">
        <div className="life-photo">
          <Image
            src="/images/cats.webp"
            alt="Chemi, Tashi, and Brave relaxing on a rug beside a sunny window"
            width={1400}
            height={1034}
            sizes="(max-width: 740px) 90vw, 48vw"
          />
          <span className="photo-label">{editorial.home.editorialLabel}</span>
        </div>
        <div className="life-copy">
          <p className="eyebrow">Aboot Zack</p>
          <h2>
            Who am I?
            <sub className="identity-aside">no really // plz help // idk who I am</sub>
          </h2>
          {editorial.home.aboutParagraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          <Link className="button" href="/about">
            A lil more about me
          </Link>
        </div>
      </section>

      <section id="words-of-folly" className="journal-feature shell section-space">
        <div className="section-heading"><CollectionHeading>Notes from my noggin</CollectionHeading></div>
        <ContentRail label="Recent Words of Folly" count={posts.length}>
          {posts.map(post => <Link className="journal-banner" key={post.slug} href={`/journal/${post.slug}`}>
            <time dateTime={post.date}>{displayDate(post.date)}</time>
            <h3>{post.title}</h3><p>{post.excerpt}</p>
            <span className="button card-button">Read more</span>
          </Link>)}
        </ContentRail>
        <div className="rail-more"><Link className="button button-outline" href="/journal">Older rants and rambles</Link></div>
      </section>

      <section id="inspo-board" className="commonplace-section section-space">
        <div className="shell">
          <div className="section-heading"><InspirationHeading /></div>
          {entries.length ? <ContentRail label="Recent inspiration" count={entries.slice(0, 5).length}>
            {entries.slice(0, 5).map(entry => <CommonplaceCard key={entry.id} entry={entry} />)}
          </ContentRail> : <div className="board-empty"><span aria-hidden="true">↗</span><div><h3>Making room for new finds.</h3><p>The things I want to keep will land here.</p></div></div>}
          <div className="rail-more"><Link className="button button-outline" href="/commonplace">Further inspiration</Link></div>
        </div>
      </section>

      <section id="shoutouts" className="shoutouts-section shell section-space">
        <CollectionHeading>Cool peeps</CollectionHeading>
        <ShoutoutList people={shoutouts.slice(0, 3)} />
        <div className="rail-more"><Link className="button" href="/shoutouts">Other shoutouts</Link></div>
      </section>
      {process.env.NEXT_PUBLIC_SUBSCRIBE_URL && (
        <section className="subscribe-callout shell">
          <h2>Keep in touch.</h2>
          <p>Occasional blurbs from my noggin to your feed.</p>
          <a className="button" href={process.env.NEXT_PUBLIC_SUBSCRIBE_URL}>
            Get writing updates
          </a>
        </section>
      )}
      <section className="guestbook-invitation shell section-space"><p className="eyebrow">Before you wander off</p><h2>Leave a little<br/><em>mark.</em></h2><p>A growing cypress, a patch of bark, and everyone who’s stopped by.</p><Link href="/guestbook" className="button">Sign My Guestbook</Link></section>
    </>
  );
}
