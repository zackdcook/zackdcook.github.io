import type { Metadata } from "next";
import Link from "next/link";
import { journalPost } from "@/content/site";
import article from "@/content/its-not-too-late.json";
import { JournalConversation } from "@/components/journal-conversation";

export const metadata: Metadata = {
  title: journalPost.title,
  description: journalPost.excerpt,
  alternates: { canonical: "/journal/its-not-too-late" },
  openGraph: {
    type: "article",
    publishedTime: "2025-10-20",
    authors: ["Zack Cook"],
  },
};

export default function JournalEntry() {
  return (
    <div className="shell page-wrap">
      <header className="article-heading">
        <Link className="text-link" href="/journal">
          ← The journal
        </Link>
        <p className="eyebrow">
          <time dateTime="2025-10-20">October 20, 2025</time> ·{" "}
          {article.readingMinutes} min read
        </p>
        <h1>{journalPost.title}</h1>
        <p>By Zack Cook</p>
      </header>
      <article
        className="prose article-prose"
        dangerouslySetInnerHTML={{ __html: article.html }}
      />
      <JournalConversation slug={journalPost.slug} title={journalPost.title} />
    </div>
  );
}
