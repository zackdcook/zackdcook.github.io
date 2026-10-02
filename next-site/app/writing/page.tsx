import type { Metadata } from "next";
import Link from "next/link";
import { ProgressRings } from "@/components/progress-rings";

export const metadata: Metadata = {
  title: "Creative Works",
  description:
    "Follow Zack Cook’s first novel: a completed 35,834-word braindump and a zeroth draft at 27,250 of 50,000 words.",
  alternates: { canonical: "/writing" },
};

export default function Writing() {
  return (
    <div className="shell page-wrap">
      <div className="page-intro">
        <p className="eyebrow">Creative Works</p>
        <h1>
          A novel
          <br />
          <em>in the making.</em>
        </h1>
        <p>I’m writing my first novel. Here’s where it stands.</p>
      </div>
      <section className="writing-panel">
        <div>
          <p className="eyebrow">Current project</p>
          <h2>
            First novel.
            <br />
            0<sup>th</sup> draft.
          </h2>
          <p>
            Fantasy, strange things, and people trying to figure out what
            matters to them. I’m getting the story down before I go back to
            reshape it.
          </p>
          <p>
            The draft target is 50,000 words. It’s a working estimate based on
            where I am in the story.
          </p>
        </div>
        <ProgressRings compact />
      </section>
      <section className="prose section-space">
        <h2>Before the draft</h2>
        <p>
          The braindump came first: 35,834 words of getting ideas out of my head
          and onto the page. That stage is complete. The zeroth draft is a
          separate pass, with its own count and goal.
        </p>
        <h2>When there’s something to read</h2>
        <p>
          This will also be the home for finished stories, excerpts, and future
          books. For now, the <Link href="/journal">journal</Link> is open.
        </p>
      </section>
    </div>
  );
}
