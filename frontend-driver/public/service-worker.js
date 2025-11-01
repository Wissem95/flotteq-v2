// Service Worker pour FlotteQ Driver PWA
const CACHE_NAME = 'flotteq-driver-v1';
const API_CACHE_NAME = 'flotteq-driver-api-v1';

// Fichiers à mettre en cache (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciens caches
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Stratégie pour les API calls: Network First (avec fallback cache)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirstStrategy(request, API_CACHE_NAME)
    );
    return;
  }

  // Stratégie pour les assets statiques: Cache First (avec fallback network)
  event.respondWith(
    cacheFirstStrategy(request, CACHE_NAME)
  );
});

/**
 * Cache First Strategy
 * Idéal pour les assets statiques (CSS, JS, images)
 */
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);

    // Mettre en cache les réponses réussies
    if (response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Fetch error:', error);

    // Retourner une page offline si disponible
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    return new Response('Offline - Connexion requise', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

/**
 * Network First Strategy
 * Idéal pour les API calls (données fraîches prioritaires)
 */
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    // Essayer le réseau en premier
    const response = await fetch(request);

    // Mettre en cache les réponses réussies (GET uniquement)
    if (request.method === 'GET' && response.status === 200) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.warn('[SW] Network failed, trying cache:', request.url);

    // Fallback sur le cache si le réseau échoue
    const cached = await cache.match(request);

    if (cached) {
      console.log('[SW] Returning cached API response');
      return cached;
    }

    // Si pas de cache, retourner une erreur
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Connexion Internet requise'
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    });
  }
}

// Messages du client (pour forcer la mise à jour)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
