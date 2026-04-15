import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const distDir = resolve(root, "dist");
const ssrDir = resolve(root, ".ssr");
const manifestPath = resolve(distDir, ".vite", "manifest.json");
const serverEntryPath = resolve(ssrDir, "entry-server.js");

if (!existsSync(manifestPath)) {
  throw new Error("Client manifest not found. Run the Vite client build before prerendering.");
}

if (!existsSync(serverEntryPath)) {
  throw new Error("SSR entry bundle not found. Run the Vite SSR build before prerendering.");
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const entry = manifest["index.html"];

if (!entry) {
  throw new Error("Manifest entry for index.html was not found.");
}

const serverModule = await import(pathToFileURL(serverEntryPath).href);
const routes = serverModule.getPrerenderRoutes();

function assetPath(file) {
  return file.startsWith("/") ? file : `/${file}`;
}

function collectImports(chunk, seen = new Set()) {
  if (!chunk?.imports) {
    return [];
  }

  const assets = [];

  for (const importKey of chunk.imports) {
    if (seen.has(importKey)) {
      continue;
    }

    seen.add(importKey);
    const importedChunk = manifest[importKey];

    if (!importedChunk) {
      continue;
    }

    assets.push(importedChunk.file);
    assets.push(...collectImports(importedChunk, seen));
  }

  return assets;
}

const preloadAssets = [...new Set(collectImports(entry))];
const cssAssets = [...new Set(entry.css ?? [])];

function buildDocument({ appHtml, metadata }) {
  const canonicalUrl = metadata.canonicalPath === "/" ? "https://highlandxr.com" : `https://highlandxr.com${metadata.canonicalPath}`;
  const preloadTags = preloadAssets
    .map((file) => `<link rel="modulepreload" crossorigin href="${assetPath(file)}" />`)
    .join("\n    ");
  const cssTags = cssAssets.map((file) => `<link rel="stylesheet" href="${assetPath(file)}" />`).join("\n    ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#030507" />
    <meta name="description" content="${escapeHtml(metadata.description)}" />
    <meta property="og:title" content="${escapeHtml(metadata.title)}" />
    <meta property="og:description" content="${escapeHtml(metadata.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <title>${escapeHtml(metadata.title)}</title>
    ${preloadTags}
    ${cssTags}
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script type="module" crossorigin src="${assetPath(entry.file)}"></script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function routeToFile(route) {
  if (route === "/") {
    return resolve(distDir, "index.html");
  }

  return resolve(distDir, route.replace(/^\//, ""), "index.html");
}

for (const route of routes) {
  const rendered = serverModule.render(route);
  const outputPath = routeToFile(route);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, buildDocument(rendered));
}

const notFoundPage = serverModule.render("/not-found");
writeFileSync(resolve(distDir, "404.html"), buildDocument(notFoundPage));

const sitemapEntries = routes.map((route) => {
  const url = route === "/" ? "https://highlandxr.com/" : `https://highlandxr.com${route}`;
  return `  <url><loc>${url}</loc></url>`;
});

writeFileSync(
  resolve(distDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join("\n")}
</urlset>`
);
