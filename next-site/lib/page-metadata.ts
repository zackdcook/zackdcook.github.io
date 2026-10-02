import type { Metadata } from "next";
import { site, journalPosts } from "@/content/site";
import { projects } from "@/content/projects";

export type ShareRecord = { id: string; path: string; title: string; description: string; category: string; status?: string; date?: string };
export const shareRecords: ShareRecord[] = [
  { id: "home", path: "/", title: "Zack Cook.", description: site.description, category: "Aspiring Author + Engineer" },
  { id: "writing", path: "/writing", title: "A novel in the making.", description: "Follow Zack Cook’s first novel: a completed 35,834-word braindump and a zeroth draft at 27,250 of 50,000 words.", category: "Creative Works" },
  { id: "about", path: "/about", title: "Aboot Zack.", description: "Meet Zack Cook, also known as Zacky C: an aspiring author, Publix industrial engineer, and University of Florida chemical engineering graduate in Lakeland, Florida.", category: "About Me" },
  { id: "events", path: "/events", title: "Find me at…", description: "Meet Zack Cook at Write On, Lakeland! Every Thursday, 4–6 p.m., at Pressed Books & Coffee in downtown Lakeland, Florida.", category: "Events" },
  { id: "journal", path: "/journal", title: "Notes from my noggin.", description: "Writing updates, essays, and occasional notes from Zack Cook.", category: "Words of Folly" },
  { id: "commonplace", path: "/commonplace", title: "Further inspiration.", description: "Things Zack Cook wants to keep around: inspiration, photos, music, and interesting finds.", category: "Inspo Board" },
  { id: "shoutouts", path: "/shoutouts", title: "Cool peeps.", description: "Authors, friends, and other cool peeps Zack Cook wants you to check out.", category: "Shoutouts" },
  { id: "guestbook", path: "/tree", title: "A tree, impossibly tall.", description: "Wander into a quiet Florida swamp and leave a permanent mark on Zack Cook’s living bald-cypress guestbook.", category: "The living cypress" },
  ...projects.map(p => ({ id: `project-${p.slug}`, path: `/writing/${p.slug}`, title: p.shareTitle, description: p.summary, category: p.category, status: p.status })),
  ...journalPosts.map(p => ({ id: `journal-${p.slug}`, path: `/journal/${p.slug}`, title: p.title, description: p.excerpt, category: "Words of Folly", date: p.date })),
];

export function pageMetadata(id: string, title?: string): Metadata {
  const record = shareRecords.find(r => r.id === id);
  if (!record) throw new Error("Unknown content metadata record.");
  // Preview links must use their own image routes before those routes reach Production.
  // Canonical URLs still identify Zack's public domain.
  const imageOrigin = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_BRANCH_URL
    ? `https://${process.env.VERCEL_BRANCH_URL}`
    : site.url;
  const image = { url: new URL(`/share/${record.id}`, imageOrigin).toString(), width: 1200, height: 630, alt: `${record.title} · ${site.name}` };
  return {
    title: title || record.title,
    description: record.description,
    alternates: { canonical: record.path },
    openGraph: { type: record.date ? "article" : "website", title: `${record.title} · ${site.name}`, description: record.description, url: record.path, siteName: site.name, images: [image], ...(record.date ? { publishedTime: record.date, authors: [site.name] } : {}) },
    twitter: { card: "summary_large_image", title: `${record.title} · ${site.name}`, description: record.description, images: [image] },
  };
}
