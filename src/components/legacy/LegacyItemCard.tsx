import { Link } from "react-router-dom";
import type { Item } from "@/content/legacy/items";

interface LegacyItemCardProps {
  item: Item;
  variant?: "archive" | "directory";
  index?: number;
}

export default function LegacyItemCard({ item, variant = "archive", index = 0 }: LegacyItemCardProps) {
  const formattedDate = item.date ? new Date(item.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null;

  if (variant === "directory") {
    return (
      <article className="directory-listing">
        <div className="directory-listing__meta"><span>{String(index + 1).padStart(2, "0")}</span><span>{item.location}</span></div>
        <div className="directory-listing__identity"><h2><Link to={`/items/${item.id}`}>{item.title}</Link></h2><p>{item.description}</p></div>
        <div className="directory-listing__tags">{item.tags.slice(0, 4).map((tag) => <span key={`${item.id}-${tag}`}>{tag}</span>)}</div>
        <div className="directory-listing__actions"><Link to={`/items/${item.id}`}>Profile <span aria-hidden>↗</span></Link>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">Website <span aria-hidden>↗</span></a> : null}</div>
      </article>
    );
  }

  return (
    <article className="legacy-card">
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-subtle"><span>{item.type}</span><span className="h-1 w-1 rounded-full bg-white/25" aria-hidden /><span>{item.location}</span>{formattedDate ? <><span className="h-1 w-1 rounded-full bg-white/25" aria-hidden /><time dateTime={item.date ?? undefined}>{formattedDate}</time></> : null}</div>
      <h3 className="text-2xl font-semibold text-text-base"><Link to={`/items/${item.id}`} className="no-underline">{item.title}</Link></h3>
      <p>{item.description}</p>
      <div className="flex flex-wrap gap-2 text-xs text-brand-aurora">{item.tags.map((tag) => <span key={`${item.id}-${tag}`} className="legacy-tag">{tag}</span>)}</div>
      <div className="mt-auto flex flex-wrap gap-3"><Link to={`/items/${item.id}`} className="button button-ghost button-compact">View detail</Link>{item.url ? <a href={item.url} target="_blank" rel="noreferrer" className="button button-ghost button-compact">Visit website</a> : null}</div>
    </article>
  );
}
