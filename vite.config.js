import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// ─── Vercel CDN Fix: Remove crossorigin from built HTML ─────────────────────
//
// PROBLEM: Vite 5 adds `crossorigin` to <script type="module"> and
// <link rel="stylesheet"> during its HTML generation. On Vercel's CDN,
// this causes CORS failures → CSS 404 → blank page.
//
// SOLUTION: Triple-layer defense:
//   Layer 1 — build.modulePreload: false  → prevents preload links with crossorigin
//   Layer 2 — transformIndexHtml (enforce:'post') → removes crossorigin from in-memory HTML
//   Layer 3 — writeBundle hook → removes crossorigin from index.html on disk
//
// We KEEP crossorigin on <link rel="preconnect"> for Google Fonts (it's required).
// We REMOVE crossorigin from <script> and <link rel="stylesheet"> only.

function stripCrossoriginFromScriptsAndStyles(html) {
  // Remove crossorigin from <script type="module"> tags
  // e.g. <script type="module" crossorigin src="..."> → <script type="module" src="...">
  html = html.replace(
    /(<script\b[^>]*?)\s+crossorigin(?:\s*=\s*(?:"[^"]*"|'[^']*'))?([^>]*?>)/gi,
    "$1$2"
  );
  // Remove crossorigin from <link rel="stylesheet"> tags ONLY
  // (keep crossorigin on <link rel="preconnect"> for Google Fonts — it's required)
  html = html.replace(
    /(<link\b[^>]*?rel\s*=\s*(?:"stylesheet"|'stylesheet')[^>]*?)\s+crossorigin(?:\s*=\s*(?:"[^"]*"|'[^']*'))?([^>]*?(?:\/>|>))/gi,
    "$1$2"
  );
  return html;
}

function removeCrossoriginPlugin() {
  return {
    name: "remove-crossorigin-triple",
    enforce: "post",

    // Layer 2: In-memory HTML transformation (runs during Vite build pipeline)
    transformIndexHtml(html) {
      return stripCrossoriginFromScriptsAndStyles(html);
    },

    // Layer 3: Post-write file system cleanup (runs after all files are written to disk)
    writeBundle(options) {
      const outDir = options.dir || "dist";
      const htmlPath = resolve(outDir, "index.html");
      try {
        let html = readFileSync(htmlPath, "utf-8");
        const cleaned = stripCrossoriginFromScriptsAndStyles(html);
        if (cleaned !== html) {
          writeFileSync(htmlPath, cleaned, "utf-8");
          console.log("[remove-crossorigin] ✅ Stripped crossorigin from dist/index.html");
        } else {
          console.log("[remove-crossorigin] ✅ No crossorigin in dist/index.html (already clean)");
        }
      } catch (e) {
        console.warn("[remove-crossorigin] Could not post-process index.html:", e.message);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), removeCrossoriginPlugin()],

  build: {
    outDir: "dist",
    sourcemap: false,
    cssCodeSplit: true,
    // Layer 1: Disable module preload polyfill — prevents Vite from generating
    // <link rel="modulepreload"> tags with crossorigin attributes
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },

  server: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: "all",
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
