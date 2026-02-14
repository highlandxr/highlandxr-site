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
