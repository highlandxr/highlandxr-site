# HighlandXR Site

Static Astro site for HighlandXR with content collections for events, directory entries, and funding opportunities.

## Tech Stack

- Astro (static output)
- Astro content collections (Markdown)
- RSS feed route (`/rss.xml`)
- Generated sitemap route (`/sitemap.xml`)

## Project Structure

```text
src/
  content/
    events/
    directory/
    funding/
    config.ts
  layouts/
    BaseLayout.astro
  pages/
    index.astro
    events.astro
    events/[slug].astro
    directory.astro
    funding.astro
    submit.astro
    rss.xml.js
    sitemap.xml.ts
public/
  robots.txt
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start local dev server:

```bash
npm run dev
```

3. Build production static output:

```bash
npm run build
```

4. Preview the built site:

```bash
npm run preview
```

## Content Editing

- Add events in `src/content/events/*.md`
- Add directory entries in `src/content/directory/*.md`
- Add funding opportunities in `src/content/funding/*.md`

All content is validated through `src/content/config.ts`.
