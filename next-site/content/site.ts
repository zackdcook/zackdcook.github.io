export const site = {
  name: "Zack Cook",
  email: "hi@zackdcook.com",
  url: "https://zackdcook.com",
  title: "Zack Cook — Engineer & aspiring author",
  icon: "/icon.png",
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

export const journalPost = {
  slug: "its-not-too-late",
  title: "It’s Not Too Late to Start",
  date: "2025-10-20",
  excerpt:
    "I grew up naturally talented at STEM, but my heart always craved the mess of making things. Here’s what happened when I turned 33.",
};

export type JournalPost = typeof journalPost;

// Add each published article here. The homepage, archive, and RSS share this list.
export const journalPosts: JournalPost[] = [journalPost];

export function publishedJournalPosts() {
  return [...journalPosts].sort((a, b) => b.date.localeCompare(a.date));
}

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

export const shoutouts = [
  {
    name: "R.M. Hamrick",
    url: "https://rmhamrick.com/",
    note: "A fellow author from Write On, Lakeland!",
  },
];

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
  address: "213 E Bay St., Lakeland, FL 33801",
  description:
    "Join us as we talk through the ups and downs of creative writing, brainstorm together, and body-double to get some writing in. Bring whatever you’re working on, and come as you are.",
  venueUrl: "https://www.pressedbooksandcoffee.com/",
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Pressed+Books+%26+Coffee+213+E+Bay+St+Lakeland+FL+33801",
};

export function upcomingEvents(now = new Date()) {
  return events
    .filter((event) => new Date(event.ends) >= now)
    .sort((a, b) => +new Date(a.starts) - +new Date(b.starts));
}
