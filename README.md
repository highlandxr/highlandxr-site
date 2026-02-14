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
- Output directory (recommended): `out`
- Output directory (legacy-safe): `dist`
- Node.js version: `20` (recommended in Pages settings)
- Required env vars: none

Notes:
- All listings/details are generated at build time from `data/items.json`.
- WebGL is client-side presentation; SEO HTML is pre-rendered.
- Build also mirrors `out/` into `dist/` so existing Pages projects still pointing at `dist` continue to deploy the new site.

## Project Structure

```text
app/
  page.tsx                  # Homepage
  items/[id]/page.tsx       # SEO detail pages
  submit-event/page.tsx
  submit-business/page.tsx
  layout.tsx
components/
  HighlandBackdrop.tsx
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
- A fixed fullscreen WebGL backdrop is mounted behind homepage content (`components/HighlandBackdrop.tsx`).
- The backdrop uses `/public/loch.png` as its single source image, with a darkened base pass, wireframe displacement overlay, and night sky/aurora shader.
- If reduced motion is requested or WebGL is unavailable, the portal falls back to a static darkened background image.

## Backdrop Tuning

### Swap the background image

1. Replace `public/loch.png` with your new source image.
2. Keep a wide aspect ratio (16:9 recommended) to preserve framing.
3. Rebuild (`npm run build`) to verify the static export output.

### Tweak aurora intensity

Adjust the `AURORA_INTENSITY` constant in `components/HighlandBackdrop.tsx`:

- Lower values (`0.2` to `0.35`) for subtler aurora.
- Higher values (`0.45` to `0.6`) for stronger bands.

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
   - homepage filtered listing grid
   - detail page at `/items/<id>`

## Accessibility and Fallbacks

- HTML content remains fully crawlable and indexable.
- WebGL is presentation only.
- If `prefers-reduced-motion` is enabled, or WebGL is unavailable, the portal falls back to a static, high-quality 2D presentation.
