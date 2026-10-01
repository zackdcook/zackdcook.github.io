import Link from "next/link";
import Image from "next/image";
import { ProgressRings } from "@/components/progress-rings";
import { CommonplaceCard } from "@/components/commonplace-card";
import { SpotifyCard } from "@/components/spotify-card";
import { journalPost, upcomingEvents, writingGroup } from "@/content/site";
import { getCommonplace } from "@/lib/commonplace";
import progress from "@/content/progress.json";

export const revalidate = 60;
export const metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const entries = await getCommonplace();
  const event = upcomingEvents()[0];
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">
            Engineer by day // Author in play <span aria-hidden="true">✦</span>
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
            <br />I made this site to promote my creative works, scream into the void, and share things that inspire me.
          </p>
          <div className="actions">
            <Link className="button" href="/writing">
              Creative works <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" href="/about">
              More about me <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="hero-photo">
          <span className="portrait-spark" aria-hidden="true">
            🫪
          </span>
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
          <span className="portrait-note">
            G'day, mate! <span aria-hidden="true">🚯</span>
          </span>
          <p className="photo-location">
            <span aria-hidden="true">●</span> Lakeland, Florida
          </p>
          <SpotifyCard />
        </div>
      </section>

      <section className="desk-section">
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
            <p>
              Now, as of September 1<sup>st</sup>, 2026, I'm working on my zeroth draft with a current target of 60,000 words.
            </p>
            <Link className="text-link" href="/writing">
              More deets <span aria-hidden="true">→</span>
            </Link>
            <p className="updated">
              Progress updated{" "}
              <time dateTime={progress.updated}>September 30, 2026</time>
            </p>
          </div>
          <ProgressRings />
        </div>
      </section>

      <section className="journal-feature shell section-space">
        <div className="section-heading">
          <p className="eyebrow">Words of Folly</p>
          <Link className="text-link" href="/journal">
            All entries <span aria-hidden="true">→</span>
          </Link>
        </div>
        <article>
          <div className="journal-meta">
            <time dateTime={journalPost.date}>October 20, 2025</time>
            <span>Writing & starting over</span>
          </div>
          <div>
            <h2>
              <Link href={`/journal/${journalPost.slug}`}>
                {journalPost.title}
              </Link>
            </h2>
            <p>{journalPost.excerpt}</p>
            <Link className="text-link" href={`/journal/${journalPost.slug}`}>
              Read the entry <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      </section>

      <section className="commonplace-section section-space">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Inspo Board</p>
              <h2>Cool stuff
                  <br />(if you're me)</h2>
            </div>
            <Link className="text-link" href="/commonplace">
              See more <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="section-intro">
            Things that makes you go, "Hmm" for $500.
          </p>
          <div className="commonplace-grid">
            {entries.slice(0, 3).map((entry) => (
              <CommonplaceCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </section>

      <section className="life-section shell section-space">
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

      <section className="event-callout shell">
        <p className="eyebrow">Find me at…</p>
        <h2>{writingGroup.title}</h2>
        <p className="event-schedule">{writingGroup.schedule}</p>
        <p>{writingGroup.venue} · Downtown Lakeland</p>
        <p className="event-description">{writingGroup.description}</p>
        <Link className="text-link" href="/events">
          Come write with us →
        </Link>
      </section>
      {event && (
        <section className="event-callout shell">
          <p className="eyebrow">Find me at…</p>
          <h2>{event.title}</h2>
          <p>{event.location}</p>
          <Link className="text-link" href="/events">
            Event details →
          </Link>
        </section>
      )}
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
