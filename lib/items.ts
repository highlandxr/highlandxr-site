import itemsData from "@/data/items.json";

export type ItemType = "event" | "business";

export interface Item {
  id: string;
  title: string;
  type: ItemType;
  location: string;
  date: string | null;
  tags: string[];
  description: string;
  longDescription?: string;
  image?: string | null;
  url?: string | null;
}

export function getItems(): Item[] {
  return itemsData as Item[];
}

export function getItemById(id: string): Item | undefined {
  return getItems().find((item) => item.id === id);
}

export function getItemTags(items: Item[]): string[] {
  return [...new Set(items.flatMap((item) => item.tags))].sort((a, b) => a.localeCompare(b));
}

export function getItemLocations(items: Item[]): string[] {
  return [...new Set(items.map((item) => item.location))].sort((a, b) => a.localeCompare(b));
}
