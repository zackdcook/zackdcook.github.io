import Link from "next/link";
import { CopyFeed } from "@/components/copy-feed";
import { site } from "@/content/site";

export const metadata = {
  title: "Follow by RSS",
  description: "Follow Zack Cook’s Words of Folly in your favorite feed reader.",
  alternates: { canonical: "/rss" },
};

export default function Rss() {
  const feed = `${site.url}/words-of-folly/feed.xml`;
  return <div className="shell page-wrap feed-panel">
    <div className="page-intro">
      <p className="eyebrow">RSS</p>
      <h1>Follow the <em className="rss-accent">folly.</em></h1>
      <p>New Words of Folly, straight to your feed reader.</p>
    </div>
    <p>Let your feed reader do the checking. Copy this address into it for new Words of Folly.</p>
    <CopyFeed url={feed} />
    <div className="actions"><a className="text-link" href="/words-of-folly/feed.xml">Open the RSS feed</a><Link className="text-link" href="/words-of-folly">Read Words of Folly</Link></div>
  </div>;
}
