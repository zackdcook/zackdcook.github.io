export const site = {
  name: "Zack Cook",
  email: "hi@zackdcook.com",
  description:
    "Zack Cook is a fiction writer and industrial engineer in Lakeland, Florida. Follow his first novel, read his journal, and explore the things that inspire him.",
};

export const journalPost = {
  slug: "its-not-too-late",
  title: "It’s Not Too Late to Start",
  date: "2025-10-20",
  excerpt:
    "I grew up naturally talented at STEM, but my heart always craved the mess of making things. Here’s what happened when I turned 33.",
};

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

// Personal photos from Zack's supplied favorites. Replace captions freely.
export const personalEntries: CommonplaceEntry[] = [
  {
    id: "lego-door",
    title: "Hide in plain sight.",
    note: "A small door. A suspicious little guy. Excellent use of an afternoon.",
    category: "inspiration",
    source_url: null,
    creator: null,
    image_url: "/images/lego.webp",
    created_at: "2026-09-30",
  },
  {
    id: "neon",
    title: "Exactly where you need to be.",
    note: "Keeping this one around.",
    category: "inspiration",
    source_url: null,
    creator: null,
    image_url: "/images/neon.webp",
    created_at: "2026-09-30",
  },
  {
    id: "gundam",
    title: "Some assembly required.",
    note: "Model kits, tiny details, and the satisfaction of making something with my hands.",
    category: "life",
    source_url: null,
    creator: null,
    image_url: "/images/gundam.webp",
    created_at: "2026-09-30",
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
    "We talk through wins and challenges, brainstorm, and body-double to get some writing in. Bring whatever you’re working on.",
  venueUrl: "https://www.pressedbooksandcoffee.com/",
  directionsUrl:
    "https://www.google.com/maps/search/?api=1&query=Pressed+Books+%26+Coffee+213+E+Bay+St+Lakeland+FL+33801",
};

export function upcomingEvents(now = new Date()) {
  return events
    .filter((event) => new Date(event.ends) >= now)
    .sort((a, b) => +new Date(a.starts) - +new Date(b.starts));
}
