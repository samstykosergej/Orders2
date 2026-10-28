const CACHE = 'furbis-v4';
const FILES = ['./', './index.html', './logo.png', './manifest.json'];

self.addEventListener('install', e => {
  // Каждый файл кэшируем отдельно: если одного нет, остальные всё равно сохранятся
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.allSettled(FILES.map(f => cache.add(f)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Сначала кэш (мгновенный запуск даже при плохом или пропавшем интернете),
// параллельно в фоне обновляем кэш — свежая версия подтянется при следующем запуске.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Синхронизация с облаком — всегда напрямую в сеть, без кэша
  if (url.hostname === 'api.github.com') return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });

    const refresh = fetch(req).then(resp => {
      if (resp && resp.status === 200 && (resp.type === 'basic' || resp.type === 'cors')) {
        cache.put(req, resp.clone());
      }
      return resp;
    }).catch(() => null);

    if (cached) {
      e.waitUntil(refresh); // обновление в фоне, не блокирует ответ
      return cached;
    }

    const resp = await refresh;
    if (resp) return resp;

    // Нет ни кэша, ни сети: для открытия страницы отдаём главный экран
    if (req.mode === 'navigate') {
      const home = (await cache.match('./index.html')) || (await cache.match('./'));
      if (home) return home;
    }
    return new Response('', { status: 504, statusText: 'Offline' });
  })());
});
