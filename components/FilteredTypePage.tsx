"use client";

import { useMemo, useState } from "react";
import type { Item } from "@/lib/items";
import ItemCard from "./ItemCard";
import ListingFilters from "./ListingFilters";

interface FilteredTypePageProps {
  title: string;
  description: string;
  items: Item[];
  emptyTitle: string;
  emptyDescription: string;
}

export default function FilteredTypePage({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription
}: FilteredTypePageProps) {
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const tags = useMemo(() => [...new Set(items.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b)), [items]);
  const locations = useMemo(() => [...new Set(items.map((item) => item.location))].sort((a, b) => a.localeCompare(b)), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const tagMatch = selectedTag === "all" || item.tags.includes(selectedTag);
      const locationMatch = selectedLocation === "all" || item.location === selectedLocation;
      return tagMatch && locationMatch;
    });
  }, [items, selectedTag, selectedLocation]);

  return (
    <div className="shell-container pb-20 pt-8 md:pt-10">
      <section className="surface-glass grid gap-5 p-6 md:p-8">
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-aurora">Highland XR Listings</p>
          <h1 className="text-4xl md:text-5xl">{title}</h1>
          <p className="max-w-3xl text-text-muted">{description}</p>
        </div>

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

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        {filteredItems.length === 0 ? (
          <article className="surface-card col-span-full grid gap-2 p-6 text-center">
            <h2 className="text-2xl">{emptyTitle}</h2>
            <p>{emptyDescription}</p>
          </article>
        ) : (
          filteredItems.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </section>
    </div>
  );
}
