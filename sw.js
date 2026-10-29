// Ortak servis çalışanı: uygulama kapalıyken gelen bildirimleri gösterir.
// Gövde: { title, body, url, tag } (url, uygulama köküne göre: "group/<id>?tab=chat")
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }
  const scope = self.registration.scope; // ör. https://bastugu.github.io/ortak/
  event.waitUntil(
    self.registration.showNotification(data.title || 'Ortak', {
      body: data.body || 'Yeni mesaj',
      tag: data.tag, // aynı gruptan gelenler üst üste yığılmaz, sonuncusu görünür
      renotify: !!data.tag,
      icon: scope + 'icon-192.png',
      badge: scope + 'icon-192.png',
      lang: 'tr',
      data: { url: scope + (data.url || '') },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil(
    (async () => {
      const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const w of wins) {
        if (w.url.startsWith(self.registration.scope) && 'focus' in w) {
          await w.focus();
          if ('navigate' in w) await w.navigate(url).catch(() => {});
          return;
        }
      }
      await self.clients.openWindow(url);
    })(),
  );
});
