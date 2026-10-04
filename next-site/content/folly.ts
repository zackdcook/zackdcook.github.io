import entries from "./folly.json";

export type FollyQuote = { id: string; text: string; date: string };
// Append a new quote to folly.json. On equal dates, the last entry is newest.
export const follyQuotes: FollyQuote[] = [...entries].sort((a, b) => a.date.localeCompare(b.date));
export const latestFolly = follyQuotes.at(-1)!;
export const leafPalettes = [
  { leaf: "#E88F93", ink: "#393313" },
  { leaf: "#393313", ink: "#FFF8ED" },
  { leaf: "#31031F", ink: "#E88F93" },
  { leaf: "#66693E", ink: "#31031F" },
] as const;
