// ── Cache names — bump the version to force a fresh install ──────────────────
const SHELL_CACHE = 'app-shell-v1';
const ASSET_CACHE = 'static-assets-v1';

// Extensions that Vite content-hashes — once cached they never go stale
const STATIC_EXTS = ['.js', '.css', '.woff', '.woff2', '.ttf', '.svg', '.png', '.ico', '.webp'];

function isHls(url) {
  return url.pathname.startsWith('/hls/');
}

function isStaticAsset(url) {
  return STATIC_EXTS.some((ext) => url.pathname.endsWith(ext));
}

// ── Install: precache the app shell so the UI loads from cache on next visit ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(['/'])),
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate: delete caches from previous SW versions ────────────────────────
self.addEventListener('activate', (event) => {
  const live = new Set([SHELL_CACHE, ASSET_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !live.has(k)).map((k) => caches.delete(k)))),
  );
  // Take control of all open tabs without a page reload
  self.clients.claim();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. HLS — live segments must always come from the network; never cache them
  if (isHls(url)) return;

  // 2. Cross-origin requests (CDN fonts, etc.) — let the browser handle normally
  if (url.origin !== self.location.origin) return;

  // 3. Vite static assets (JS/CSS/fonts/images) — cache-first
  //    Content-hashing means a changed file gets a new URL, so cached = immutable
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      }),
    );
    return;
  }

  // 4. Navigation requests (HTML) — network-first, stale shell as offline fallback
  //    This keeps index.html fresh on good connections while still loading
  //    the cached shell when the user is offline or on a flaky connection.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            // Refresh the cached shell with the latest HTML
            caches.open(SHELL_CACHE).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(async () => {
          // Offline: serve the cached shell so the app still loads
          const cached = await caches.match('/');
          return cached ?? Response.error();
        }),
    );
  }
});
