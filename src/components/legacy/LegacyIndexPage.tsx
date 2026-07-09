import { useMemo, useState } from "react";
import type { Item } from "@/content/legacy/items";
import { getItemLocations, getItemTags } from "@/content/legacy/items";
import SectionHeading from "@/components/SectionHeading";
import LegacyItemCard from "@/components/legacy/LegacyItemCard";
import ListingFilters from "@/components/legacy/ListingFilters";

interface LegacyIndexPageProps {
  eyebrow: string;
  title: string;
  description: string;
  items: Item[];
  variant?: "archive" | "directory";
}

export default function LegacyIndexPage({ eyebrow, title, description, items, variant = "archive" }: LegacyIndexPageProps) {
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const isDirectory = variant === "directory";

  const tags = useMemo(() => getItemTags(items), [items]);
  const locations = useMemo(() => getItemLocations(items), [items]);
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesTag = selectedTag === "all" || item.tags.includes(selectedTag);
        const matchesLocation = selectedLocation === "all" || item.location === selectedLocation;
        return matchesTag && matchesLocation;
      }),
    [items, selectedLocation, selectedTag]
  );

  const resetFilters = () => {
    setSelectedTag("all");
    setSelectedLocation("all");
  };

  if (!isDirectory) {
    return (
      <div className="shell-container pb-24 pt-24 md:pt-28">
        <section className="legacy-shell">
          <SectionHeading eyebrow={eyebrow} title={title} body={description} />
          <p className="legacy-note">These routes remain live as archive/network content while the main HighlandXR experience shifts toward a company and spatial studio site.</p>
          <ListingFilters tags={tags} locations={locations} selectedTag={selectedTag} selectedLocation={selectedLocation} onTagChange={setSelectedTag} onLocationChange={setSelectedLocation} onReset={resetFilters} />
        </section>
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          {filteredItems.length > 0 ? filteredItems.map((item) => <LegacyItemCard key={item.id} item={item} />) : <EmptyArchiveState />}
        </section>
      </div>
    );
  }

  return (
    <div className="directory-page">
      <div className="directory-landscape" aria-hidden />
      <div className="shell-container directory-page__content">
        <section className="directory-hero">
          <div className="directory-hero__copy">
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <aside className="directory-hero__index">
            <span>Directory refresh</span>
            <strong>{String(filteredItems.length).padStart(2, "0")}</strong>
            <p>organisations in view</p>
            <small>Reviewed · July 2026</small>
          </aside>
        </section>

        <section className="directory-controls" aria-label="Directory filters">
          <div><span className="section-index">Filter the field</span><p>Browse by technology focus or place.</p></div>
          <ListingFilters tags={tags} locations={locations} selectedTag={selectedTag} selectedLocation={selectedLocation} onTagChange={setSelectedTag} onLocationChange={setSelectedLocation} onReset={resetFilters} variant="directory" />
        </section>

        <section className="directory-list" aria-live="polite">
          <div className="directory-list__heading"><span>Directory / {String(filteredItems.length).padStart(2, "0")} results</span><span>Place, practice, and project</span></div>
          {filteredItems.length > 0 ? filteredItems.map((item, index) => <LegacyItemCard key={item.id} item={item} variant="directory" index={index} />) : <EmptyDirectoryState />}
        </section>
      </div>
    </div>
  );
}

function EmptyArchiveState() {
  return <article className="legacy-card md:col-span-2 xl:col-span-3"><h3 className="text-2xl font-semibold text-text-base">No items match this filter set.</h3><p>Try resetting the filters or selecting a wider combination of tags and locations.</p></article>;
}

function EmptyDirectoryState() {
  return <article className="directory-empty"><p className="eyebrow">Nothing in this view</p><h2>Try a different place or focus.</h2></article>;
}
