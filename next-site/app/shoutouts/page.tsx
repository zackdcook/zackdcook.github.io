import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { ShoutoutList } from "@/components/shoutout-list";
import { getShoutouts } from "@/lib/shoutouts";
import { Suspense } from "react";

export const metadata: Metadata = pageMetadata("shoutouts", "Shoutouts");

async function People() {
  const shoutouts=await getShoutouts();
  return <ShoutoutList people={shoutouts} />;
}

export default function Shoutouts() {
  return <div className="shoutouts-page page-wrap"><div className="shell">
    <div className="page-intro">
      <p className="eyebrow">Shoutouts</p>
      <h1>Cool <em>peeps:</em></h1>
    </div>
    <Suspense fallback={null}><People /></Suspense>
  </div></div>;
}
