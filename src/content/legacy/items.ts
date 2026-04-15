import itemsData from "@data/items.json";

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

export function getItems() {
  return itemsData as Item[];
}

export function getItemById(id: string) {
  return getItems().find((item) => item.id === id);
}

export function getItemsByType(type: ItemType) {
  return getItems().filter((item) => item.type === type);
}

export function getItemTags(items: Item[]) {
  return [...new Set(items.flatMap((item) => item.tags))].sort((left, right) => left.localeCompare(right));
}

export function getItemLocations(items: Item[]) {
  return [...new Set(items.map((item) => item.location))].sort((left, right) => left.localeCompare(right));
}
