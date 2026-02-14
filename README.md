# HighlandXR Portal (Next.js + R3F)

Premium, scroll-driven XR portal for the Scottish Highlands.

## Stack

- Next.js App Router
- Tailwind CSS
- Three.js via React Three Fiber
- `@react-three/drei` helpers

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```

`npm run start` serves the static `out/` directory for local preview.

## Cloudflare Pages (Static MVP)

This project is configured for static export with Next.js, so Cloudflare Pages can host it without a Node server runtime.

- Framework preset: `None` (or `Next.js`, if you prefer)
- Build command: `npm run build`
- Output directory: `out`
- Node.js version: `20` (recommended in Pages settings)
- Required env vars: none

Notes:
- All listings/details are generated at build time from `data/items.json`.
- WebGL is client-side presentation; SEO HTML is pre-rendered.

## Project Structure

```text
app/
  page.tsx                  # Homepage
  items/[id]/page.tsx       # SEO detail pages
  submit-event/page.tsx
  submit-business/page.tsx
  layout.tsx
components/
  ImmersiveBackground.tsx
  ImmersiveGallery.tsx
  ImmersiveCanvas.tsx
  ListingExperience.tsx
  ListingFilters.tsx
  DetailHeaderAccent.tsx
data/
  items.json                # Single source of truth for homepage/detail listings
lib/
  items.ts                  # Typed item helpers
```

## Homepage Rendering Model

- HTML remains the source of truth for crawlability and accessibility.
- A fixed fullscreen WebGL canvas is mounted behind content (`components/ImmersiveCanvas.tsx`).
- The 3D gallery and the HTML listing grid are both fed by `data/items.json`.
- Tag and location filters update both views together.
- If reduced motion is requested or WebGL is unavailable/low-power, the portal falls back to a high-quality 2D layout.

## How to Add/Edit Listings

All homepage panels and `/items/[id]` pages come from `data/items.json`.

Each item uses:

- `id` (slug, unique)
- `title`
- `type` (`event` or `business`)
- `location`
- `date` (`YYYY-MM-DD` for events, `null` for businesses)
- `tags` (e.g. `["VR", "AR", "MR"]`)
- `description`
- `longDescription` (optional but recommended)
- `image` (optional)
- `url` (optional external URL)

### Add a new listing

1. Add a new object in `data/items.json`.
2. Ensure `id` is unique and URL-safe.
3. Save and run `npm run build`.
4. The listing appears automatically on:
   - homepage HTML list
   - homepage 3D panel gallery
   - detail page at `/items/<id>`

## Accessibility and Fallbacks

- HTML content remains fully crawlable and indexable.
- WebGL is presentation only.
- If `prefers-reduced-motion` is enabled, or WebGL is unavailable, the portal falls back to a static, high-quality 2D presentation.
