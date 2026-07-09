interface ListingFiltersProps {
  tags: string[];
  locations: string[];
  selectedTag: string;
  selectedLocation: string;
  onTagChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onReset: () => void;
  variant?: "archive" | "directory";
}

export default function ListingFilters({
  tags,
  locations,
  selectedTag,
  selectedLocation,
  onTagChange,
  onLocationChange,
  onReset,
  variant = "archive"
}: ListingFiltersProps) {
  return (
    <div className={variant === "directory" ? "directory-filter-bar" : "legacy-filter-bar"}>
      <label className="legacy-filter">
        <span className="legacy-filter__label">Focus</span>
        <select value={selectedTag} onChange={(event) => onTagChange(event.target.value)} className={variant === "directory" ? "directory-filter__input" : "legacy-filter__input"}>
          <option value="all">All tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </label>

      <label className="legacy-filter">
        <span className="legacy-filter__label">Location</span>
        <select value={selectedLocation} onChange={(event) => onLocationChange(event.target.value)} className={variant === "directory" ? "directory-filter__input" : "legacy-filter__input"}>
          <option value="all">All locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className={variant === "directory" ? "directory-filter__reset" : "button button-ghost"} onClick={onReset}>Reset</button>
    </div>
  );
}
