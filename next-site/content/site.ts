export const site = {
  name: "Zack Cook",
  email: "hi@zackdcook.com",
  url: "https://zackdcook.com",
  title: "Zack Cook: Engineer ⇌ Author",
  icon: "/images/brand/favicon-living.svg",
  appleIcon: "/images/brand/apple-living.png",
  homeIcon: "/images/brand/home-living.webp",
  // These control the footer. Add only your own public profile/payment links.
  instagram: "https://www.instagram.com/zackyc.xyz/",
  threads: "https://www.threads.com/@zackyc.xyz",
  linkedin: "https://www.linkedin.com/in/zackdcook/",
  supportUrl: "https://cash.app/$zackdcook",
  supportLabel: "Fill my veins with caffeine",
  shareImage: "/opengraph-image",
  description:
    "Zack Cook is an aspiring author and industrial engineer in Lakeland, Florida. Stay tuned for his first novel, read his ramblings, and explore the things that inspire him.",
};

export function displayDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export type CommonplaceEntry = {
  id: string;
  title: string;
  note: string;
  category: "inspiration" | "reading" | "music" | "life";
  source_url: string | null;
  creator: string | null;
  image_url: string | null;
  created_at: string;
};

// Paste curated public post URLs here; the old camera-roll entries are in Git history.
export const personalEntries: CommonplaceEntry[] = [];

export { default as shoutouts } from "./shoutouts.json";

export type SiteEvent = {
  title: string;
  starts: string;
  ends: string;
  location: string;
  url?: string;
};
export const events: SiteEvent[] = [];

export const writingGroup = {
  title: "Write On, Lakeland!",
  schedule: "Every Thursday · 4–6 p.m. Eastern",
  venue: "Pressed Books & Coffee",
  location: "Downtown Lakeland, Florida",
  address: "213 E Bay Street, Lakeland, FL 33801",
  description:
    "Join us as we talk through the ups and downs of creative writing, brainstorm together, and body-double to get some writing in. Bring whatever you’re working on, and come as you are.",
  venueUrl: "https://www.pressedbooksandcoffee.com/",
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Pressed+Books+%26+Coffee+213+E+Bay+Street+Lakeland+FL+33801",
  calendar: {
    timeZone: "America/New_York",
    weekday: 4,
    startTime: "16:00",
    endTime: "18:00",
    description: "Creative writing group. Come as you are.",
  },
};

export function upcomingEvents(now = new Date()) {
  return events
    .filter((event) => new Date(event.ends) >= now)
    .sort((a, b) => +new Date(a.starts) - +new Date(b.starts));
}
