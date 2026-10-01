import type { Metadata } from "next";
import { CommonplaceCard } from "@/components/commonplace-card";
import { SpotifyCard } from "@/components/spotify-card";
import { getCommonplace } from "@/lib/commonplace";

export const metadata: Metadata = {
  title: "Inspo Board",
  description:
    "Things Zack Cook wants to keep around: inspiration, photos, music, and interesting finds.",
  alternates: { canonical: "/commonplace" },
};
export const revalidate = 60;

export default async function Commonplace() {
  const entries = await getCommonplace();
  return (
    <div className="shell page-wrap">
      <div className="page-intro">
        <p className="eyebrow">The Inspo Board</p>
        <h1>
          Worth
          <br />
          <em>keeping.</em>
        </h1>
        <p>
          Things I like. Things that make me curious. Things that make me want
          to make something of my own.
        </p>
      </div>
      <SpotifyCard />
      <div className="commonplace-grid collection-grid">
        {entries.map((entry) => (
          <CommonplaceCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
