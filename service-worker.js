// service-worker.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const {core, routing, strategies, precaching, backgroundSync} = workbox;
const {setCacheNameDetails, clientsClaim, skipWaiting} = core;
const {registerRoute} = routing;
const {CacheFirst, NetworkFirst} = strategies;
const {PrecacheController} = precaching;
const {BackgroundSyncPlugin} = backgroundSync;

// Configure cache names
setCacheNameDetails({
  prefix: 'pwa',
  suffix: 'v1',
  precache: 'static',
  runtime: 'dynamic'
});

// Skip waiting and claim clients for immediate updates
skipWaiting();
clientsClaim();

// Precaching configuration
const precacheController = new PrecacheController();
precacheController.addToCacheList([
  {url: '/', revision: '1'},
  {url: '/index.html', revision: '1'},
  {url: '/offlineService.js', revision: '1'},
  // Add other static assets to precache here
  ...self.__WB_MANIFEST || []
]);

// Install event - precache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    precacheController.install(event)
      .then(() => console.log('Precaching completed'))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('pwa-') && !cacheName.includes('v1')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Activation completed');
      return self.clients.claim();
    })
  );
});

// Background Sync setup
const bgSyncPlugin = new BackgroundSyncPlugin('sync-tasks', {
  maxRetentionTime: 24 * 60 // Retry for up to 24 hours
});

// Cache-first strategy for static assets
registerRoute(
  ({request}) => {
    return [
      'style',
      'script',
      'worker',
      'image',
      'font'
    ].includes(request.destination) || 
    request.url.match(/\.(css|js|woff2|png|jpg|jpeg|svg|gif|ico)$/);
  },
  new CacheFirst({
    cacheName: 'pwa-static-v1',
    plugins: [
      {
        cacheKeyWillBeUsed: ({request}) => {
          console.log(`CacheFirst: ${request.url}`);
          return request.url;
        },
        cachedResponseWillBeUsed: ({cachedResponse}) => {
          if (cachedResponse) {
            console.log('Cache hit');
          } else {
            console.log('Cache miss');
          }
          return cachedResponse;
        }
      }
    ]
  })
);

// Network-first strategy for dynamic content
registerRoute(
  ({request}) => request.destination === 'document' || 
                 request.url.match(/\.(html|json)$/),
  new NetworkFirst({
    cacheName: 'pwa-dynamic-v1',
    networkTimeoutSeconds: 3,
    plugins: [
      {
        handlerDidError: async ({request}) => {
          console.log(`Network failed for: ${request.url}`);
          const cache = await caches.open('pwa-dynamic-v1');
          const cachedResponse = await cache.match(request);
          return cachedResponse || caches.match('/index.html');
        }
      }
    ]
  })
);

// Background sync for POST requests
registerRoute(
  ({request}) => request.method === 'POST',
  new NetworkFirst({
    cacheName: 'pwa-dynamic-v1',
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

// Fallback to index.html for SPA routing
registerRoute(
  ({url}) => url.pathname.startsWith('/app') || 
             !url.pathname.includes('.'),
  new NetworkFirst({
    cacheName: 'pwa-dynamic-v1',
    networkTimeoutSeconds: 3,
    plugins: [
      {
        handlerDidError: async () => {
          return await caches.match('/index.html');
        }
      }
    ]
  })
);

// Log all fetch events for debugging
self.addEventListener('fetch', (event) => {
  console.log(`Fetch: ${event.request.url}`);
});

// Message handler for communication with offlineService.js
self.addEventListener('message', (event) => {
  if (event.data.type === 'TRIGGER_SYNC') {
    self.registration.sync.register('sync-tasks')
      .then(() => console.log('Sync registered'))
      .catch(err => console.error('Sync registration failed:', err));
  }
});