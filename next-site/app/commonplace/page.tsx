import type { Metadata } from "next";
import { CommonplaceCard } from "@/components/commonplace-card";
import { getCommonplace } from "@/lib/commonplace";
import { InspirationHeading } from "@/components/collection-heading";

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
        <InspirationHeading level={1} />
      </div>
      {!entries.length && <div className="board-empty"><span aria-hidden="true">↗</span><div><h3>Making room for new finds.</h3><p>The things I want to keep will land here.</p></div></div>}
      <div className="commonplace-grid collection-grid">
        {entries.map((entry) => (
          <CommonplaceCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
