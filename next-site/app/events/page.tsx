import { pageMetadata } from "@/lib/page-metadata";
import type { Metadata } from "next";
import { WritingGroupCard } from "@/components/writing-group-card";

export const metadata: Metadata = pageMetadata("events", "Events");
export default function Events() {
  return <div className="shell page-wrap events-page">
    <div className="page-intro">
      <p className="eyebrow">Events</p>
      <h1>Come say<br /><em>hi =)</em></h1>
      <p>If I ever break out, this is where I’ll post my schedule for sales, readings, signings, and all that.</p>
    </div>
    <WritingGroupCard eyebrow="Writing group" />
  </div>;
}
