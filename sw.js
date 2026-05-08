
const CACHE='furbis-v3';

self.addEventListener('install',e=>{
 self.skipWaiting();
});

self.addEventListener('activate',e=>{
 self.clients.claim();
});
