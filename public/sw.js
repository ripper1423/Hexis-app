// HEXIS -- Service Worker: notificaciones push
// (tambien se reutilizara para modo offline / PWA -- tarea #119)

// --- Modo offline (PWA) -- tarea #119 ---
// Estrategia conservadora: nunca cachea el HTML como fuente principal (siempre red primero,
// cache solo como respaldo si no hay conexion), y cachea para siempre los archivos estaticos
// con hash en el nombre (nunca cambian de contenido bajo el mismo nombre, cero riesgo de
// servir una version vieja). Todo lo demas (API, Supabase, imagenes externas) pasa de largo.
const HEXIS_CACHE = 'hexis-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== HEXIS_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navegacion (index.html / rutas de la SPA): red primero, cache solo si no hay conexion.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(HEXIS_CACHE).then((c) => c.put('/', copy));
        return res;
      }).catch(() => caches.match('/'))
    );
    return;
  }

  // Assets estaticos con hash (CRA /static/): cache-first, son inmutables por nombre.
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(HEXIS_CACHE).then((c) => c.put(req, copy));
          return res;
        });
      })
    );
  }
});


self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = { title: 'HEXIS', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'HEXIS';
  const options = {
    body: data.body || '',
    icon: data.icon || '/logo/hexis_logo.jpg',
    badge: data.badge || '/logo/hexis_logo.jpg',
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
