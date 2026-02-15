import type { Metadata } from "next";
import FilteredTypePage from "@/components/FilteredTypePage";
import { getItems } from "@/lib/items";

export const metadata: Metadata = {
  title: "Events | HighlandXR",
  description: "Browse Highlands XR events by tag and location."
};

export default function EventsPage() {
  const eventItems = getItems().filter((item) => item.type === "event");

  return (
    <FilteredTypePage
      title="Events"
      description="Find upcoming XR meetups, workshops, and showcases across the Highlands."
      items={eventItems}
      emptyTitle="No events match these filters"
      emptyDescription="Try resetting filters or selecting a different tag and location."
    />
  );
}
