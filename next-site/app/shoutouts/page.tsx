import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { ShoutoutList } from "@/components/shoutout-list";
import { getShoutouts } from "@/lib/community";

export const metadata: Metadata = pageMetadata("shoutouts", "Shoutouts");

export default async function Shoutouts() {
  const shoutouts=await getShoutouts();
  return <div className="shell page-wrap">
    <div className="page-intro">
      <h1>Cool peeps</h1>
    </div>
    <ShoutoutList people={shoutouts} />
  </div>;
}
