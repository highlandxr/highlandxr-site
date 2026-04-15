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
    <div className="legacy-filter-bar">
      <label className="legacy-filter">
        <span className="legacy-filter__label">Tag</span>
        <select value={selectedTag} onChange={(event) => onTagChange(event.target.value)} className="legacy-filter__input">
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
        <select value={selectedLocation} onChange={(event) => onLocationChange(event.target.value)} className="legacy-filter__input">
          <option value="all">All locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="button button-ghost" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}
