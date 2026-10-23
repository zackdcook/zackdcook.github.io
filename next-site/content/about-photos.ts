export type AboutMemory = { id: string; src: string | null; alt: string; width: number; height: number };

// Null slots preserve the requested story positions until those photos arrive.
export const aboutMemories: readonly AboutMemory[] = [
  { id: "family", src: "/images/about/family.webp", alt: "A family of four together", width: 450, height: 342 },
  { id: "high-school", src: null, alt: "", width: 0, height: 0 },
  { id: "graduation", src: "/images/about/high-school-graduation.webp", alt: "Zack in his high school graduation gown with four children", width: 1027, height: 1536 },
  { id: "uf", src: "/images/about/zack-and-jennifer.webp", alt: "Zack and Jennifer together during their UF years", width: 284, height: 213 },
  { id: "gator", src: "/images/about/gator-chomp.webp", alt: "Zack doing the Gator chomp on an alligator statue at graduation", width: 1152, height: 1536 },
  { id: "buffalo", src: "/images/about/buffalo-pedal-tour.webp", alt: "A group gathered beside a Buffalo Pedal Tours bicycle", width: 1536, height: 1152 },
  { id: "welcome-home", src: "/images/about/welcome-home.webp", alt: "Handwritten welcome-home messages for Zack on a whiteboard", width: 1536, height: 953 },
  { id: "today", src: "/images/about/cats-by-window.webp", alt: "Chemi, Tashi, and Brave resting by the window beside Zack’s writing", width: 1400, height: 1277 },
];
