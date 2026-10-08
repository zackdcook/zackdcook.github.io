import { site } from "@/content/site";
import { follyQuotes } from "@/content/folly";

const escape = (value: string) => value.replace(/[<>&"']/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);

export function GET() {
  const items = [...follyQuotes].reverse().map(post => {
    const url = `${site.url}/words-of-folly#leaf-${encodeURIComponent(post.id)}`;
    return `<item><title>${escape(post.text)}</title><link>${escape(url)}</link><guid isPermaLink="true">${escape(url)}</guid><pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate><description>${escape(post.text)}</description></item>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>Zack Cook — Words of Folly</title><link>${site.url}/words-of-folly</link>
<description>Small reminders from Zack Cook’s writing pile</description><language>en-us</language>
<atom:link href="${site.url}/words-of-folly/feed.xml" rel="self" type="application/rss+xml"/>
${items}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=3600" } });
}
