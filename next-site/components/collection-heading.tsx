import type { ReactNode } from "react";

export function CollectionHeading({ children, level = 2, className = "" }: { children: ReactNode; level?: 1 | 2; className?: string }) {
  const Heading = level === 1 ? "h1" : "h2";
  return <Heading className={`collection-heading ${className}`}>{children}</Heading>;
}

export function InspirationHeading({ level = 2 }: { level?: 1 | 2 }) {
  return <CollectionHeading level={level} className="inspiration-heading">
    I’ll take <em>Things that make you go “Hmm…”</em> for $500, Alex.
  </CollectionHeading>;
}
