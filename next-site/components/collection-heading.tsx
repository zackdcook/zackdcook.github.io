import type { ReactNode } from "react";

export function CollectionHeading({ children, level = 2, className = "" }: { children: ReactNode; level?: 1 | 2; className?: string }) {
  const Heading = level === 1 ? "h1" : "h2";
  return <Heading className={`collection-heading ${level === 2 ? "section-label" : ""} ${className}`}>{children}</Heading>;
}

export function InspirationHeading({ level = 2 }: { level?: 1 | 2 }) {
  return <CollectionHeading level={level} className="inspiration-heading">
    Things That Make You Go “Hmm…” for $500
  </CollectionHeading>;
}
