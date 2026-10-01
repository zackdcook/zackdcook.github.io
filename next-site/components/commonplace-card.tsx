import Image from "next/image";
import type { CommonplaceEntry } from "@/content/site";
import { sourceName } from "@/lib/validation";

export function CommonplaceCard({ entry }: { entry: CommonplaceEntry }) {
  return (
    <article
      className={`commonplace-card ${entry.image_url ? "" : "link-card"}`}
    >
      {entry.image_url && (
        <div className="commonplace-image">
          <Image
            src={entry.image_url}
            alt={entry.title}
            width={640}
            height={640}
            sizes="(max-width: 740px) 45vw, 30vw"
            unoptimized={!entry.image_url.startsWith("/images/")}
          />
        </div>
      )}
      <div className="commonplace-copy">
        <p className="eyebrow">{entry.category}</p>
        <h3>{entry.title}</h3>
        {entry.note && <p>{entry.note}</p>}
        <p className="source">
          {entry.creator && <>{entry.creator} · </>}
          {entry.source_url ? (
            <a
              href={entry.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {sourceName(entry.source_url)} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            sourceName(null)
          )}
        </p>
      </div>
    </article>
  );
}
