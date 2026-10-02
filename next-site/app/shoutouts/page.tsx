import type { Metadata } from "next";
import { ShoutoutList } from "@/components/shoutout-list";
import { shoutouts } from "@/content/site";
import { CollectionHeading } from "@/components/collection-heading";

export const metadata: Metadata = {
  title: "Shoutouts",
  description: "Authors, friends, and other cool peeps Zack Cook wants you to check out.",
  alternates: { canonical: "/shoutouts" },
};

export default function Shoutouts() {
  return <div className="shell page-wrap">
    <div className="page-intro">
      <CollectionHeading level={1}>Cool peeps</CollectionHeading>
    </div>
    <ShoutoutList people={shoutouts} />
  </div>;
}
