import { pageMetadata } from "@/lib/page-metadata";
import { CollectionHeading } from "@/components/collection-heading";
import { FollyPile } from "@/components/folly-pile";

export const metadata = pageMetadata("journal", "Words of Folly");

export default function Journal() {
  return <div className="folly-page"><div className="shell">
    <div className="page-intro"><CollectionHeading level={1}>Words of Folly</CollectionHeading></div>
    <FollyPile />
  </div></div>;
}
