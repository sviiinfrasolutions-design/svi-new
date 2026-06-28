// SVI Infra Solutions — Service Worker v1
// Caching strategies: network-first (nav), cache-first (static), stale-while-revalidate (images)

const CACHE_VERSION = 1;
const STATIC_CACHE = `svi-static-v${CACHE_VERSION}`;
const IMAGE_CACHE = `svi-images-v${CACHE_VERSION}`;
const NAV_CACHE = `svi-navigation-v${CACHE_VERSION}`;
const OFFLINE_URL = '/offline';

// ── Install ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        OFFLINE_URL,
        '/about',
        '/contact',
        '/blog',
        '/projects',
        '/projects/current',
        '/projects/completed',
        '/faq',
        '/calculators',
        '/privacy-policy',
        '/terms-conditions',
        '/manifest.json',
        '/logo.png',
      ]);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('svi-') && k !== STATIC_CACHE && k !== IMAGE_CACHE && k !== NAV_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ───────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  // Cross-origin images: stale-while-revalidate
  if (url.origin !== location.origin && request.destination === 'image') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Same-origin only past this point
  if (url.origin !== location.origin) return;

  // Navigation: network-first → cache → offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNav(request));
    return;
  }

  // Images: cache-first
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Static assets (JS, CSS, fonts)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    /\.(js|css|woff2?|ttf|eot)$/i.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // API routes: network-only, don't cache dynamic data
  if (url.pathname.startsWith('/api/')) return;

  // Default: network-first (other pages)
  event.respondWith(networkFirstNav(request));
});

// ── Strategies ──────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const fallback = await caches.match(OFFLINE_URL);
    return fallback ?? new Response('Offline', { status: 503 });
  }
}

async function networkFirstNav(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(NAV_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline ?? new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached ?? fetchPromise;
}
