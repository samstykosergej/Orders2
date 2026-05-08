const CACHE = 'furbis-v2';
const FILES = ['./', './index.html', './logo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.url.includes('api.github.com')){e.respondWith(fetch(e.request));return;}
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(response => {
        if(response && response.status===200){
          const clone=response.clone();
          caches.open(CACHE).then(cache=>cache.put(e.request,clone));
        }
        return response;
      }).catch(()=>{
        if(e.request.mode==='navigate') return caches.match('./index.html');
      });
    })
  );
});
