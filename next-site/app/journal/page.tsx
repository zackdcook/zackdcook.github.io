import { pageMetadata } from "@/lib/page-metadata";
import { FollyPile } from "@/components/folly-pile";

export const metadata = pageMetadata("journal", "Words of Folly");

export default function Journal() {
  return <div className="folly-page page-wrap"><div className="shell">
    <div className="page-intro"><h1 className="eyebrow page-label">Words of Folly</h1><h2 className="folly-page-heading">Notes I leave myself while I write.</h2></div>
    <div className="folly-panel"><FollyPile /></div>
  </div></div>;
}
