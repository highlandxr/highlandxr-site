import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const outDir = resolve(root, "out");
const distDir = resolve(root, "dist");

if (!existsSync(outDir)) {
  throw new Error("Static export folder 'out' was not found. Run 'next build' before syncing.");
}

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
}

mkdirSync(distDir, { recursive: true });
cpSync(outDir, distDir, { recursive: true });

console.log("Synced static export from out/ to dist/ for Cloudflare Pages compatibility.");
