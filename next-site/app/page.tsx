import Link from "next/link";
import Image from "next/image";
import { ProgressRings } from "@/components/progress-rings";
import { CommonplaceCard } from "@/components/commonplace-card";
import { ContentRail } from "@/components/content-rail";
import { displayDate, publishedJournalPosts, shoutouts, upcomingEvents, writingGroup } from "@/content/site";
import { getCommonplace } from "@/lib/commonplace";
import progress from "@/content/progress.json";

export const revalidate = 60;
export const metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const entries = await getCommonplace();
  const event = upcomingEvents()[0];
  const posts = publishedJournalPosts().slice(0, 5);
  const draft = progress.stages.find(stage => stage.status === "active");
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">
            Engineer by day // Author in play
          </p>
          <h1>
            Zack
            <br /> <em>Cook.</em>
          </h1>
          <p className="hero-intro">
            Easily distracted by cats, birds, and ...
          </p>
          <p className="hero-detail">
            Greetings, fellow person!
            <br />I’m Zack and I live in sunny Lakeland, Florida.
          </p>
          <p className="hero-detail">
            I made this site to promote my creative works, scream into the void, and share things that inspire me.
          </p>
          <div className="actions">
            <Link className="button" href="/writing">
              Creative works <span aria-hidden="true">↗</span>
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
          <p className="photo-location">
            <span aria-hidden="true">●</span> Lakeland, Florida
          </p>
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
            <p>Writing my first novel, and
              <br />learning the process along the way.</p>
            <p className="desk-detail">
              I took a three-year braindump while absorbing every possible lesson on the craft of writing.
            </p>
            <p className="desk-detail">
              Now, as of September 1<sup>st</sup>, 2026, I'm working on my zeroth draft with a current target of {draft?.target?.toLocaleString("en-US")} words.
            </p>
            <Link className="text-link" href="/writing">
              More deets <span aria-hidden="true">→</span>
            </Link>
            <p className="updated">
              Progress updated{" "}
              <time dateTime={progress.updated}>{displayDate(progress.updated)}</time>
            </p>
          </div>
          <ProgressRings />
        </div>
      </section>

      <section id="find-me-at" className="event-callout shell">
        <p className="eyebrow">Find me at…</p>
        <h2>{writingGroup.title}</h2>
        <p className="event-schedule">{writingGroup.schedule}</p>
        <p>{writingGroup.venue} · Downtown Lakeland</p>
        <p className="event-description">{writingGroup.description}</p>
        <Link className="text-link" href="/events">Come write with us <span aria-hidden="true">→</span></Link>
      </section>
      {event && <section className="event-callout shell upcoming-callout">
        <p className="eyebrow">Also coming up</p><h2>{event.title}</h2><p>{event.location}</p>
        <Link className="text-link" href="/events">Event details →</Link>
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
          <span className="photo-label">The editorial board aka firing squad.</span>
        </div>
        <div className="life-copy">
          <p className="eyebrow">About Me</p>
          <h2>
            Who am I?
          </h2>
          <p>
            I live with my beautiful wife, Jennifer, and our three cats: Chemi, Tashi, and
            Brave.
          </p>
          <p>
            My favorite hobby is learning new hobbies.
          </p>
          <Link className="text-link" href="/about">
            A lil more aboot lil ole me <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section id="words-of-folly" className="journal-feature shell section-space">
        <div className="section-heading"><div><p className="eyebrow">Words of Folly</p><h2>From my noggin.</h2></div></div>
        <ContentRail label="Recent Words of Folly" count={posts.length}>
          {posts.map(post => <Link className="journal-banner" key={post.slug} href={`/journal/${post.slug}`}>
            <time dateTime={post.date}>{displayDate(post.date)}</time>
            <h3>{post.title}</h3><p>{post.excerpt}</p>
            <span className="text-link">Read the entry <span aria-hidden="true">→</span></span>
          </Link>)}
        </ContentRail>
        <div className="rail-more"><Link className="button button-outline" href="/journal">All Words of Folly <span aria-hidden="true">→</span></Link></div>
      </section>

      <section id="inspo-board" className="commonplace-section section-space">
        <div className="shell">
          <div className="section-heading"><div><p className="eyebrow">Inspo Board</p><h2>Cool stuff<br />(if you're me)</h2></div></div>
          <p className="section-intro">Things that makes you go, "Hmm" for $500.</p>
          {entries.length ? <ContentRail label="Recent inspiration" count={entries.slice(0, 5).length}>
            {entries.slice(0, 5).map(entry => <CommonplaceCard key={entry.id} entry={entry} />)}
          </ContentRail> : <div className="board-empty"><span aria-hidden="true">↗</span><div><h3>Making room for new finds.</h3><p>The things I want to keep will land here.</p></div></div>}
          <div className="rail-more"><Link className="button button-outline" href="/commonplace">The whole Inspo Board <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>

      <section id="shoutouts" className="shoutouts-section shell section-space">
        <p className="eyebrow">Shoutouts</p><h2>Good people. Good work.</h2>
        <div className="shoutout-list">{shoutouts.map(person => <a className="shoutout-link" key={person.url} href={person.url} target="_blank" rel="noopener noreferrer">
          <div><h3>{person.name}</h3><p>{person.note}</p></div><span aria-hidden="true">↗</span>
        </a>)}</div>
      </section>
      {process.env.NEXT_PUBLIC_SUBSCRIBE_URL && (
        <section className="subscribe-callout shell">
          <h2>Keep in touch.</h2>
          <p>Occasional blurbs from my noggin to your feed.</p>
          <a className="button" href={process.env.NEXT_PUBLIC_SUBSCRIBE_URL}>
            Get writing updates ↗
          </a>
        </section>
      )}
    </>
  );
}
