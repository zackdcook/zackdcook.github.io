import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { ShoutoutList } from "@/components/shoutout-list";
import { getShoutouts } from "@/lib/community";
import { ShoutoutForm } from "@/components/shoutout-form";
import { submissionsConfigured } from "@/lib/submission-config";
import { CollectionHeading } from "@/components/collection-heading";

export const metadata: Metadata = pageMetadata("shoutouts", "Shoutouts");

export default async function Shoutouts() {
  const shoutouts=await getShoutouts();
  return <div className="shell page-wrap">
    <div className="page-intro">
      <CollectionHeading level={1}>Cool peeps</CollectionHeading>
    </div>
    <ShoutoutList people={shoutouts} />
    <ShoutoutForm enabled={submissionsConfigured()} siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY||""}/>
  </div>;
}
