import { pageMetadata } from "@/lib/page-metadata";
import { submissionsConfigured } from "@/lib/submission-config";
import { TreeEntrance } from "@/components/tree-entrance";
export const metadata = pageMetadata("guestbook", "The living cypress");
export default function TreePage() {
  // No communal data is fetched until a living visitor chooses to explore/sign.
  return <><TreeEntrance enabled={submissionsConfigured()} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} /><noscript><p className="shell">The interactive tree needs JavaScript. <a href="/tree/entries">Browse the names, notes, and dates in the readable guest list.</a></p></noscript></>;
}
