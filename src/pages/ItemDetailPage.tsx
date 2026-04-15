import { Link, useParams } from "react-router-dom";
import { getItemById } from "@/content/legacy/items";

export default function ItemDetailPage() {
  const { id = "" } = useParams();
  const item = getItemById(id);

  if (!item) {
    return (
      <div className="shell-container pb-24 pt-24 md:pt-28">
        <section className="legacy-shell">
          <p className="eyebrow">Archive item</p>
          <h1 className="section-title">Listing not found.</h1>
          <p>The requested archive entry could not be found.</p>
          <Link to="/businesses" className="button button-ghost">
            Browse archive
          </Link>
        </section>
      </div>
    );
  }

  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString("en-GB", {
        dateStyle: "long"
      })
    : null;

  return (
    <div className="shell-container pb-24 pt-24 md:pt-28">
      <article className="legacy-shell">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-text-subtle">
          <span>{item.type}</span>
          <span className="h-1 w-1 rounded-full bg-white/25" aria-hidden />
          <span>{item.location}</span>
        </div>

        <div className="grid gap-4">
          <h1 className="section-title max-w-4xl">{item.title}</h1>
          <p className="max-w-3xl text-lg">{item.description}</p>
          {formattedDate ? <p className="text-sm text-text-subtle">Event date: {formattedDate}</p> : null}
        </div>

        <div className="soft-rule" />

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rich-copy">
            <p>{item.longDescription ?? item.description}</p>
          </section>

          <aside className="quiet-panel">
            <p className="eyebrow">Listing snapshot</p>
            <div className="grid gap-2 text-sm">
              <p>
                <strong className="text-text-base">Type:</strong> {item.type}
              </p>
              <p>
                <strong className="text-text-base">Location:</strong> {item.location}
              </p>
              <p>
                <strong className="text-text-base">Tags:</strong> {item.tags.join(", ")}
              </p>
            </div>
          </aside>
        </div>

        <div className="flex flex-wrap gap-3">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noreferrer" className="button button-primary">
              Visit website
            </a>
          ) : null}
          <a href="mailto:info@highlandxr.com" className="button button-secondary">
            Contact HighlandXR
          </a>
          <Link to={item.type === "event" ? "/events" : "/businesses"} className="button button-ghost">
            Back to archive
          </Link>
        </div>
      </article>
    </div>
  );
}
