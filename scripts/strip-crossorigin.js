#!/usr/bin/env node
// ─── Layer 4: Post-build crossorigin removal ───────────────────────────────
// This script runs AFTER `vite build` as a final safety net.
// It reads dist/index.html and removes crossorigin from <script> and
// <link rel="stylesheet"> tags. This ensures that even if Vite's plugin
// hooks don't fire correctly on Vercel's build system, the output is clean.
// We KEEP crossorigin on <link rel="preconnect"> for Google Fonts.

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, "..", "dist", "index.html");

function stripCrossorigin(html) {
  // Remove crossorigin from <script> tags
  html = html.replace(
    /(<script\b[^>]*?)\s+crossorigin(?:\s*=\s*(?:"[^"]*"|'[^']*'))?([^>]*?>)/gi,
    "$1$2"
  );
  // Remove crossorigin from <link rel="stylesheet"> tags ONLY
  html = html.replace(
    /(<link\b[^>]*?rel\s*=\s*(?:"stylesheet"|'stylesheet')[^>]*?)\s+crossorigin(?:\s*=\s*(?:"[^"]*"|'[^']*'))?([^>]*?(?:\/>|>))/gi,
    "$1$2"
  );
  return html;
}

try {
  let html = readFileSync(htmlPath, "utf-8");
  const original = html;
  html = stripCrossorigin(html);

  if (html !== original) {
    writeFileSync(htmlPath, html, "utf-8");
    console.log("[strip-crossorigin] Stripped crossorigin from dist/index.html");
  } else {
    console.log("[strip-crossorigin] dist/index.html is clean (no crossorigin on script/stylesheet)");
  }
} catch (e) {
  console.warn("[strip-crossorigin] Warning:", e.message);
  process.exit(0); // Don't fail the build
}
