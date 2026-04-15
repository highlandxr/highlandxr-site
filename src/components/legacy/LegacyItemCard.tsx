import { Link } from "react-router-dom";
import type { Item } from "@/content/legacy/items";

interface LegacyItemCardProps {
  item: Item;
}

export default function LegacyItemCard({ item }: LegacyItemCardProps) {
  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : null;

  return (
    <article className="legacy-card">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-subtle">
        <span>{item.type}</span>
        <span className="h-1 w-1 rounded-full bg-white/25" aria-hidden />
        <span>{item.location}</span>
        {formattedDate ? (
          <>
            <span className="h-1 w-1 rounded-full bg-white/25" aria-hidden />
            <time dateTime={item.date ?? undefined}>{formattedDate}</time>
          </>
        ) : null}
      </div>

      <h3 className="text-2xl font-semibold text-text-base">
        <Link to={`/items/${item.id}`} className="no-underline">
          {item.title}
        </Link>
      </h3>

      <p>{item.description}</p>

      <div className="flex flex-wrap gap-2 text-xs text-brand-aurora">
        {item.tags.map((tag) => (
          <span key={`${item.id}-${tag}`} className="legacy-tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap gap-3">
        <Link to={`/items/${item.id}`} className="button button-ghost button-compact">
          View detail
        </Link>
        {item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer" className="button button-ghost button-compact">
            Visit website
          </a>
        ) : null}
      </div>
    </article>
  );
}
