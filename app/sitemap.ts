import type { MetadataRoute } from "next";
import { getItems } from "@/lib/items";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://highlandxr.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/businesses`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/submit-event`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/submit-business`, lastModified: now, changeFrequency: "monthly", priority: 0.6 }
  ];

  const itemRoutes: MetadataRoute.Sitemap = getItems().map((item) => ({
    url: `${base}/items/${item.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  return [...staticRoutes, ...itemRoutes];
}
