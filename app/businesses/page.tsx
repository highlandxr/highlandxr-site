import type { Metadata } from "next";
import FilteredTypePage from "@/components/FilteredTypePage";
import { getItems } from "@/lib/items";

export const metadata: Metadata = {
  title: "Businesses | HighlandXR",
  description: "Browse Highlands XR businesses by tag and location."
};

export default function BusinessesPage() {
  const businessItems = getItems().filter((item) => item.type === "business");

  return (
    <FilteredTypePage
      title="Businesses"
      description="Explore studios, venues, and organisations working with XR across the Highlands."
      items={businessItems}
      emptyTitle="No businesses match these filters"
      emptyDescription="Try resetting filters or selecting a different tag and location."
    />
  );
}
