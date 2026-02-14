import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DetailHeaderAccent from "@/components/DetailHeaderAccent";
import { getItemById, getItems } from "@/lib/items";

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getItems().map((item) => ({ id: item.id }));
}

export async function generateMetadata({ params }: ItemDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getItemById(id);
  if (!item) return {};

  return {
    title: `${item.title} | HighlandXR`,
    description: item.description,
    alternates: {
      canonical: `/items/${item.id}`
    },
    openGraph: {
      title: `${item.title} | HighlandXR`,
      description: item.description,
      type: "article",
      url: `https://highlandxr.com/items/${item.id}`
    }
  };
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const item = getItemById(id);

  if (!item) {
    notFound();
  }

  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString("en-GB", {
        dateStyle: "long"
      })
    : null;

  return (
    <div className="shell-container pb-20 pt-8 md:pt-10">
      <article className="surface-glass grid gap-8 p-6 md:p-8">
        <header className="grid gap-5">
          <div className="flex flex-wrap gap-2">
            <span
              className={`badge-pill ${
                item.type === "event"
                  ? "border-brand-violet/45 bg-brand-violet/18 text-[#cdc3ff]"
                  : "border-brand-highland/35 bg-brand-highland/14 text-brand-highland"
              }`}
            >
              {item.type}
            </span>
            <span className="badge-pill border-white/20 bg-white/[0.03] text-text-muted">{item.location}</span>
            {item.tags.map((tag) => (
              <span key={`${item.id}-${tag}`} className="badge-pill border-brand-aurora/30 bg-brand-aurora/10 text-brand-aurora">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid gap-3">
            <h1 className="max-w-4xl text-4xl md:text-5xl">{item.title}</h1>
            <p className="max-w-3xl text-base md:text-lg">{item.description}</p>
            {formattedDate ? (
              <p className="text-sm text-text-subtle">
                Event date <time dateTime={item.date ?? undefined}>{formattedDate}</time>
              </p>
            ) : null}
          </div>
        </header>

        <DetailHeaderAccent />

        <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
          <section className="grid gap-3">
            <h2 className="text-2xl">Overview</h2>
            <p className="leading-relaxed">{item.longDescription ?? item.description}</p>
          </section>

          <aside className="surface-card grid gap-3 p-4">
            <h2 className="text-lg">Listing Snapshot</h2>
            <dl className="grid gap-2 text-sm text-text-muted">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-text-subtle">Type</dt>
                <dd className="text-text-base">{item.type}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-text-subtle">Location</dt>
                <dd className="text-text-base">{item.location}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-text-subtle">Tags</dt>
                <dd className="text-right text-text-base">{item.tags.join(", ")}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <div className="flex flex-wrap gap-3">
          {item.url ? (
            <a href={item.url} className="btn btn-primary" target="_blank" rel="noreferrer noopener">
              Visit website
            </a>
          ) : null}
          <a href="mailto:info@highlandxr.com" className="btn btn-secondary">
            Contact HighlandXR
          </a>
          <Link href="/" className="btn btn-ghost">
            Back to portal
          </Link>
        </div>
      </article>
    </div>
  );
}
