import { journalPost } from "@/content/site";

export function GET() {
  const escape = (text: string) =>
    text.replace(
      /[<>&"']/g,
      (c) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&apos;",
        })[c]!,
    );
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Zack Cook — Journal</title><link>https://zackdcook.com/journal</link><description>Writing updates and notes from Zack Cook</description><item><title>${escape(journalPost.title)}</title><link>https://zackdcook.com/journal/${journalPost.slug}</link><guid>https://zackdcook.com/journal/${journalPost.slug}</guid><pubDate>Mon, 20 Oct 2025 12:00:00 GMT</pubDate><description>${escape(journalPost.excerpt)}</description></item></channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
