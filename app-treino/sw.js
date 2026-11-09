// Service worker do Caderno de Treino: mostra a notificação de fim de descanso enviada pelo servidor.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.titulo || 'Descanso acabou', {
    body: d.texto || 'Hora da próxima série.',
    tag: 'descanso',
    renotify: true,
    requireInteraction: false,
    vibrate: [300, 120, 300],
    icon: '/icon.png',
    badge: '/icon.png',
    data: { url: d.url || '/' },
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if ('focus' in c) return c.focus();
    return self.clients.openWindow(e.notification.data && e.notification.data.url || '/');
  }));
});
