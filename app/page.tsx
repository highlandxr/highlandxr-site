import ListingExperience from "@/components/ListingExperience";
import { getItemLocations, getItems, getItemTags } from "@/lib/items";

export default function HomePage() {
  const items = getItems().slice(0, 12);
  const tags = getItemTags(items);
  const locations = getItemLocations(items);

  return <ListingExperience items={items} tags={tags} locations={locations} />;
}
