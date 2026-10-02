import type { Metadata } from "next";
import { ShoutoutList } from "@/components/shoutout-list";
import { shoutouts } from "@/content/site";

export const metadata: Metadata = {
  title: "Shoutouts",
  description: "Authors, friends, and other cool peeps Zack Cook wants you to check out.",
  alternates: { canonical: "/shoutouts" },
};

export default function Shoutouts() {
  return <div className="shell page-wrap">
    <div className="page-intro">
      <p className="eyebrow">Shoutouts</p>
      <h1>Check out these<br />cool peeps.</h1>
    </div>
    <ShoutoutList people={shoutouts} />
  </div>;
}
