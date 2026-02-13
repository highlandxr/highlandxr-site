import { getCollection } from "astro:content";

export async function GET({ site }: { site: URL | undefined }) {
  if (!site) {
    return new Response("Missing site URL for sitemap generation.", { status: 500 });
  }

  const events = await getCollection("events");
  const now = new Date().toISOString();

  const urls = [
    "/",
    "/events/",
    "/directory/",
    "/funding/",
    "/submit/",
    "/rss.xml",
    ...events.map((event) => `/events/${event.slug}/`)
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => {
    const loc = new URL(url, site).toString();
    return `  <url><loc>${loc}</loc><lastmod>${now}</lastmod></url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
