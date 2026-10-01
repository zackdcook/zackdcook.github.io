export type PublicPostEmbed = { provider: "Instagram" | "Threads"; url: string; source: string };

// Only recognized public post paths get a frame. Other links stay ordinary links.
export function publicPostEmbed(source: string | null): PublicPostEmbed | null {
  if (!source) return null;
  try {
    const url = new URL(source);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "instagram.com") {
      const post = url.pathname.match(/^\/(p|reel)\/([A-Za-z0-9_-]{3,64})\/?$/);
      if (!post) return null;
      const canonical = `https://www.instagram.com/${post[1]}/${post[2]}/`;
      return { provider: "Instagram", source: canonical, url: `${canonical}embed/captioned/` };
    }
    if (host === "threads.com" || host === "threads.net") {
      const post = url.pathname.match(/^\/(?:@[A-Za-z0-9_.]{1,64}\/post|t)\/([A-Za-z0-9_-]{3,64})\/?$/);
      if (!post) return null;
      const canonical = `https://www.threads.com/t/${post[1]}/`;
      return { provider: "Threads", source: canonical, url: `${canonical}embed/` };
    }
  } catch { return null; }
  return null;
}
