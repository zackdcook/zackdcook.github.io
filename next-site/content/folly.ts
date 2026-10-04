import entries from "./folly.json";

export type FollyQuote = { id: string; text: string; date: string };
// Append a new quote to folly.json. On equal dates, the last entry is newest.
export const follyQuotes: FollyQuote[] = [...entries].sort((a, b) => a.date.localeCompare(b.date));
export const latestFolly = follyQuotes.at(-1)!;
