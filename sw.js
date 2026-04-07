/* ═══════════════════════════════════════════════════════
   Udyami Vikas — Service Worker v1
   Cache-first strategy · Offline support
═══════════════════════════════════════════════════════ */

const CACHE_NAME = 'udyami-vikas-v1';

const PRECACHE_ASSETS = [
  './app.html',
  './manifest.json',
  './icon.svg',
  './gr_signup.html',
  './io_form_v12.html',
  './io_dashboard_v7.html',
  './udyami_vikas_dashboard (3).html',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Open+Sans:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js',
];

/* ── INSTALL: pre-cache all assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url => cache.add(url).catch(() => null))
      );
    }).then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: clear old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH: cache-first, network fallback ── */
self.addEventListener('fetch', event => {
  // Skip non-GET and chrome-extension requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Cache successful responses (not opaque ones from external CDNs for safety)
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback → serve app shell
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./app.html');
        }
      });
    })
  );
});

/* ── BACKGROUND SYNC (future) ── */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-form-data') {
    // Placeholder for future server sync
    console.log('[SW] Background sync triggered:', event.tag);
  }
});
