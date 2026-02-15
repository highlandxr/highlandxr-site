import Link from "next/link";
import type { Item } from "@/lib/items";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const formattedDate = item.date ? new Date(item.date).toLocaleDateString("en-GB") : null;

  return (
    <article className="surface-card grid gap-4 bg-surface-charcoal/70 p-5 transition-colors duration-300">
      <div className="flex flex-wrap gap-2">
        <span
          className={`badge-pill ${
            item.type === "event"
              ? "border-brand-violet/40 bg-brand-violet/16 text-[#c8bdff]"
              : "border-brand-highland/35 bg-brand-highland/14 text-brand-highland"
          }`}
        >
          {item.type}
        </span>
        <span className="badge-pill border-white/20 bg-white/[0.03] text-text-muted">{item.location}</span>
        {item.tags.slice(0, 2).map((tag) => (
          <span key={`${item.id}-${tag}`} className="badge-pill border-brand-aurora/30 bg-brand-aurora/10 text-brand-aurora">
            {tag}
          </span>
        ))}
      </div>

      <h3 className="text-2xl">
        <Link href={`/items/${item.id}`} className="no-underline">
          {item.title}
        </Link>
      </h3>

      <p className="text-sm leading-relaxed text-text-muted">{item.description}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <Link href={`/items/${item.id}`} className="btn btn-ghost">
          View detail
        </Link>
        {item.url ? (
          <a href={item.url} className="btn btn-ghost" target="_blank" rel="noreferrer noopener">
            Website
          </a>
        ) : null}
        {formattedDate ? <span className="text-xs text-text-subtle">{formattedDate}</span> : null}
      </div>
    </article>
  );
}
