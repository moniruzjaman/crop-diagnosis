// CABI Plant Detective — Service Worker v5
// Network-first strategy ensures users always get the latest version
// Cache is used as fallback when offline only
// API responses are NEVER cached to prevent stale diagnostic results

const CACHE_VERSION = 'cabi-v7-' + new Date().toISOString().slice(0, 10);
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/favicon.png",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/apple-touch-icon.png",
  "/pwa-512x512.png",
  "/cabi-logo.png",
  "/favicon.svg",
  "/manifest.json",
  // On-device ViT model for offline leaf-disease classification (Phase 1).
  // 22 MB — precaching it here means the model works on the very first
  // diagnosis attempt even if the user has never been online.
  "/models/crop_leaf_diseases_vit.onnx",
];

// Install — precache essential shell assets, then activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting(); // Activate new SW immediately without waiting
});

// Activate — delete ALL old caches (forces full cache refresh on every deploy)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim(); // Take control of all open pages immediately
});

// Fetch — network-first for everything, cache as fallback
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // ─── NEVER cache API requests ─────────────────────────────────────────
  // API responses (diagnose, feedback, analytics, presence) must always be
  // fresh. Stale diagnostic results could be harmful to farmers.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => new Response(JSON.stringify({ error: "Offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }))
    );
    return;
  }

  // For navigation requests (HTML pages) — always network first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response for offline fallback
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/index.html")))
    );
    return;
  }

  // For hashed Vite assets (e.g., /assets/index-abc12345.js) — cache-first with network fallback
  // These have content hashes, so cached version is always correct.
  // Regex matches both hex (8+ chars) and base64url hashes that Vite may generate.
  if (url.pathname.match(/\/assets\/[^/]+-[a-zA-Z0-9_-]{4,}\.(js|css|woff2?|png|jpg|jpeg|svg|webp|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // For the ViT ONNX model (22 MB) — cache-first so the second diagnosis
  // is instant. The model is versioned via the cache key, so a deploy with
  // a new model file is picked up on the next SW activate cycle.
  if (url.pathname === "/models/crop_leaf_diseases_vit.onnx") {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // For everything else (images, fonts, etc.) — network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
