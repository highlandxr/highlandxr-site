#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [inputPath, outputPathArg] = process.argv.slice(2);

if (!inputPath) {
  console.error("Usage: node scripts/directory-from-submissions.mjs <submissions.json> [outputDir]");
  process.exit(1);
}

const outputDir = outputPathArg ?? path.join("src", "content", "directory", "drafts");

const toSlug = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const asArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const asBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "yes", "1"].includes(value.toLowerCase());
  return fallback;
};

const asDate = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const quote = (value) => JSON.stringify(String(value ?? ""));

const yamlField = (key, value) => {
  if (value === undefined || value === null || value === "") return "";

  if (Array.isArray(value)) {
    if (value.length === 0) return `${key}: []\n`;
    return `${key}:\n${value.map((item) => `  - ${quote(item)}`).join("\n")}\n`;
  }

  if (typeof value === "boolean") {
    return `${key}: ${value}\n`;
  }

  return `${key}: ${quote(value)}\n`;
};

const toFrontmatter = (submission) => {
  const name = submission.name ?? submission.title ?? "Untitled Listing";
  const categories = asArray(submission.categories);
  const tags = asArray(submission.tags);
  const sources = asArray(submission.internalSources ?? submission.sources ?? submission.sourceUrls);

  return (
    "---\n" +
    yamlField("name", name) +
    yamlField("town", submission.town ?? "Unknown") +
    yamlField("region", submission.region ?? "Highlands") +
    yamlField("isHighlandsBased", asBoolean(submission.isHighlandsBased, true)) +
    yamlField("servesHighlands", asBoolean(submission.servesHighlands, true)) +
    yamlField("categories", categories.length ? categories : ["Community"]) +
    yamlField("tags", tags) +
    yamlField("website", submission.website ?? "https://example.org") +
    yamlField("email", submission.email) +
    yamlField("phone", submission.phone) +
    yamlField("shortDescription", submission.shortDescription ?? submission.summary ?? "Draft listing from intake submission.") +
    yamlField("longDescription", submission.longDescription) +
    yamlField("featured", asBoolean(submission.featured, false)) +
    `lastVerified: ${asDate(submission.lastVerified)}\n` +
    yamlField("internalSources", sources) +
    "---\n\n" +
    "<!-- Draft generated from submissions JSON. Review before publishing. -->\n"
  );
};

const raw = await readFile(inputPath, "utf8");
const submissions = JSON.parse(raw.replace(/^\uFEFF/, ""));

if (!Array.isArray(submissions)) {
  console.error("Input JSON must be an array of submission objects.");
  process.exit(1);
}

await mkdir(outputDir, { recursive: true });

let created = 0;
for (const submission of submissions) {
  const name = submission.name ?? submission.title;
  if (!name) {
    console.warn("Skipping submission without a name/title.");
    continue;
  }

  const slug = toSlug(name);
  if (!slug) {
    console.warn(`Skipping submission with invalid slug seed: ${name}`);
    continue;
  }

  const content = toFrontmatter(submission);
  const outPath = path.join(outputDir, `${slug}.md`);
  await writeFile(outPath, content, "utf8");
  created += 1;
}

console.log(`Created ${created} draft entries in ${outputDir}`);
