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
            Fiction writer & engineer <span aria-hidden="true">✦</span>
          </p>
          <h1>
            Zack
            <br /> <em>Cook.</em>
          </h1>
          <p className="hero-intro">
            Writing my first novel.
            <br />
            With music on and cats nearby.
          </p>
          <p className="hero-detail">
            I’m based in Lakeland, Florida. This is where I keep my writing, the
            things that catch my attention, and a little of life in between.
          </p>
          <div className="actions">
            <Link className="button" href="/writing">
              See what I’m writing <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" href="/about">
              Meet Zack <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="hero-photo">
          <span className="portrait-spark" aria-hidden="true">
            ✳
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
            Oh, hey. <span aria-hidden="true">↖</span>
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
            <p className="eyebrow">On my desk</p>
            <h2>
              Let him
              <br /> <em>Cook.</em>
            </h2>
            <p>A first novel, one scene at a time.</p>
            <p className="desk-detail">
              The braindump gave me a place to start. Now I’m turning it into a
              draft, with a working target of 60,000 words.
            </p>
            <Link className="text-link" href="/writing">
              Visit the writing desk <span aria-hidden="true">→</span>
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
          <p className="eyebrow">From Words of Folly</p>
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
              <p className="eyebrow">The Inspo Board</p>
              <h2>Worth keeping.</h2>
            </div>
            <Link className="text-link" href="/commonplace">
              Take a look around <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="section-intro">
            A few things that made me stop, look, or want to make something.
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
          <span className="photo-label">The household editorial board.</span>
        </div>
        <div className="life-copy">
          <p className="eyebrow">A little life in between</p>
          <h2>
            At home
            <br /> in Lakeland.
          </h2>
          <p>
            I live with my wife, Jennifer, and our three cats: Chemi, Tashi, and
            Brave.
          </p>
          <p>
            Beyond writing, there’s engineering, birdwatching, model kits,
            matcha, and a steady rotation of things I want to learn.
          </p>
          <Link className="text-link" href="/about">
            A little more about me <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="event-callout shell">
        <p className="eyebrow">Find Me At…</p>
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
          <p>Occasional notes from the writing desk.</p>
          <a className="button" href={process.env.NEXT_PUBLIC_SUBSCRIBE_URL}>
            Get writing updates ↗
          </a>
        </section>
      )}
    </>
  );
}
