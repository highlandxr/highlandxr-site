# HighlandXR Site

Static Astro site for HighlandXR with content collections for events, directory entries, and funding opportunities.

## Tech Stack

- Astro (static output)
- Tailwind CSS + PostCSS
- Astro content collections (Markdown)
- RSS feed route (`/rss.xml`)
- Generated sitemap route (`/sitemap.xml`)

## Brand Tokens

### Colors

- `surface.deep`: `#080b12` (near-black base background)
- `surface.charcoal`: `#101826` (charcoal secondary background)
- `surface.panel`: `#141f2f` (panel/card background)
- `text.base`: `#ebf2ff` (off-white primary text)
- `text.muted`: `#a8b7cc` (secondary text)
- `brand.aurora`: `#5ce3d7` (accent teal)
- `brand.violet`: `#9a7bff` (accent violet)
- `brand.highland`: `#8dbb9c` (subtle heather/highland green)

Defined in `tailwind.config.js` and mirrored in `src/styles/global.css` CSS variables.

### Fonts

- Headings: `Space Grotesk` (fallback `Sora`)
- Body/UI: `Inter`

Loaded in `src/layouts/BaseLayout.astro` and tokenized in `tailwind.config.js` as:

- `font-heading`
- `font-body`

### Button Style Rules

Buttons are centralized in `src/components/Button.astro` using shared `.btn` classes from `src/styles/global.css`.

- `primary`: teal/highland gradient, dark text, glow hover
- `secondary`: violet gradient, light text, violet glow hover
- `ghost`: transparent/dark glass background, subtle border, teal hover tint

Use:

```astro
<Button href="/events" variant="primary">Browse Events</Button>
<Button href="/submit" variant="secondary">Submit an Event</Button>
<Button type="button" variant="ghost">Reset Filters</Button>
```

### Updating Hero Artwork

Hero is implemented in `src/pages/index.astro` inside `#heroSurface`.

- Aurora glow: `div` with `bg-aurora`
- Topographic overlay: `div` with `topo-grid`
- Mouse-follow light: `div` with `hero-mouse-light` and script at bottom of the file
- Highland silhouette + wireframe: inline `<svg>` near the bottom of the hero section

To adjust look:

1. Edit gradient/stops in the hero `<svg>` paths.
2. Tune pattern density in `.topo-grid` inside `src/styles/global.css`.
3. Adjust cursor glow size/intensity in `.hero-mouse-light`.
4. Keep `prefers-reduced-motion` behavior intact for accessibility.

## Project Structure

```text
src/
  components/
    Badge.astro
    Button.astro
    Card.astro
    EmptyState.astro
    FeaturedEventCard.astro
    SectionHeader.astro
    StatCard.astro
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
  styles/
    global.css
tailwind.config.js
postcss.config.js
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
