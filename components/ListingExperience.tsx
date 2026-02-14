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

function isLowPowerDevice() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory;
  const cores = nav.hardwareConcurrency ?? 8;

  if (typeof memory === "number" && memory <= 4) {
    return true;
  }

  return cores <= 4;
}

export default function ListingExperience({ items, tags, locations }: ListingExperienceProps) {
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [shouldUseWebGL, setShouldUseWebGL] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMode = () => {
      setShouldUseWebGL(!mediaQuery.matches && supportsWebGL() && !isLowPowerDevice());
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
          className="pointer-events-none fixed inset-0 z-0 contour-grid opacity-65 [mask-image:radial-gradient(circle_at_52%_38%,black_40%,transparent_94%)]"
        />
      ) : null}
      {shouldUseWebGL ? <ImmersiveCanvas items={filteredItems} /> : null}

      <main className="shell-container relative z-10 pb-24 pt-8 md:pt-10">
        <section className="surface-glass relative min-h-[68vh] overflow-hidden p-6 md:min-h-[72vh] md:p-10">
          <div aria-hidden="true" className="contour-grid pointer-events-none absolute inset-0 opacity-20" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-aurora aurora-motion opacity-30" />

          <div className="relative z-10 grid max-w-3xl gap-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-aurora">Immersive Highlands Portal</p>
            <h1 className="text-5xl md:text-6xl">The Highlands Are Being Scanned Into XR</h1>
            <p className="max-w-2xl text-base text-text-muted md:text-lg">
              A cinematic index of Highland XR events and businesses. Explore the same listing data through an indexable HTML portal and an
              immersive 3D scanfield.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/submit-event" className="btn btn-primary">
                Submit an event
              </Link>
              <Link href="/submit-business" className="btn btn-secondary">
                Add a business
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="badge-pill border-brand-aurora/35 bg-brand-aurora/10 text-brand-aurora">
                {filteredItems.length} visible listings
              </span>
              <span className="badge-pill border-white/15 bg-white/[0.03] text-text-muted">Dark cinematic mode</span>
              <span className="badge-pill border-brand-violet/30 bg-brand-violet/12 text-[#ccc3ff]">
                {shouldUseWebGL ? "3D scan layer active" : "Static fallback active"}
              </span>
            </div>
          </div>
        </section>

        {shouldUseWebGL ? (
          <section className="pointer-events-none relative mt-10 min-h-[160vh] md:min-h-[190vh]" aria-label="Immersive scan corridor">
            <div className="scanfield-overlay absolute inset-0 rounded-panel border border-white/10 bg-black/10" />
            <div className="sticky top-20 grid min-h-[72vh] gap-4 p-4 md:grid-cols-[1fr_auto] md:p-8">
              <div className="self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-subtle">Scanfield</p>
                <p className="mt-2 max-w-md text-sm text-text-muted">
                  Scroll through depth-shifted XR screens. The panel nearest center is in focus and can be opened directly.
                </p>
              </div>

              <aside className="pointer-events-auto surface-glass h-fit max-w-sm self-end p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-aurora">Live Feed</p>
                <p className="mt-2 text-sm text-text-muted">
                  Listing filters below update this 3D sequence in real time. Use mouse movement for subtle parallax.
                </p>
              </aside>
            </div>
          </section>
        ) : null}

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
              <article
                key={item.id}
                className={`surface-card grid gap-4 p-5 transition-colors duration-300 ${
                  shouldUseWebGL ? "bg-surface-charcoal/45" : "bg-surface-charcoal/70"
                }`}
              >
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
                  {item.date ? <span className="text-xs text-text-subtle">{new Date(item.date).toLocaleDateString("en-GB")}</span> : null}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
