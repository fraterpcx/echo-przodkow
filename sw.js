// Echo Przodków – Service Worker v1.0
const CACHE = 'echo-przodkow-v1';
const PRECACHE = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  if(e.request.url.includes('firebasedatabase') || e.request.url.includes('googleapis.com/identitytoolkit')) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// ── PUSH NOTIFICATIONS ──
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data.json(); } catch(_) { data = { notification:{ title:'Echo Przodków', body: e.data?.text()||'' }}; }
  const { title='Echo Przodków', body='Nowe powiadomienie', icon='/icon-192.png' } = data.notification || {};
  e.waitUntil(
    self.registration.showNotification(title, {
      body, icon,
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: '/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
      if(list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});
