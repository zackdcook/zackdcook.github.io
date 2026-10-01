import type { Metadata } from "next";
import Link from "next/link";
import { journalPost } from "@/content/site";

export const metadata: Metadata = {
  title: "Words of Folly",
  description: "Writing updates, essays, and occasional notes from Zack Cook.",
  alternates: { canonical: "/journal" },
};

export default function Journal() {
  return (
    <div className="shell page-wrap">
      <div className="page-intro">
        <p className="eyebrow">The journal</p>
        <h1>
          Words
          <br />
          <em>of Folly.</em>
        </h1>
        <p>Writing updates, longer thoughts, and things I’m figuring out.</p>
      </div>
      <article className="journal-list-entry">
        <time dateTime={journalPost.date}>October 20, 2025</time>
        <h2>
          <Link href={`/journal/${journalPost.slug}`}>{journalPost.title}</Link>
        </h2>
        <p>{journalPost.excerpt}</p>
        <Link className="text-link" href={`/journal/${journalPost.slug}`}>
          Read the entry →
        </Link>
      </article>
    </div>
  );
}
