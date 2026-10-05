import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { ShoutoutList } from "@/components/shoutout-list";
import { getShoutouts } from "@/lib/community";

export const metadata: Metadata = pageMetadata("shoutouts", "Shoutouts");

export default async function Shoutouts() {
  const shoutouts=await getShoutouts();
  return <div className="shoutouts-page page-wrap"><div className="shell">
    <div className="page-intro">
      <p className="eyebrow">Shoutouts</p>
      <h1>Cool peeps</h1>
    </div>
    <ShoutoutList people={shoutouts} />
  </div></div>;
}
