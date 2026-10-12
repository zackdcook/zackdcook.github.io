/** Aliases go directly to the URLs used in navigation, metadata and sitemap. */
export const canonicalRedirects = [
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/creative-works", destination: "/creativeworks", permanent: true },
  { source: "/about-me", destination: "/aboutme", permanent: true },
  { source: "/writing", destination: "/creativeworks", permanent: true },
  { source: "/about", destination: "/aboutme", permanent: true },
  { source: "/bio.html", destination: "/aboutme", permanent: true },
  { source: "/about.html", destination: "/aboutme", permanent: true },
  { source: "/works.html", destination: "/creativeworks", permanent: true },
  { source: "/writing.html", destination: "/creativeworks", permanent: true },
  { source: "/blog/index.html", destination: "/words-of-folly", permanent: true },
  { source: "/field-notes.html", destination: "/words-of-folly", permanent: true },
  { source: "/blog/its-not-too-late.html", destination: "/words-of-folly", permanent: true },
  { source: "/beta.html", destination: "/creativeworks", permanent: false },
];
