import type { Metadata } from "next";
import Link from "next/link";
import { displayDate, publishedJournalPosts } from "@/content/site";

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
      <ol className="journal-archive" aria-label="Entries, newest first">
        {publishedJournalPosts().map(post => <li key={post.slug}>
          <Link className="journal-row" href={`/journal/${post.slug}`}>
            <time dateTime={post.date}>{displayDate(post.date)}</time>
            <div><h2>{post.title}</h2><p>{post.excerpt}</p></div>
            <span className="button card-button">Read more <span aria-hidden="true">→</span></span>
          </Link>
        </li>)}
      </ol>
    </div>
  );
}
