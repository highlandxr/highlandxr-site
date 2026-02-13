import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const events = await getCollection("events");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = [...events].sort((a, b) => {
    const aDate = new Date(a.data.date);
    const bDate = new Date(b.data.date);
    const aUpcoming = aDate.getTime() >= today.getTime();
    const bUpcoming = bDate.getTime() >= today.getTime();

    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    if (aUpcoming) return aDate.getTime() - bDate.getTime();
    return bDate.getTime() - aDate.getTime();
  });

  return rss({
    title: "HighlandXR Events",
    description: "Events and meetups from the HighlandXR network.",
    site: context.site,
    customData: "<language>en-gb</language>",
    items: sorted.map((event) => ({
      title: event.data.title,
      description: event.data.description,
      pubDate: event.data.date,
      link: `/events/${event.slug}/`,
      categories: [event.data.category, event.data.town]
    }))
  });
}
