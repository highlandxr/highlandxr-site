"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Item } from "@/lib/items";
import ListingFilters from "./ListingFilters";

const ImmersiveCanvas = dynamic(() => import("./ImmersiveCanvas"), {
  ssr: false,
  loading: () => null
});

interface ListingExperienceProps {
  items: Item[];
  tags: string[];
  locations: string[];
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function ListingExperience({ items, tags, locations }: ListingExperienceProps) {
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [shouldUseWebGL, setShouldUseWebGL] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMode = () => {
      setShouldUseWebGL(!mediaQuery.matches && supportsWebGL());
    };

    updateMode();
    mediaQuery.addEventListener("change", updateMode);

    return () => mediaQuery.removeEventListener("change", updateMode);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const tagMatch = selectedTag === "all" || item.tags.includes(selectedTag);
      const locationMatch = selectedLocation === "all" || item.location === selectedLocation;
      return tagMatch && locationMatch;
    });
  }, [items, selectedTag, selectedLocation]);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {!shouldUseWebGL ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 contour-grid opacity-60 [mask-image:radial-gradient(circle_at_50%_35%,black_38%,transparent_94%)]"
        />
      ) : null}
      {shouldUseWebGL ? <ImmersiveCanvas items={filteredItems} /> : null}

      <main className="shell-container relative z-10 pb-20 pt-8 md:pt-10">
        <section className="surface-glass relative min-h-[72vh] overflow-hidden p-6 md:p-10">
          <div aria-hidden="true" className="contour-grid pointer-events-none absolute inset-0 opacity-25" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-aurora opacity-35" />

          <div className="relative z-10 grid max-w-2xl gap-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-aurora">Scottish Highlands XR Portal</p>
            <h1 className="text-5xl md:text-6xl">The Highlands Are Being Scanned Into XR</h1>
            <p className="max-w-xl text-base text-text-muted md:text-lg">
              Scroll through depth-driven XR screens while exploring events and businesses shaping immersive work across the
              Highlands.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/submit-event" className="btn btn-primary">
                Submit an event
              </Link>
              <Link href="/submit-business" className="btn btn-secondary">
                Add a business
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="badge-pill border-brand-aurora/40 bg-brand-aurora/12 text-brand-aurora">
                {items.length} total listings
              </span>
              <span className="badge-pill border-brand-violet/40 bg-brand-violet/15 text-[#cfc5ff]">
                WebGL layer with HTML fallback
              </span>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:mt-14">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-subtle">Filter Listings</p>
            <h2 className="text-3xl md:text-4xl">Events and Businesses</h2>
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

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          {filteredItems.length === 0 ? (
            <article className="surface-card col-span-full grid gap-2 p-6 text-center">
              <h3 className="text-2xl">No listings match these filters</h3>
              <p>Try another tag or location combination.</p>
            </article>
          ) : (
            filteredItems.map((item) => (
              <article key={item.id} className="surface-card grid gap-4 p-5">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`badge-pill ${
                      item.type === "event"
                        ? "border-brand-violet/45 bg-brand-violet/18 text-[#cbc0ff]"
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
                <p>{item.description}</p>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <Link href={`/items/${item.id}`} className="btn btn-ghost">
                    View detail
                  </Link>
                  {item.date ? <span className="text-sm text-text-subtle">{new Date(item.date).toLocaleDateString("en-GB")}</span> : null}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
