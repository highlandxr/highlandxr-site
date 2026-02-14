"use client";

interface ListingFiltersProps {
  tags: string[];
  locations: string[];
  selectedTag: string;
  selectedLocation: string;
  onTagChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onReset: () => void;
}

export default function ListingFilters({
  tags,
  locations,
  selectedTag,
  selectedLocation,
  onTagChange,
  onLocationChange,
  onReset
}: ListingFiltersProps) {
  return (
    <section className="surface-glass grid gap-4 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end md:p-5" aria-label="Listing filters">
      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">Tag</span>
        <select
          value={selectedTag}
          onChange={(event) => onTagChange(event.target.value)}
          className="rounded-pill border border-white/20 bg-surface-charcoal px-4 py-2.5 text-sm text-text-base"
        >
          <option value="all">All tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">Location</span>
        <select
          value={selectedLocation}
          onChange={(event) => onLocationChange(event.target.value)}
          className="rounded-pill border border-white/20 bg-surface-charcoal px-4 py-2.5 text-sm text-text-base"
        >
          <option value="all">All locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="btn btn-ghost h-fit" onClick={onReset}>
        Reset filters
      </button>
    </section>
  );
}
