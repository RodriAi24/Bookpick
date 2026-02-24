const CACHE_NAME = 'bookpick-v10-cache'; // El cambio de nombre obliga a borrar el caché viejo
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png'
];

// Instala el Service Worker y guarda la primera copia
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Fuerza al nuevo SW a tomar el control al instante
});

// Limpia los cachés viejos (el de la v9)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ESTRATEGIA: Network First (Internet primero, Caché como respaldo)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si hay internet y carga bien, guardamos una copia fresca en el caché
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si no hay internet (el fetch falla), te salvamos con la copia del caché
        return caches.match(event.request);
      })
  );
});
});
