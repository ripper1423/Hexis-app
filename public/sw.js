// HEXIS -- Service Worker: notificaciones push
// (tambien se reutilizara para modo offline / PWA -- tarea #119)

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
