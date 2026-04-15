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
}

export default function LegacyIndexPage({ eyebrow, title, description, items }: LegacyIndexPageProps) {
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

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

  return (
    <div className="shell-container pb-24 pt-24 md:pt-28">
      <section className="legacy-shell">
        <SectionHeading eyebrow={eyebrow} title={title} body={description} />
        <p className="legacy-note">
          These routes remain live as archive/network content while the main HighlandXR experience shifts toward a company and
          spatial studio site.
        </p>
        <ListingFilters
          tags={tags}
          locations={locations}
          selectedTag={selectedTag}
          selectedLocation={selectedLocation}
          onTagChange={setSelectedTag}
          onLocationChange={setSelectedLocation}
          onReset={() => {
            setSelectedTag("all");
            setSelectedLocation("all");
          }}
        />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => <LegacyItemCard key={item.id} item={item} />)
        ) : (
          <article className="legacy-card md:col-span-2 xl:col-span-3">
            <h3 className="text-2xl font-semibold text-text-base">No items match this filter set.</h3>
            <p>Try resetting the filters or selecting a wider combination of tags and locations.</p>
          </article>
        )}
      </section>
    </div>
  );
}
