import Link from "next/link";
import { CopyFeed } from "@/components/copy-feed";
import { site } from "@/content/site";

export const metadata = { title: "Follow by RSS", description: "Follow Zack Cook’s Words of Folly in your favorite feed reader.", alternates: { canonical: "/rss" } };

export default function Rss() {
  return <div className="shell page-wrap feed-panel">
    <div className="page-intro"><p className="eyebrow">RSS</p><h1>Keep<br /><em>in the loop.</em></h1><p>New Words of Folly, straight to your feed reader.</p></div>
    <p>RSS lets you follow new posts without an account here. Copy this address into the “Add feed” or “Follow website” box in your feed reader.</p>
    <CopyFeed url={`${site.url}/journal/feed.xml`} />
    <p>Your reader will check for new entries automatically. If you open the feed directly in a browser, you may see XML code—that’s the format feed readers use.</p>
    <div className="actions"><a className="text-link" href="/journal/feed.xml">Open the RSS feed ↗</a><Link className="text-link" href="/journal">Read Words of Folly →</Link></div>
  </div>;
}
