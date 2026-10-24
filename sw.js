const CACHE = 'furbis-v3';
const FILES = ['./', './index.html', './logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

// Сначала сеть (всегда свежая версия), кэш — только когда нет интернета
self.addEventListener('fetch', e => {
  if(e.request.method!=='GET') return;
  if(e.request.url.includes('api.github.com')){e.respondWith(fetch(e.request));return;}
  e.respondWith(
    fetch(e.request, {cache:'no-cache'}).then(response => {
      if(response && response.status===200){
        const clone=response.clone();
        caches.open(CACHE).then(cache=>cache.put(e.request,clone));
      }
      return response;
    }).catch(()=>
      caches.match(e.request).then(cached => {
        if(cached) return cached;
        if(e.request.mode==='navigate') return caches.match('./index.html');
      })
    )
  );
});
