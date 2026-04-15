# HighlandXR Phase 1

Phase 1 turns HighlandXR into a premium company site with a modular 3D hero, HTML-first fallback structure, and clear seams for future Spark and Marble integration.

## Stack

- React 19
- Vite 7
- React Router
- Tailwind CSS
- Three.js via React Three Fiber
- `@react-three/drei`

## Local Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

`npm run build` produces a static `dist/` directory with prerendered HTML for the homepage, archive routes, and item detail pages.

## How the New Structure Works

```text
src/
  app/
    App.tsx                 # Router + app shell
    AppShell.tsx            # Header, footer, skip link
    routes.tsx              # Route components + metadata + prerender route list
    metadata/               # Client-side metadata updates
  components/
    home/                   # Homepage DOM sections
    legacy/                 # Retained archive UI
  content/
    homepage.ts             # Structured homepage copy/config
    heroScene.ts            # Active hero environment + future asset source config
    legacy/items.ts         # Typed archive data helpers from data/items.json
  motion/
    Reveal.tsx              # Scroll-in reveal system
    useHeroScrollProgress.ts
    usePrefersReducedMotion.ts
  pages/                    # Route-level page components
  scene/
    core/                   # Scene viewport + canvas mounting
    elements/               # Atmosphere, haze, terrain, light field
    environments/           # Active environment modules
    future/                 # Spark / Marble / world-panel placeholders
    systems/                # Camera rig, pointer drift, motion gating
```

## Rendering and Prerendering

- `src/entry-client.tsx` hydrates the React app in the browser.
- `src/entry-server.tsx` renders routes to HTML for static prerendering.
- `scripts/prerender.mjs` converts the SSR output into route-specific HTML files in `dist/`.
- Current prerendered routes:
  - `/`
  - `/events`
  - `/businesses`
  - `/submit-event`
  - `/submit-business`
  - `/items/:id` for every item in `data/items.json`

## 3D Scene Architecture

- The homepage hero keeps DOM content as the semantic source of truth.
- `SceneViewport` handles mount timing, reduced-motion logic, and safe fallback rendering if WebGL fails.
- `SceneCanvas` mounts the active environment module and shared scene systems.
- `content/heroScene.ts` defines which environment is active and where future Spark/Marble sources will plug in.
- `environmentRegistry.ts` resolves the active environment module and keeps the swap boundary between page shell and scene implementation.
- `useSceneCapability` disables the live scene on reduced-motion or lower-power devices so the site still behaves as a polished 2D experience.
- `useSceneCapability` now returns a capability profile with `low` / `medium` / `high` quality tiers based on motion preferences, device/network signals, and viewport size.
- `useSceneActivity` pauses the scene when the tab is hidden or the hero is effectively offscreen, which keeps runtime cost down after the first viewport.
- `HomeHero` defers loading the scene chunk until idle time and skips the import entirely on reduced-motion or lower-power devices.

### Where Spark Plugs In

- `src/scene/future/SparkSplatStage.tsx` is the placeholder for future Spark `SplatScene` or `SplatMesh` rendering.
- `src/scene/future/useSparkPreviewManifest.ts` loads a lightweight preview manifest now so the environment adapter path can be exercised before a real Spark runtime is added.
- `public/future/splats/highlandxr-campus.json` is the first preview manifest in the asset pipeline.
- `src/scene/environments/SparkPreviewEnvironment.tsx` is the first adapter-ready environment module for a Spark-backed version.
- Replace or augment `abstractHighlandsEnvironment` in `src/scene/environments/AbstractHighlandsEnvironment.tsx` when the first splat-backed environment is ready.
- Keep the `EnvironmentModule` contract in `src/scene/types.ts` as the stable interface between the homepage shell and any future environment renderer.

### Where Marble Plugs In

- `src/scene/future/MarbleEnvironmentStage.tsx` is the insertion point for Marble-exported environments.
- `src/scene/environments/MarblePreviewEnvironment.tsx` is the first adapter-ready module for a Marble-backed scene.
- Use `environmentRegistry.ts` to swap the procedural phase-1 environment for a Marble-backed scene without rewriting the homepage layout.

### Where In-World UI Plugs In

- `WorldPanelAnchor` in `src/scene/types.ts` defines named 3D anchor points.
- `src/scene/future/WorldPanelLayer.tsx` now renders only lightweight in-scene markers.
- `src/scene/future/WorldPanelOverlay.tsx` renders the anchored HTML panels outside the canvas, which keeps the scene layer lighter and removes the need for `@react-three/drei`.

## Archive Content

- The old directory content is preserved as archive routes.
- Archive pages still read from `data/items.json`.
- The homepage and primary navigation no longer position HighlandXR as a directory-style portal.

## Next Implementation Phases

1. Replace the procedural hero environment with an adapter that can load a Spark splat scene or Marble-exported environment behind the existing `EnvironmentModule` boundary.
2. Introduce anchored in-world UI panels so selected content can move from DOM sections into spatial overlays.
3. Replace placeholder featured experiments with real case studies and optimize scene performance around actual environment assets.
