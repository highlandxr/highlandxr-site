"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Item } from "@/lib/items";
import ItemCard from "./ItemCard";
import ListingFilters from "./ListingFilters";

const HighlandBackdrop = dynamic(() => import("./HighlandBackdrop"), {
  ssr: false,
  loading: () => null
});

interface ListingExperienceProps {
  items: Item[];
  tags: string[];
  locations: string[];
}

export default function ListingExperience({ items, tags, locations }: ListingExperienceProps) {
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const showBackdrop = false;
  const showCards = true;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const tagMatch = selectedTag === "all" || item.tags.includes(selectedTag);
      const locationMatch = selectedLocation === "all" || item.location === selectedLocation;
      return tagMatch && locationMatch;
    });
  }, [items, selectedTag, selectedLocation]);

  const filteredEvents = useMemo(() => filteredItems.filter((item) => item.type === "event"), [filteredItems]);
  const filteredBusinesses = useMemo(() => filteredItems.filter((item) => item.type === "business"), [filteredItems]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {showBackdrop ? <HighlandBackdrop /> : null}

      <main className="shell-container relative z-10 pb-24 pt-8 md:pt-10">
        <section id="immersive-screens" className="surface-glass relative min-h-[34vh] overflow-hidden p-6 md:min-h-[38vh] md:p-8">
          <div aria-hidden="true" className="contour-grid pointer-events-none absolute inset-0 opacity-20" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-aurora aurora-motion opacity-30" />

          <div className="relative z-10 mx-auto grid max-w-3xl justify-items-center gap-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-aurora">The Highlands Immersive Portal</p>
            <h1 className="text-5xl md:text-6xl">HiGHLAND XR</h1>
            <p className="max-w-2xl text-base text-text-muted md:text-lg">
              An index of events and businesses across the Highlands, Scotland.
              <span className="block">Explore what's going on below.</span>
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/submit-event" className="btn btn-primary">
                Submit an event
              </Link>
              <Link href="/submit-business" className="btn btn-secondary">
                Add a business
              </Link>
            </div>
          </div>
        </section>

        {showCards ? (
          <>
            <section id="filters" className="mt-8 grid gap-4 md:mt-10">
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

            <section className="mt-6 grid gap-6 lg:grid-cols-2" aria-live="polite">
              <div className="grid content-start gap-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-3xl">Events</h2>
                  <Link href="/events" className="btn btn-ghost">
                    View all events
                  </Link>
                </div>

                {filteredEvents.length === 0 ? (
                  <article className="surface-card grid gap-2 p-6 text-center">
                    <h3 className="text-2xl">No events match</h3>
                    <p>Try another tag or location combination.</p>
                  </article>
                ) : (
                  filteredEvents.map((item) => <ItemCard key={item.id} item={item} />)
                )}
              </div>

              <div className="grid content-start gap-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-3xl">Businesses</h2>
                  <Link href="/businesses" className="btn btn-ghost">
                    View all businesses
                  </Link>
                </div>

                {filteredBusinesses.length === 0 ? (
                  <article className="surface-card grid gap-2 p-6 text-center">
                    <h3 className="text-2xl">No businesses match</h3>
                    <p>Try another tag or location combination.</p>
                  </article>
                ) : (
                  filteredBusinesses.map((item) => <ItemCard key={item.id} item={item} />)
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
