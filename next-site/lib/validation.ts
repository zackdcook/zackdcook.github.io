export function safeReturnPath(
  value: string | null | undefined,
  fallback = "/admin",
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  )
    return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (
      decoded.startsWith("//") ||
      decoded.includes("\\") ||
      /[\u0000-\u001f]/.test(decoded)
    )
      return fallback;
  } catch {
    return fallback;
  }
  return value;
}

export function normalizeSharedUrl(raw: string) {
  // Handles both Copy Link and the text that iOS Share Sheet supplies.
  const candidate = raw.trim().match(/https:\/\/[^\s<>"']+/)?.[0];
  if (!candidate) throw new Error("Add a full https:// link.");
  const url = new URL(candidate);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !url.hostname.includes(".") ||
    url.hostname === "localhost" ||
    /^\d+(\.\d+){3}$/.test(url.hostname) ||
    url.hostname.endsWith(".local")
  )
    throw new Error("Use a public https:// link.");
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|igsh|fbclid|gclid|si$)/i.test(key))
      url.searchParams.delete(key);
  }
  url.hash = "";
  if (url.href.length > 2048) throw new Error("That link is too long.");
  return url.href;
}

export function sourceName(url: string | null) {
  if (!url) return "From my camera roll";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "instagram.com") return "Instagram";
    if (host === "threads.com" || host === "threads.net") return "Threads";
    if (host.endsWith("pinterest.com") || host === "pin.it") return "Pinterest";
    if (host === "open.spotify.com") return "Spotify";
    return host;
  } catch {
    return "Original source";
  }
}

export function progressRatio(value: number, target: number | null) {
  return target && target > 0 ? Math.max(0, Math.min(1, value / target)) : 0;
}

export function validateEntry(data: Record<string, unknown>) {
  const source_url = normalizeSharedUrl(String(data.url ?? ""));
  const title = String(data.title ?? "").trim();
  const note = String(data.note ?? "").trim();
  const creator = String(data.creator ?? "").trim();
  const category = String(data.category ?? "inspiration");
  if (!title || title.length > 160)
    throw new Error("Use a title between 1 and 160 characters.");
  if (note.length > 2000 || creator.length > 120)
    throw new Error("Shorten the note or creator name.");
  if (!["inspiration", "reading", "music", "life"].includes(category))
    throw new Error("Choose one of the listed categories.");
  return {
    source_url,
    title,
    note,
    creator: creator || null,
    category,
    status: "published",
  };
}
