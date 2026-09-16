/* crop-doctor Service Worker — 100% offline after first visit */

const CACHE_NAME = 'crop-doctor-v1';
const OFFLINE_URL = '/index.html';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.webmanifest',
  '/robots.txt',
  '/404.html',
  '/privacy.html',
  '/about.html',
  '/netlify.toml',
  '/assets/icons/icon.svg',
  '/assets/icons/maskable-192.png',
  '/assets/icons/maskable-512.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/img/photo-01.svg',
  '/assets/img/photo-02.svg',
  '/assets/img/photo-03.svg',
  '/assets/img/photo-04.svg',
  '/assets/img/photo-05.svg',
  '/assets/img/photo-06.svg',
  '/assets/img/photo-07.svg',
  '/assets/img/photo-08.svg',
  '/assets/img/photo-09.svg',
  '/assets/img/photo-10.svg',
  '/assets/img/photo-11.svg',
  '/assets/img/og-image.svg',
  '/assets/img/screenshot-home.png',
  '/assets/img/screenshot-diagnosis.png',
  '/assets/img/screenshot-result.png',
  // Google Fonts
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap'
];

const FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap',
  'https://fonts.gstatic.com/s/notosansbengali/v25/lJwG-pwuc9SASdW67g8rl2f4lJTWjUwqmu9CaZv3mYU.woff2',
  'https://fonts.gstatic.com/s/notosansbengali/v25/lJwH-pwuc9SASdW67g8rl2f4lJTWjUwqmu9CaZv3mYU.woff2',
  'https://fonts.gstatic.com/s/inter/v19/UcCO3FwrK3iLTeHuS_fvQtMwMc3eYIvl.css'
];

// Install — cache everything
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS_TO_CACHE);
      await self.skipWaiting();
    })()
  );
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch — cache-first strategy (100% offline after first visit)
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (event.request.url.startsWith('http')) {
    const url = new URL(event.request.url);
    if (url.origin !== location.origin && !url.hostname.includes('fonts.')) {
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version immediately
      if (cachedResponse) {
        // Also try to update cache in background
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          }).catch(() => {
            // Network failed — serve from cache (offline mode)
          })
        );
        return cachedResponse;
      }

      // Not in cache — try network
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 &&
            networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Completely offline — return fallback
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        // Return a transparent pixel for images
        if (event.request.destination === 'image') {
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230a3d1f"/><text x="100" y="100" font-family="sans-serif" font-size="14" fill="%23fff" text-anchor="middle">Image unavailable offline</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      });
    })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle push notifications (future)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body || 'নতুন আপডেট প্রয়োজন হতে পারে',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    tag: data.tag || 'crop-doctor-notification',
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(data.title || 'Crop Doctor', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data.url));
});
