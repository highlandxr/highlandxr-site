import type { PageMetadata } from "@/app/types";
import { siteConfig } from "@/app/site";

function ensureTag<T extends HTMLElement>(selector: string, create: () => T) {
  const existing = document.head.querySelector<T>(selector);
  if (existing) {
    return existing;
  }

  const node = create();
  node.dataset.managedHead = "true";
  document.head.appendChild(node);
  return node;
}

export function buildCanonicalUrl(path: string) {
  if (path === "/") {
    return siteConfig.baseUrl;
  }

  return `${siteConfig.baseUrl}${path}`;
}

export function applyPageMetadata(metadata: PageMetadata) {
  document.title = metadata.title;

  const description = ensureTag("meta[name='description']", () => {
    const node = document.createElement("meta");
    node.name = "description";
    return node;
  });
  description.content = metadata.description;

  const canonical = ensureTag("link[rel='canonical']", () => {
    const node = document.createElement("link");
    node.rel = "canonical";
    return node;
  });
  canonical.href = buildCanonicalUrl(metadata.canonicalPath);

  const ogTitle = ensureTag("meta[property='og:title']", () => {
    const node = document.createElement("meta");
    node.setAttribute("property", "og:title");
    return node;
  });
  ogTitle.content = metadata.title;

  const ogDescription = ensureTag("meta[property='og:description']", () => {
    const node = document.createElement("meta");
    node.setAttribute("property", "og:description");
    return node;
  });
  ogDescription.content = metadata.description;

  const ogType = ensureTag("meta[property='og:type']", () => {
    const node = document.createElement("meta");
    node.setAttribute("property", "og:type");
    return node;
  });
  ogType.content = "website";

  const ogUrl = ensureTag("meta[property='og:url']", () => {
    const node = document.createElement("meta");
    node.setAttribute("property", "og:url");
    return node;
  });
  ogUrl.content = buildCanonicalUrl(metadata.canonicalPath);
}
