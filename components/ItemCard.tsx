import Link from "next/link";
import type { Item } from "@/lib/items";

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const formattedDate = item.date ? new Date(item.date).toLocaleDateString("en-GB") : null;
  const typeLabel = item.type === "event" ? "Event" : "Business";
  const metaChipClass =
    "inline-flex items-center gap-1.5 rounded-md bg-black/20 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-text-subtle ring-1 ring-inset ring-white/8";
  const typeChipClass =
    item.type === "event"
      ? `${metaChipClass} bg-brand-violet/12 text-[#ddd3ff] ring-brand-violet/18`
      : `${metaChipClass} bg-brand-highland/10 text-[#bcdcc6] ring-brand-highland/18`;
  const tagChipClass =
    "inline-flex items-center rounded-md bg-brand-aurora/[0.08] px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.08em] text-brand-aurora/90 ring-1 ring-inset ring-brand-aurora/12";

  return (
    <article className="surface-card grid gap-4 bg-surface-charcoal/70 p-5 transition-colors duration-300">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={typeChipClass}>
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-sm ${item.type === "event" ? "bg-brand-violet" : "bg-brand-highland"}`}
          />
          {typeLabel}
        </span>
        <span className={metaChipClass}>
          <span aria-hidden className="h-1 w-1 rounded-full bg-white/35" />
          {item.location}
        </span>
        {item.tags.slice(0, 2).map((tag) => (
          <span key={`${item.id}-${tag}`} className={tagChipClass}>
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
